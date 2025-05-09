import { NextResponse } from 'next/server';
import { syncContactToLists } from '@/lib/email/brevoSync';
import { DEFAULT_WAITLIST_LIST_ID } from '@/lib/email/brevo';
import { sendWaitlistWelcomeEmail } from '@/lib/email/templates';
import fs from 'fs';
import path from 'path';

// Path to waitlist storage file
const waitlistFilePath = path.join(process.cwd(), 'src', 'data', 'waitlist.json');

// Make sure the data directory exists
try {
  if (!fs.existsSync(path.join(process.cwd(), 'src', 'data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'src', 'data'), { recursive: true });
  }
  
  // Create waitlist file if it doesn't exist
  if (!fs.existsSync(waitlistFilePath)) {
    fs.writeFileSync(waitlistFilePath, JSON.stringify({ emails: [] }), 'utf8');
  }
} catch (error) {
  console.error('Error initializing waitlist file:', error);
}

// Function to get all waitlist entries
function getWaitlistEntries() {
  try {
    const rawData = fs.readFileSync(waitlistFilePath, 'utf8');
    const data = JSON.parse(rawData);
    return data.emails || [];
  } catch (error) {
    console.error('Error reading waitlist file:', error);
    return [];
  }
}

// Function to add a new entry to the waitlist
function addToWaitlist(entry) {
  try {
    const entries = getWaitlistEntries();
    
    // Check if email already exists - case insensitive comparison
    const normalizedNewEmail = entry.email.toLowerCase().trim();
    console.log('Attempting to add email:', normalizedNewEmail);
    
    let emailExists = false;
    // Manual comparison loop to ensure accuracy
    for (const existingEntry of entries) {
      const existingEmail = existingEntry.email.toLowerCase().trim();
      console.log(`Comparing [${existingEmail}] with [${normalizedNewEmail}]`);
      if (existingEmail === normalizedNewEmail) {
        emailExists = true;
        console.log('MATCH FOUND - emails are identical');
        break;
      }
    }
    
    if (emailExists) {
      console.log(`Email ${entry.email} already exists in waitlist file - skipping local add`);
      return false;
    }
    
    // Add new entry
    entries.push(entry);
    
    // Save updated entries
    fs.writeFileSync(waitlistFilePath, JSON.stringify({ emails: entries }, null, 2), 'utf8');
    console.log(`Added ${entry.email} to local waitlist file. Total entries: ${entries.length}`);
    
    return true;
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return false;
  }
}

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
    
    // Create waitlist entry object
    const waitlistEntry = {
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      joinedAt: new Date().toISOString(),
      ipAddress: clientIp,
      source: source,
    };
    
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
    
    // Check if email already exists AFTER attempting Brevo sync
    // This way, we always try to sync with Brevo first
    const entries = getWaitlistEntries();
    const normalizedEmail = email.toLowerCase().trim();
    
    let emailExists = false;
    // Manual comparison loop to ensure accuracy
    for (const entry of entries) {
      const entryEmail = entry.email.toLowerCase().trim();
      if (entryEmail === normalizedEmail) {
        emailExists = true;
        console.log(`Match found: [${entryEmail}] equals [${normalizedEmail}]`);
        break;
      }
    }
    
    console.log(`Email exists in waitlist file: ${emailExists}`);
    console.log(`Total entries in waitlist file: ${entries.length}`);
    
    // If email doesn't exist locally, add it
    if (!emailExists) {
      // Add to local storage
      addToWaitlist(waitlistEntry);
      console.log(`Added to waitlist: ${email}`);
    } else {
      console.log(`Email ${email} already in local waitlist, skipping local addition`);
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
      emailAdded: !emailExists,
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
  const entries = getWaitlistEntries();
  
  return NextResponse.json({
    success: true,
    entries,
  });
}