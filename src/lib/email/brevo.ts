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
      
      // If contact already exists, try to update their list membership
      if (errorData.code === 'duplicate_parameter') {
        return await addExistingContactToLists(email, listIds);
      }
      
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

/**
 * Add an existing contact to specified lists
 * @param email Contact's email address
 * @param listIds List IDs to add the contact to
 * @returns Promise with API response
 */
async function addExistingContactToLists(
  email: string,
  listIds: number[] = []
): Promise<any> {
  if (!listIds.length) {
    return { success: true, message: 'No lists to add contact to' };
  }
  
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    return { success: false, message: 'API key not configured' };
  }
  
  try {
    // First get the contact info by email
    const contactResponse = await fetch(`${BREVO_CONTACTS_API}/email/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': apiKey,
      },
    });
    
    if (!contactResponse.ok) {
      const errorData = await contactResponse.json();
      return { success: false, message: errorData.message || 'Unknown error' };
    }
    
    const contactData = await contactResponse.json();
    const contactId = contactData.id;
    
    // Now add the contact to each list
    const listPromises = listIds.map(async (listId) => {
      const listResponse = await fetch(`${BREVO_API_BASE}/contacts/lists/${listId}/contacts/add`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          emails: [email],
        }),
      });
      
      return listResponse.ok;
    });
    
    const results = await Promise.all(listPromises);
    const allSucceeded = results.every(result => result);
    
    return {
      success: allSucceeded,
      message: allSucceeded ? 'Contact added to all lists' : 'Failed to add contact to some lists',
    };
  } catch (error) {
    console.error('Error adding existing contact to lists:', error);
    return { success: false, message: 'Error adding contact to lists' };
  }
}

/**
 * Get contact by email
 * @param email Contact's email address
 * @returns Promise with contact data
 */
export async function getContactByEmail(email: string): Promise<any> {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    return { success: false, message: 'API key not configured' };
  }
  
  try {
    const response = await fetch(`${BREVO_CONTACTS_API}/email/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': apiKey,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.message || 'Unknown error' };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error getting contact from Brevo:', error);
    return { success: false, message: 'Error retrieving contact' };
  }
}

// Default waitlist list ID
// This is set to list ID 3 for PromptFlow's waitlist in Brevo
export const DEFAULT_WAITLIST_LIST_ID = parseInt(process.env.BREVO_WAITLIST_LIST_ID || '3', 10);

// Helper function to check if an email is valid
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}