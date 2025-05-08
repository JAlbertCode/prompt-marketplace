/**
 * Brevo API Synchronization
 * Enhanced tools for synchronizing contacts with Brevo lists
 * 
 * Using direct API endpoints:
 * 1. POST /v3/contacts - Create or update a contact with list IDs
 * 2. POST /v3/contacts/lists/{listId}/contacts/add - Add existing contacts to a list
 */

// Base URLs for Brevo API
const BREVO_API_BASE = 'https://api.brevo.com/v3';
const BREVO_CONTACTS_API = `${BREVO_API_BASE}/contacts`;

// Contact interfaces
interface BrevoContact {
  email: string;
  attributes?: Record<string, any>;
  listIds?: number[];
  updateEnabled?: boolean;
}

interface BrevoContactEmails {
  emails: string[];
}

/**
 * Create or update a contact and ensure they're in the specified lists
 * This is the recommended approach for contact synchronization
 * 
 * @param email Contact's email address
 * @param attributes Additional information about the contact
 * @param listIds List IDs to add the contact to
 * @returns Promise with API response
 */
export async function syncContactToLists(
  email: string, 
  attributes: Record<string, any> = {}, 
  listIds: number[] = []
): Promise<any> {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.error('BREVO_API_KEY is not set. Email functionality will not work.');
    return { success: false, message: 'API key not configured' };
  }
  
  if (!listIds || !listIds.length) {
    console.warn('No list IDs provided for contact synchronization');
    return { success: false, message: 'No list IDs provided' };
  }
  
  // Prepare contact data with list IDs
  const contactData: BrevoContact = {
    email,
    attributes,
    listIds,
    updateEnabled: true, // Update contact if it already exists
  };
  
  try {
    console.log(`Attempting to sync contact ${email} to Brevo lists: ${listIds.join(', ')}`);
    console.log('Contact data:', JSON.stringify(contactData));
    
    // Step 1: Try creating/updating the contact with list IDs
    // This is the most efficient approach as it handles both creation and list assignment
    const createResponse = await fetch(BREVO_CONTACTS_API, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(contactData),
    });
    
    // Handle successful creation/update
    if (createResponse.status === 201 || createResponse.status === 204) {
      console.log(`Successfully synced contact ${email} to lists`);
      return { success: true, message: 'Contact synchronized successfully' };
    }
    
    // If we got a duplicate contact error
    if (createResponse.status === 400) {
      const errorData = await createResponse.json();
      console.warn('Brevo API error on contact creation:', errorData);
      
      if (errorData.code === 'duplicate_parameter') {
        // Step 2: Contact already exists, try adding to lists directly
        return await addExistingContactToLists(email, listIds);
      }
      
      return { success: false, message: errorData.message || 'Unknown error' };
    }
    
    // Handle other potential error responses
    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('Brevo API error on contact sync:', errorData);
      
      // Last resort: try using the individual list endpoint
      return await addExistingContactToLists(email, listIds);
    }
    
    return await createResponse.json();
  } catch (error) {
    console.error('Error syncing contact to Brevo:', error);
    
    // If any error occurs, try the fallback method
    try {
      return await addExistingContactToLists(email, listIds);
    } catch (fallbackError) {
      console.error('Error in fallback contact sync:', fallbackError);
      return { success: false, message: 'All sync methods failed' };
    }
  }
}

/**
 * Add an existing contact to specified lists
 * This is the fallback method if direct creation with list IDs fails
 * 
 * @param email Contact's email address
 * @param listIds List IDs to add the contact to
 * @returns Promise with API response
 */
export async function addExistingContactToLists(
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
  
  console.log(`Attempting to add existing contact ${email} to lists: ${listIds.join(', ')}`);
  
  try {
    // Process each list separately
    const results = await Promise.all(
      listIds.map(async (listId) => {
        try {
          // Add contact to list
          // Using the /contacts/lists/{listId}/contacts/add endpoint
          const addResponse = await fetch(`${BREVO_API_BASE}/contacts/lists/${listId}/contacts/add`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'api-key': apiKey,
            },
            body: JSON.stringify({
              emails: [email],
            } as BrevoContactEmails),
          });
          
          if (addResponse.status === 204) {
            console.log(`Successfully added ${email} to list ${listId}`);
            return { success: true, listId };
          }
          
          if (!addResponse.ok) {
            const errorData = await addResponse.json();
            console.error(`Error adding contact to list ${listId}:`, errorData);
            return { success: false, listId, error: errorData };
          }
          
          return { success: true, listId };
        } catch (error) {
          console.error(`Error adding contact to list ${listId}:`, error);
          return { success: false, listId, error };
        }
      })
    );
    
    const allSucceeded = results.every(result => result.success);
    const successCount = results.filter(result => result.success).length;
    
    return {
      success: successCount > 0,
      allSucceeded,
      message: allSucceeded 
        ? 'Contact added to all lists' 
        : `Contact added to ${successCount}/${listIds.length} lists`,
      results
    };
  } catch (error) {
    console.error('Error adding existing contact to lists:', error);
    return { success: false, message: 'Error adding contact to lists' };
  }
}

/**
 * Check if a contact is on a specific list
 * 
 * @param email Contact's email address
 * @param listId List ID to check
 * @returns Promise with boolean indicating if the contact is on the list
 */
export async function isContactOnList(
  email: string,
  listId: number
): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.error('BREVO_API_KEY is not set. Email functionality will not work.');
    return false;
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
      return false; // Contact doesn't exist
    }
    
    const contactData = await contactResponse.json();
    
    // Check if the contact has the specified list ID
    return contactData.listIds?.includes(listId) || false;
  } catch (error) {
    console.error('Error checking if contact is on list:', error);
    return false;
  }
}

/**
 * Get contact lists
 * 
 * @returns Promise with list of contact lists
 */
export async function getContactLists(limit: number = 50): Promise<any> {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.error('BREVO_API_KEY is not set. Email functionality will not work.');
    return { success: false, message: 'API key not configured' };
  }
  
  try {
    const response = await fetch(`${BREVO_API_BASE}/contacts/lists?limit=${limit}`, {
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
 * Create a contact list
 * 
 * @param name Name of the list
 * @param folderId Optional folder ID
 * @returns Promise with the created list
 */
export async function createContactList(
  name: string,
  folderId?: number
): Promise<any> {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.error('BREVO_API_KEY is not set. Email functionality will not work.');
    return { success: false, message: 'API key not configured' };
  }
  
  try {
    const response = await fetch(`${BREVO_API_BASE}/contacts/lists`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        name,
        folderId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API error:', errorData);
      return { success: false, message: errorData.message || 'Unknown error' };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating Brevo list:', error);
    return { success: false, message: 'Error creating Brevo list' };
  }
}