// src/lib/flows.ts
import { prisma } from '@/lib/db';
import { Flow } from '@/types/flow';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Session } from 'next-auth';
import { trackUserFlowCreation } from '@/lib/credits/emailEvents';

/**
 * Get all flows with filtering options
 */
export async function getFlows(filters: any = {}, sort = 'newest'): Promise<Flow[]> {
  // Implementation of getFlows...
  // This would be the existing function
  return [];
}

/**
 * Get favorite flows for the current user
 */
export async function getFavoriteFlows(session?: Session | null): Promise<Flow[]> {
  // If no session provided, try to get it
  if (!session) {
    session = await getServerSession(authOptions);
  }
  
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  
  const userId = session.user.id;
  
  // Get favorites using the Prisma client
  const favorites = await prisma.favorite.findMany({
    where: {
      userId,
      flowId: { not: null }, // Only get flow favorites
    },
    include: {
      flow: {
        include: {
          creator: { select: { name: true, id: true } },
          steps: true,
          favorites: { where: { userId }, select: { id: true } },
        },
      },
    },
  });
  
  // Format the flows for the frontend
  return favorites
    .filter((fav) => fav.flow !== null) // Filter out null flows
    .map((fav) => ({
      id: fav.flow!.id,
      title: fav.flow!.title,
      description: fav.flow!.description || '',
      author: fav.flow!.creator?.name || 'Unknown',
      authorId: fav.flow!.creator?.id,
      steps: fav.flow!.steps.map(step => ({
        id: step.id,
        name: step.title || `Step ${step.order}`,
        order: step.order,
      })),
      isFavorite: true, // It's a favorite by definition
      totalCreditCost: fav.flow!.totalCreditCost,
      unlockPrice: fav.flow!.unlockPrice,
      createdAt: fav.createdAt.toISOString(),
      isPrivate: fav.flow!.isPrivate,
    }));
}

/**
 * Toggle favorite status for a flow
 */
export async function toggleFavoriteFlow(flowId: string): Promise<{ isFavorite: boolean }> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  
  const userId = session.user.id;
  
  // Check if favorite already exists
  const existingFavorite = await prisma.favorite.findFirst({
    where: {
      userId,
      flowId,
    },
  });
  
  // Toggle favorite
  if (existingFavorite) {
    // Remove favorite
    await prisma.favorite.delete({
      where: {
        id: existingFavorite.id,
      },
    });
    
    return { isFavorite: false };
  } else {
    // Add favorite
    await prisma.favorite.create({
      data: {
        userId,
        flowId,
      },
    });
    
    return { isFavorite: true };
  }
}

/**
 * Create a new flow with email event tracking
 */
export async function createFlow(flowData: any, userId: string) {
  // Create the flow in the database
  const flow = await prisma.promptFlow.create({
    data: {
      ...flowData,
      userId,
      creatorId: userId // Set as both the creator and owner
    }
  });
  
  // Track the flow creation event for email automation
  // Only do this if we have a valid flow and it was successfully created
  if (flow && flow.id && process.env.BREVO_API_KEY) {
    try {
      await trackUserFlowCreation(
        userId,
        flow.id,
        flow.title
      );
    } catch (error) {
      console.error('Error tracking flow creation:', error);
      // Don't throw error - this is a non-critical operation
    }
  }
  
  return flow;
}

/**
 * Update an existing flow
 */
export async function updateFlow(flowId: string, flowData: any) {
  return await prisma.promptFlow.update({
    where: { id: flowId },
    data: flowData
  });
}

/**
 * Delete a flow
 */
export async function deleteFlow(flowId: string) {
  return await prisma.promptFlow.delete({
    where: { id: flowId }
  });
}

/**
 * Get a specific flow by ID
 */
export async function getFlowById(flowId: string) {
  return await prisma.promptFlow.findUnique({
    where: { id: flowId },
    include: {
      creator: { select: { id: true, name: true, image: true } },
      steps: {
        include: {
          prompt: true
        },
        orderBy: {
          order: 'asc'
        }
      }
    }
  });
}

/**
 * Check if a user has unlocked a specific flow
 */
export async function hasUnlockedFlow(flowId: string, userId: string): Promise<boolean> {
  const unlock = await prisma.flowUnlock.findFirst({
    where: {
      flowId,
      userId
    }
  });
  
  return !!unlock;
}

/**
 * Unlock a flow for a user (by purchasing it)
 */
export async function unlockFlow(flowId: string, userId: string, creditCost: number): Promise<boolean> {
  // First check if the user has already unlocked this flow
  const existingUnlock = await prisma.flowUnlock.findFirst({
    where: {
      flowId,
      userId
    }
  });
  
  if (existingUnlock) {
    // Already unlocked, no need to pay again
    return true;
  }
  
  // Create the unlock record
  try {
    await prisma.flowUnlock.create({
      data: {
        userId,
        flowId,
        credits: creditCost
      }
    });
    
    // Record the credit transaction
    await prisma.creditTransaction.create({
      data: {
        userId,
        amount: -creditCost, // Negative amount for a deduction
        description: `Unlocked flow: ${flowId}`,
        type: 'flow_unlock',
        flowId,
        itemType: 'flow',
        itemId: flowId
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error unlocking flow:', error);
    return false;
  }
}
