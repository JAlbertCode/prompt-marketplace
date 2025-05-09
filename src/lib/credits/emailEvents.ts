// src/lib/credits/emailEvents.ts
import { prisma } from '@/lib/db';
import { addCredits } from '@/lib/credits';
import { trackEvent } from '@/lib/email/brevo';

/**
 * Purchase credits and trigger email notification
 */
export async function purchaseCreditsWithTracking(
  userId: string,
  bundleId: string,
  amount: number,
  totalCredits: number
): Promise<boolean> {
  try {
    // 1. Process the actual credit purchase using the existing function
    const bucket = await addCredits(
      userId,
      totalCredits,
      'purchased',
      `purchase_${bundleId}`
    );
    
    // 2. Track the event for email automation
    const user = await prisma.user.findUnique({ 
      where: { id: userId }
    });
    
    if (user?.email) {
      await trackEvent(user.email, 'credits_purchased', {
        AMOUNT_SPENT: amount,
        BUNDLE_ID: bundleId,
        CREDITS_ADDED: totalCredits,
        TOTAL_CREDITS: totalCredits // This should be the new total after purchase
      });
      
      console.log(`Credit purchase event tracked for user ${userId}`);
    }
    
    return !!bucket;
  } catch (error) {
    console.error('Error purchasing credits with tracking:', error);
    return false;
  }
}

/**
 * Track event when a user creates their first prompt
 */
export async function trackPromptCreation(
  userId: string,
  promptId: string,
  promptTitle: string,
  isFirstPrompt: boolean = false
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user?.email) {
      console.warn(`Cannot track prompt creation: User ${userId} has no email`);
      return false;
    }
    
    const eventName = isFirstPrompt ? 'first_prompt_created' : 'prompt_created';
    
    await trackEvent(user.email, eventName, {
      PROMPT_ID: promptId,
      PROMPT_TITLE: promptTitle,
      TIMESTAMP: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error tracking prompt creation:', error);
    return false;
  }
}

/**
 * Track event when a user creates their first flow
 */
export async function trackFlowCreation(
  userId: string,
  flowId: string,
  flowTitle: string,
  isFirstFlow: boolean = false
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user?.email) {
      console.warn(`Cannot track flow creation: User ${userId} has no email`);
      return false;
    }
    
    const eventName = isFirstFlow ? 'first_flow_created' : 'flow_created';
    
    await trackEvent(user.email, eventName, {
      FLOW_ID: flowId,
      FLOW_TITLE: flowTitle,
      TIMESTAMP: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error tracking flow creation:', error);
    return false;
  }
}

/**
 * Check if this is user's first prompt and track appropriately
 */
export async function trackUserPromptCreation(
  userId: string,
  promptId: string,
  promptTitle: string
): Promise<void> {
  try {
    // Count existing prompts from this user
    const promptCount = await prisma.prompt.count({
      where: {
        userId,
        creatorId: userId // Only count prompts they created, not ones they're using
      }
    });
    
    // If this is their first prompt, track it as a special event
    const isFirstPrompt = promptCount === 1; // If count is 1, this new prompt is their first
    
    await trackPromptCreation(userId, promptId, promptTitle, isFirstPrompt);
  } catch (error) {
    console.error('Error in trackUserPromptCreation:', error);
  }
}

/**
 * Check if this is user's first flow and track appropriately
 */
export async function trackUserFlowCreation(
  userId: string,
  flowId: string,
  flowTitle: string
): Promise<void> {
  try {
    // Count existing flows from this user
    const flowCount = await prisma.promptFlow.count({
      where: {
        userId,
        creatorId: userId // Only count flows they created, not ones they're using
      }
    });
    
    // If this is their first flow, track it as a special event
    const isFirstFlow = flowCount === 1; // If count is 1, this new flow is their first
    
    await trackFlowCreation(userId, flowId, flowTitle, isFirstFlow);
  } catch (error) {
    console.error('Error in trackUserFlowCreation:', error);
  }
}
