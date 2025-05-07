// src/lib/prompts.ts
import { db } from '@/lib/db';
import { Prompt } from '@/types/prompt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Session } from 'next-auth';

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
  const favorites = await db.favorite.findMany({
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
  const existingFavorite = await db.favorite.findFirst({
    where: {
      userId,
      promptId,
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
        promptId,
      },
    });
    
    return { isFavorite: true };
  }
}
