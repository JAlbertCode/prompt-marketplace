// src/lib/events.ts
import { trackEvent } from '@/lib/email/brevo';
import { prisma } from '@/lib/db';

// Event types
export type UserEventType = 
  | 'account_created'
  | 'credits_purchased'
  | 'prompt_created'
  | 'prompt_executed' 
  | 'flow_created'
  | 'flow_executed';

/**
 * Track a user event and trigger corresponding email automation
 */
export async function trackUserEvent(
  email: string,
  eventType: UserEventType,
  properties: Record<string, any> = {}
): Promise<boolean> {
  try {
    // Track in Brevo automation system
    await trackEvent(email, eventType, properties);
    
    // Also log in database for internal analytics
    // This could be extended to also log to other systems
    await logEventToDatabase(email, eventType, properties);
    
    return true;
  } catch (error) {
    console.error(`Error tracking user event ${eventType}:`, error);
    return false;
  }
}

/**
 * Log event to database for internal analytics
 */
async function logEventToDatabase(
  email: string,
  eventType: UserEventType,
  properties: Record<string, any> = {}
): Promise<void> {
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.warn(`Cannot log event: User with email ${email} not found`);
      return;
    }
    
    // Create a credit transaction as an event log
    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        amount: 0, // No credits added or deducted
        description: `Event: ${eventType}`,
        type: 'event',
        itemType: eventType,
        // Add any additional properties as metadata
        // For example properties could contain promptId or flowId
        promptId: properties.promptId,
        flowId: properties.flowId,
        modelId: properties.modelId,
      }
    });
  } catch (error) {
    console.error(`Error logging event to database: ${error}`);
  }
}
