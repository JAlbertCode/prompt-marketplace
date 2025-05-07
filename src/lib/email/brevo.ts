// src/lib/email/brevo.ts
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

// Initialize Brevo client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.ContactsApi();
const emailInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Add a contact to Brevo
 */
export async function addContact(
  email: string, 
  firstName?: string, 
  lastName?: string,
  listIds: number[] = [],
  attributes: Record<string, any> = {}
): Promise<boolean> {
  try {
    const createContact = new SibApiV3Sdk.CreateContact();
    
    createContact.email = email;
    createContact.listIds = listIds;
    createContact.attributes = {
      FIRSTNAME: firstName || '',
      LASTNAME: lastName || '',
      ...attributes
    };
    
    await apiInstance.createContact(createContact);
    return true;
  } catch (error) {
    console.error('Error adding contact to Brevo:', error);
    return false;
  }
}

/**
 * Send a transactional email
 */
export async function sendTransactionalEmail(
  to: string | string[],
  templateId: number,
  params: Record<string, any> = {},
  subject?: string,
  tags: string[] = []
): Promise<boolean> {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.to = Array.isArray(to) 
      ? to.map(email => ({ email })) 
      : [{ email: to }];
      
    sendSmtpEmail.templateId = templateId;
    sendSmtpEmail.params = params;
    
    if (subject) {
      sendSmtpEmail.subject = subject;
    }
    
    if (tags.length > 0) {
      sendSmtpEmail.tags = tags;
    }
    
    await emailInstance.sendTransacEmail(sendSmtpEmail);
    return true;
  } catch (error) {
    console.error('Error sending transactional email:', error);
    return false;
  }
}

/**
 * Track a custom event for a contact
 */
export async function trackEvent(
  email: string,
  eventName: string,
  properties: Record<string, any> = {}
): Promise<boolean> {
  try {
    const event = new SibApiV3Sdk.RequestContactsEvents();
    
    event.email = email;
    event.eventName = eventName;
    event.properties = properties;
    
    await apiInstance.createContactEvent(event);
    return true;
  } catch (error) {
    console.error('Error tracking event in Brevo:', error);
    return false;
  }
}

/**
 * Add a contact to a specific list
 */
export async function addContactToList(
  email: string,
  listId: number
): Promise<boolean> {
  try {
    const addContactToList = new SibApiV3Sdk.AddContactToList();
    addContactToList.emails = [email];
    
    await apiInstance.addContactToList(listId, addContactToList);
    return true;
  } catch (error) {
    console.error('Error adding contact to list:', error);
    return false;
  }
}
