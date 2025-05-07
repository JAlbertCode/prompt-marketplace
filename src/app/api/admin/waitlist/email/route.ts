import { NextResponse } from 'next/server';
import { getWaitlistEntries } from '@/lib/waitlist';
import { sendTransactionalEmail } from '@/lib/email/brevo';

export async function POST(request: Request) {
  try {
    // Parse request body
    const { subject, template } = await request.json();
    
    // Validate inputs
    if (!subject || !template) {
      return NextResponse.json({
        success: false,
        message: 'Subject and template are required',
      }, { status: 400 });
    }
    
    // Get all waitlist emails
    const waitlistEntries = getWaitlistEntries();
    
    if (waitlistEntries.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No emails in waitlist',
      });
    }
    
    let successCount = 0;
    
    // Check if Brevo is configured
    if (process.env.BREVO_API_KEY) {
      // Send emails in batches to avoid rate limits
      const batchSize = 10;
      const totalEmails = waitlistEntries.length;
      
      for (let i = 0; i < totalEmails; i += batchSize) {
        const batch = waitlistEntries.slice(i, i + batchSize);
        
        // Send emails in parallel within each batch
        const batchPromises = batch.map(async (entry) => {
          try {
            // Replace template variables
            const personalizedContent = template
              .replace(/{{email}}/g, entry.email)
              .replace(/{{date}}/g, new Date().toLocaleDateString());
            
            await sendTransactionalEmail({
              to: [{ email: entry.email }],
              subject,
              htmlContent: personalizedContent,
            });
            
            return { success: true, email: entry.email };
          } catch (error) {
            console.error(`Error sending email to ${entry.email}:`, error);
            return { success: false, email: entry.email, error };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        successCount += batchResults.filter(result => result.success).length;
        
        // Add a small delay between batches to avoid rate limits
        if (i + batchSize < totalEmails) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Successfully sent ${successCount} of ${totalEmails} emails`,
      });
    } else {
      // Brevo not configured, return message
      return NextResponse.json({
        success: false,
        message: 'Brevo API key not configured. No emails sent.',
      });
    }
  } catch (error) {
    console.error('Error sending waitlist emails:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send emails',
    }, { status: 500 });
  }
}