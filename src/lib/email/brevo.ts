/**
 * Brevo API client
 * Direct API integration with Brevo (formerly SendInBlue)
 */

// Base URLs for Brevo API
const BREVO_API_BASE = 'https://api.brevo.com/v3';
const BREVO_CONTACTS_API = `${BREVO_API_BASE}/contacts`;

// Brevo Contact Interface
interface BrevoContact {
  email: string;
  attributes?: Record<string, any>;
  listIds?: number[];
  updateEnabled?: boolean;
}

/**
 * Add or update a contact in Brevo
 * @param email Contact's email address
 * @param attributes Additional information about the contact
 * @param listIds List IDs to add the contact to
 * @returns Promise with API response
 */
export async function addContactToBrevo(
  email: string, 
  attributes: Record<string, any> = {}, 
  listIds: number[] = []
): Promise<any> {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.error('BREVO_API_KEY is not set. Email functionality will not work.');
    return { success: false, message: 'API key not configured' };
  }
  
  const contact: BrevoContact = {
    email,
    attributes,
    listIds,
    updateEnabled: true, // Update contact if it already exists
  };
  
  try {
    const response = await fetch(BREVO_CONTACTS_API, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(contact),
    });
    
    // For successful responses with no content
    if (response.status === 204 || response.status === 201) {
      return { success: true };
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API error:', errorData);
      return { success: false, message: errorData.message || 'Unknown error' };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding contact to Brevo:', error);
    return { success: false, message: 'Error adding contact to Brevo' };
  }
}

/**
 * Get Brevo contact lists
 * @returns Promise with list of contact lists
 */
export async function getBrevoLists(): Promise<any> {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.error('BREVO_API_KEY is not set. Email functionality will not work.');
    return { success: false, message: 'API key not configured' };
  }
  
  try {
    const response = await fetch(`${BREVO_API_BASE}/contacts/lists?limit=50`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': apiKey,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API error:', errorData);
      return { success: false, message: errorData.message || 'Unknown error' };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Brevo lists:', error);
    return { success: false, message: 'Error fetching Brevo lists' };
  }
}

/**
 * Send a transactional email using Brevo
 * @param params Email parameters
 * @returns Promise with API response
 */
export async function sendTransactionalEmail(params: {
  to: { email: string; name?: string }[];
  templateId?: number;
  params?: Record<string, any>;
  subject?: string;
  htmlContent?: string;
  cc?: { email: string; name?: string }[];
  bcc?: { email: string; name?: string }[];
  replyTo?: { email: string; name?: string };
}): Promise<any> {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.error('BREVO_API_KEY is not set. Email functionality will not work.');
    return { success: false, message: 'API key not configured' };
  }
  
  try {
    const response = await fetch(`${BREVO_API_BASE}/smtp/email`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API error:', errorData);
      return { success: false, message: errorData.message || 'Unknown error' };
    }
    
    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('Error sending transactional email:', error);
    return { success: false, message: 'Error sending email' };
  }
}

// Default waitlist list ID
// This should be set to your actual waitlist ID in Brevo
export const DEFAULT_WAITLIST_LIST_ID = parseInt(process.env.BREVO_WAITLIST_LIST_ID || '0', 10);