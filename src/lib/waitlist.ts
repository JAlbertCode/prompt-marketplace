import fs from 'fs';
import path from 'path';

const waitlistFilePath = path.join(process.cwd(), 'src', 'data', 'waitlist.json');

interface WaitlistEntry {
  email: string;
  joinedAt: string;
  ipAddress?: string;
  source?: string;
}

interface WaitlistData {
  emails: WaitlistEntry[];
}

/**
 * Get all waitlist entries
 * @returns Array of waitlist entries
 */
export function getWaitlistEntries(): WaitlistEntry[] {
  try {
    if (!fs.existsSync(waitlistFilePath)) {
      // Create the file with empty array if it doesn't exist
      fs.writeFileSync(waitlistFilePath, JSON.stringify({ emails: [] }), 'utf8');
      return [];
    }
    
    const rawData = fs.readFileSync(waitlistFilePath, 'utf8');
    const data: WaitlistData = JSON.parse(rawData);
    return data.emails || [];
  } catch (error) {
    console.error('Error reading waitlist file:', error);
    return [];
  }
}

/**
 * Check if an email already exists in the waitlist
 * @param email Email to check
 * @returns Boolean indicating if email exists
 */
export function emailExists(email: string): boolean {
  const entries = getWaitlistEntries();
  return entries.some(entry => entry.email.toLowerCase() === email.toLowerCase());
}

/**
 * Add a new entry to the waitlist
 * @param entry Waitlist entry to add
 * @returns Boolean indicating success
 */
export function addToWaitlist(entry: WaitlistEntry): boolean {
  try {
    // Check if email already exists
    if (emailExists(entry.email)) {
      return false;
    }
    
    // Get existing entries
    const entries = getWaitlistEntries();
    
    // Add new entry
    entries.push({
      ...entry,
      joinedAt: entry.joinedAt || new Date().toISOString(),
    });
    
    // Save updated entries
    const data: WaitlistData = { emails: entries };
    fs.writeFileSync(waitlistFilePath, JSON.stringify(data, null, 2), 'utf8');
    
    return true;
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return false;
  }
}