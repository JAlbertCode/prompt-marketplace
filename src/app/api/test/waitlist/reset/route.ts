import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to waitlist storage file
const waitlistFilePath = path.join(process.cwd(), 'src', 'data', 'waitlist.json');

/**
 * Reset waitlist for testing
 * WARNING: This would delete all data in production - only for development!
 */
export async function GET() {
  try {
    // Create empty waitlist
    const emptyWaitlist = { emails: [] };
    
    // Write empty waitlist to file
    fs.writeFileSync(waitlistFilePath, JSON.stringify(emptyWaitlist, null, 2), 'utf8');
    
    return NextResponse.json({
      success: true,
      message: 'Waitlist reset successfully',
    });
  } catch (error) {
    console.error('Error resetting waitlist:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to reset waitlist',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}