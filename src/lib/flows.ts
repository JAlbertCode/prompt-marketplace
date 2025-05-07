// src/lib/flows.ts
import { db } from '@/lib/db';
import { Flow } from '@/types/flow';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Session } from 'next-auth';

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
  const favorites = await db.favorite.findMany({
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
  const existingFavorite = await db.favorite.findFirst({
    where: {
      userId,
      flowId,
    },
  });
  
  // Toggle favorite
  if (existingFavorite) {
    // Remove favorite
    await db.favorite.delete({
      where: {
        id: existingFavorite.id,
      },
    });
    
    return { isFavorite: false };
  } else {
    // Add favorite
    await db.favorite.create({
      data: {
        userId,
        flowId,
      },
    });
    
    return { isFavorite: true };
  }
}
