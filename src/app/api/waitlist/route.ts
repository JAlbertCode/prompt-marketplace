import { NextResponse } from 'next/server';
import { addContactToBrevo, DEFAULT_WAITLIST_LIST_ID } from '@/lib/email/brevo';
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
    
    // Check if email already exists
    const emailExists = entries.some(e => e.email === entry.email);
    if (emailExists) {
      return false;
    }
    
    // Add new entry
    entries.push(entry);
    
    // Save updated entries
    fs.writeFileSync(waitlistFilePath, JSON.stringify({ emails: entries }, null, 2), 'utf8');
    
    return true;
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Please provide a valid email address'
      }, { status: 400 });
    }

    // Check if email already exists
    const entries = getWaitlistEntries();
    const emailExists = entries.some(entry => entry.email === email);
    
    if (emailExists) {
      return NextResponse.json({
        success: true,
        message: 'Email already on waitlist',
      });
    }

    // Get client IP for tracking purposes
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const source = request.headers.get('referer') || 'website';
    
    // Add to waitlist file
    const waitlistEntry = {
      email,
      joinedAt: new Date().toISOString(),
      ipAddress: clientIp,
      source: source,
    };
    
    // Add to local storage
    addToWaitlist(waitlistEntry);
    
    console.log(`Added to waitlist: ${email}`);
    
    // Add to Brevo
    const brevoResult = await addContactToBrevo(
      email,
      {
        SOURCE: source,
        IP: clientIp,
        SIGNUP_DATE: new Date().toISOString(),
      },
      DEFAULT_WAITLIST_LIST_ID ? [DEFAULT_WAITLIST_LIST_ID] : []
    );
    
    if (brevoResult.success === false) {
      console.log('Failed to add contact to Brevo:', brevoResult.message);
    } else {
      console.log('Successfully added contact to Brevo');
      
      // Try to send welcome email
      const emailResult = await sendWaitlistWelcomeEmail(email, {
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
      message: 'Successfully added to waitlist',
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