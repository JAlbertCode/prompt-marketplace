import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to waitlist storage file
const waitlistFilePath = path.join(process.cwd(), 'src', 'data', 'waitlist.json');

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

/**
 * Debug endpoint to check email status in waitlist
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email parameter is required',
      }, { status: 400 });
    }
    
    // Read all entries
    const entries = getWaitlistEntries();
    const normalizedEmail = email.toLowerCase().trim();
    
    // List all emails for debugging
    const allEmails = entries.map(entry => entry.email.toLowerCase().trim());
    
    // Check if this email exists
    const emailExists = entries.some(entry => 
      entry.email.toLowerCase().trim() === normalizedEmail
    );
    
    // Find the exact entry if it exists
    const foundEntry = entries.find(entry => 
      entry.email.toLowerCase().trim() === normalizedEmail
    );
    
    return NextResponse.json({
      success: true,
      email,
      normalizedEmail,
      emailExists,
      entry: foundEntry || null,
      allEmails,
      totalEntries: entries.length
    });
  } catch (error) {
    console.error('Waitlist test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check waitlist',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}