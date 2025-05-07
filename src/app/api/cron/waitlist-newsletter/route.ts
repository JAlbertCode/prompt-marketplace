// src/app/api/cron/waitlist-newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendTransactionalEmail } from '@/lib/email/brevo';

// Waitlist newsletter template ID in Brevo
const NEWSLETTER_TEMPLATE_ID = parseInt(process.env.BREVO_TEMPLATE_ID_NEWSLETTER || '2');

/**
 * Cron endpoint to send a scheduled newsletter to all waitlist subscribers
 * This endpoint should be triggered by a cron job service (Vercel Cron, etc.)
 */
export async function GET(request: NextRequest) {
  // Secure cron route with a token
  const authorization = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET_TOKEN;
  
  if (!cronSecret) {
    return NextResponse.json(
      { success: false, message: 'CRON_SECRET_TOKEN not configured' },
      { status: 500 }
    );
  }
  
  // Validate the authorization token
  if (authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    // Only attempt to send emails if Brevo is configured
    if (!process.env.BREVO_API_KEY) {
      return NextResponse.json(
        { success: false, message: 'BREVO_API_KEY not configured' },
        { status: 500 }
      );
    }
    
    // Get all waitlist subscribers
    const waitlistSubscribers = await prisma.waitlist.findMany({
      where: {
        // Only include non-notified subscribers if running as a launch announcement
        // For regular newsletters, remove this condition
        // isNotified: false
      }
    });
    
    if (waitlistSubscribers.length === 0) {
      return NextResponse.json(
        { success: true, message: 'No subscribers found' },
        { status: 200 }
      );
    }
    
    // Set up email content parameters
    const emailParams = {
      CURRENT_DATE: new Date().toLocaleDateString(),
      SUBSCRIBER_COUNT: waitlistSubscribers.length,
      PRODUCT_NAME: 'PromptFlow',
      PRODUCT_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://promptflow.io'
    };
    
    // Process subscribers in batches of 50 to avoid rate limits
    const batchSize = 50;
    const totalBatches = Math.ceil(waitlistSubscribers.length / batchSize);
    let successCount = 0;
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchStart = batchIndex * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, waitlistSubscribers.length);
      const batch = waitlistSubscribers.slice(batchStart, batchEnd);
      
      // Send emails and process results
      const sendPromises = batch.map(subscriber => 
        sendTransactionalEmail(
          subscriber.email,
          NEWSLETTER_TEMPLATE_ID,
          emailParams,
          undefined,
          ['waitlist', 'newsletter']
        )
      );
      
      const results = await Promise.allSettled(sendPromises);
      const batchSuccessCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
      successCount += batchSuccessCount;
      
      // Add a small delay between batches to avoid rate limits
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Mark subscribers as notified if this is a launch notification
    // For regular newsletters, you can skip this
    /*
    await prisma.waitlist.updateMany({
      where: {
        email: {
          in: waitlistSubscribers.map(s => s.email)
        }
      },
      data: {
        isNotified: true
      }
    });
    */
    
    return NextResponse.json({
      success: true,
      message: `Successfully sent newsletter to ${successCount} out of ${waitlistSubscribers.length} subscribers`
    });
    
  } catch (error) {
    console.error('Error sending waitlist newsletter:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
