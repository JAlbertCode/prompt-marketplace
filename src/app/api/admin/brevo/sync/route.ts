import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { addContactToBrevo } from '@/lib/email/brevo';

// Path to waitlist storage file
const waitlistFilePath = path.join(process.cwd(), 'src', 'data', 'waitlist.json');

// Function to get all waitlist entries
function getWaitlistEntries() {
  try {
    if (!fs.existsSync(waitlistFilePath)) {
      return [];
    }
    
    const rawData = fs.readFileSync(waitlistFilePath, 'utf8');
    const data = JSON.parse(rawData);
    return data.emails || [];
  } catch (error) {
    console.error('Error reading waitlist file:', error);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    // Get all entries from storage
    const entries = getWaitlistEntries();
    
    if (entries.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No entries found in waitlist',
      });
    }
    
    // Sync each contact with Brevo
    const results = [];
    let successCount = 0;
    
    // Process in batches to avoid rate limits
    const batchSize = 10;
    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      
      // Process each entry in batch
      const batchPromises = batch.map(async (entry) => {
        try {
          const result = await addContactToBrevo(
            entry.email,
            {
              SOURCE: entry.source || 'website',
              IP: entry.ipAddress || 'unknown',
              SIGNUP_DATE: entry.joinedAt,
            }
          );
          
          if (result.success === false) {
            console.log(`Failed to sync ${entry.email} to Brevo:`, result.message);
            return { email: entry.email, success: false, message: result.message };
          }
          
          successCount++;
          return { email: entry.email, success: true };
        } catch (error) {
          console.error(`Error syncing ${entry.email} to Brevo:`, error);
          return { email: entry.email, success: false, error: String(error) };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add a delay between batches
      if (i + batchSize < entries.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Return results
    return NextResponse.json({
      success: true,
      total: entries.length,
      synced: successCount,
      results,
    });
  } catch (error) {
    console.error('Error syncing with Brevo:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to sync with Brevo',
      error: String(error),
    }, { status: 500 });
  }
}