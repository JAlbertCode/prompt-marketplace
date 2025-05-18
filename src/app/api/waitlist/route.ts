import { NextResponse } from 'next/server';
import { syncContactToLists } from '@/lib/email/brevoSync';
import { DEFAULT_WAITLIST_LIST_ID } from '@/lib/email/brevo';
import { sendWaitlistWelcomeEmail } from '@/lib/email/templates';
import { supabase } from '@/lib/supabase';
import { addToWaitlist, emailExists, getWaitlistEntries } from '@/lib/waitlist';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    console.log('Waitlist API endpoint received request');
    const { email, firstName, lastName, source: clientSource } = await request.json();
    console.log('Received data:', { email, firstName, lastName, source: clientSource });

    // Validate email
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Please provide a valid email address'
      }, { status: 400 });
    }

    // Get client IP for tracking purposes
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    // Use client-provided source if available, fallback to referer header
    const source = clientSource || request.headers.get('referer') || 'website';
    
    // Add email to Brevo regardless of local status
    // This ensures the contact is properly added to list ID 3
    const brevoResult = await syncContactToLists(
      email,
      {
        FIRSTNAME: firstName || '',
        LASTNAME: lastName || '',
        SOURCE: source,
        IP: clientIp,
        SIGNUP_DATE: new Date().toISOString(),
        PRODUCT: 'PromptFlow',
      },
      [DEFAULT_WAITLIST_LIST_ID] // Always use ID 3 for waitlist
    );
    
    // Check if email already exists in Supabase
    const exists = await emailExists(email);
    
    // If email doesn't exist in Supabase, add it
    if (!exists) {
      // Add to Supabase
      const waitlistResult = await addToWaitlist({
        email,
        name: firstName ? (lastName ? `${firstName} ${lastName}` : firstName) : null,
        joinedAt: new Date().toISOString(),
        ipAddress: clientIp,
        source: source,
      });
      
      if (!waitlistResult) {
        console.log(`Failed to add ${email} to Supabase waitlist`);
      } else {
        console.log(`Added to waitlist in Supabase: ${email}`);
      }
    } else {
      console.log(`Email ${email} already in Supabase waitlist, skipping addition`);
    }
    
    if (brevoResult.success === false) {
      console.log('Failed to sync contact to Brevo:', brevoResult.message);
    } else {
      console.log(`Successfully synced contact ${email} to Brevo waitlist ${DEFAULT_WAITLIST_LIST_ID}`);
      
      // Try to send welcome email
      const emailResult = await sendWaitlistWelcomeEmail(email, {
        FIRST_NAME: firstName || '',
        LAST_NAME: lastName || '',
        SOURCE: source,
        IP_ADDRESS: clientIp,
      });
      
      if (emailResult?.success === false) {
        console.log('Failed to send welcome email:', emailResult.message);
      } else {
        console.log('Successfully sent welcome email');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully synced email with Brevo',
      emailAdded: !exists,
      syncedToBrevo: brevoResult.success !== false
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to add to waitlist',
    }, { status: 500 });
  }
}

// API route to get all waitlist entries
export async function GET() {
  const entries = await getWaitlistEntries();
  
  return NextResponse.json({
    success: true,
    entries,
  });
}