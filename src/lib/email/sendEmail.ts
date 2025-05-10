/**
 * Email Sending Utilities
 * 
 * This file provides a simplified interface for sending emails
 * using the Brevo API integration.
 */

import { sendTransactionalEmail } from './brevo';

export interface EmailParams {
  to: string | string[];
  templateId?: number;
  params?: Record<string, any>;
  subject?: string;
  htmlContent?: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
}

/**
 * Send an email using Brevo
 * @param params Email parameters
 * @returns Promise with API response
 */
export async function sendEmail(params: EmailParams): Promise<any> {
  // Convert simple parameters to Brevo's format
  const recipients = Array.isArray(params.to) 
    ? params.to.map(email => ({ email }))
    : [{ email: params.to }];
    
  const cc = params.cc?.map(email => ({ email }));
  const bcc = params.bcc?.map(email => ({ email }));
  const replyTo = params.replyTo ? { email: params.replyTo } : undefined;
  
  return await sendTransactionalEmail({
    to: recipients,
    templateId: params.templateId,
    params: params.params,
    subject: params.subject,
    htmlContent: params.htmlContent,
    cc,
    bcc,
    replyTo
  });
}

/**
 * Track an event for a contact
 * This is a functionality needed for email marketing automation
 */
export async function trackEvent(
  email: string,
  eventName: string,
  properties: Record<string, any> = {}
): Promise<boolean> {
  // Log the tracking attempt
  console.log(`[EVENT TRACKING] ${eventName} for ${email}:`, properties);
  
  // In a real implementation, this would use Brevo's marketing automation
  // For now, we'll just log and return true as if it succeeded
  return true;
}
