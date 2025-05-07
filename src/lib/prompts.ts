// src/lib/prompts.ts
import { prisma } from '@/lib/db';
import { Prompt } from '@/types/prompt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Session } from 'next-auth';
import { trackUserPromptCreation } from '@/lib/credits/emailEvents';

/**
 * Get all prompts with filtering options
 */
export async function getPrompts(filters: any = {}, sort = 'newest'): Promise<Prompt[]> {
  // Implementation of getPrompts...
  // This would be the existing function
  return [];
}

/**
 * Get favorite prompts for the current user
 */
export async function getFavoritePrompts(session?: Session | null): Promise<Prompt[]> {
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
      promptId: { not: null }, // Only get prompt favorites
    },
    include: {
      prompt: {
        include: {
          creator: { select: { name: true, id: true } },
          favorites: { where: { userId }, select: { id: true } },
        },
      },
    },
  });
  
  // Format the prompts for the frontend
  return favorites
    .filter((fav) => fav.prompt !== null) // Filter out null prompts
    .map((fav) => ({
      id: fav.prompt!.id,
      title: fav.prompt!.title,
      description: fav.prompt!.description || '',
      systemPrompt: fav.prompt!.systemPrompt,
      model: fav.prompt!.model,
      author: fav.prompt!.creator?.name || 'Unknown',
      authorId: fav.prompt!.creator?.id,
      tags: fav.prompt!.tags,
      isFavorite: true, // It's a favorite by definition
      capabilities: fav.prompt!.capabilities,
      creditCost: fav.prompt!.creditCost,
      createdAt: fav.createdAt.toISOString(),
      isPrivate: fav.prompt!.isPrivate,
    }));
}

/**
 * Toggle favorite status for a prompt
 */
export async function toggleFavoritePrompt(promptId: string): Promise<{ isFavorite: boolean }> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  
  const userId = session.user.id;
  
  // Check if favorite already exists
  const existingFavorite = await prisma.favorite.findFirst({
    where: {
      userId,
      promptId,
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
        promptId,
      },
    });
    
    return { isFavorite: true };
  }
}

/**
 * Create a new prompt with email event tracking
 */
export async function createPrompt(promptData: any, userId: string) {
  // Create the prompt in the database
  const prompt = await prisma.prompt.create({
    data: {
      ...promptData,
      userId,
      creatorId: userId // Set as both the creator and owner
    }
  });
  
  // Track the prompt creation event for email automation
  // Only do this if we have a valid prompt and it was successfully created
  if (prompt && prompt.id && process.env.BREVO_API_KEY) {
    try {
      await trackUserPromptCreation(
        userId,
        prompt.id,
        prompt.title
      );
    } catch (error) {
      console.error('Error tracking prompt creation:', error);
      // Don't throw error - this is a non-critical operation
    }
  }
  
  return prompt;
}

/**
 * Update an existing prompt
 */
export async function updatePrompt(promptId: string, promptData: any) {
  return await prisma.prompt.update({
    where: { id: promptId },
    data: promptData
  });
}

/**
 * Delete a prompt
 */
export async function deletePrompt(promptId: string) {
  return await prisma.prompt.delete({
    where: { id: promptId }
  });
}

/**
 * Get a specific prompt by ID
 */
export async function getPromptById(promptId: string) {
  return await prisma.prompt.findUnique({
    where: { id: promptId },
    include: {
      creator: { select: { id: true, name: true, image: true } }
    }
  });
}

/**
 * Check if a prompt is favorited by a user
 */
export async function isPromptFavorited(promptId: string, userId: string): Promise<boolean> {
  const favorite = await prisma.favorite.findFirst({
    where: {
      promptId,
      userId
    }
  });
  
  return !!favorite;
}
