/**
 * Email template utilities for sending emails via Brevo
 */
import { sendTransactionalEmail } from './brevo';
import { syncContactToLists } from './brevoSync';

// Template IDs for different email types
// These should be created in Brevo dashboard and their IDs set here
export const EMAIL_TEMPLATES = {
  WAITLIST_WELCOME: parseInt(process.env.BREVO_TEMPLATE_WAITLIST_WELCOME || '1', 10),
  WAITLIST_LAUNCH: parseInt(process.env.BREVO_TEMPLATE_WAITLIST_LAUNCH || '2', 10),
  USER_WELCOME: parseInt(process.env.BREVO_TEMPLATE_USER_WELCOME || '3', 10),
  CREDIT_PURCHASE: parseInt(process.env.BREVO_TEMPLATE_CREDIT_PURCHASE || '4', 10),
};

/**
 * Send welcome email to waitlist subscriber
 * @param email Subscriber's email
 * @param params Additional parameters for the email template
 * @returns Promise with API response
 */
export async function sendWaitlistWelcomeEmail(
  email: string,
  params: Record<string, any> = {}
): Promise<any> {
  // Default parameters
  const defaultParams = {
    SIGNUP_DATE: new Date().toLocaleDateString(),
    PRODUCT_NAME: process.env.NEXT_PUBLIC_PRODUCT_NAME || 'PromptFlow',
    ...params,
  };
  
  // If no template ID is set, send a simple email
  if (!EMAIL_TEMPLATES.WAITLIST_WELCOME) {
    // Send a basic welcome email instead
    return sendTransactionalEmail({
      to: [{ email }],
      subject: `Welcome to the ${defaultParams.PRODUCT_NAME} Waitlist`,
      htmlContent: `
        <html>
          <body>
            <h1>Welcome ${defaultParams.FIRST_NAME ? `${defaultParams.FIRST_NAME}` : ''}!</h1>
            <p>Thank you for joining our ${defaultParams.PRODUCT_NAME} waitlist. We're excited to have you on board.</p>
            <p>We'll keep you updated on our progress and let you know when we launch.</p>
            <p>Best regards,<br>The ${defaultParams.PRODUCT_NAME} Team</p>
          </body>
        </html>
      `,
      params: defaultParams,
    });
  }
  
  // Send template-based email
  return sendTransactionalEmail({
    to: [{ email }],
    templateId: EMAIL_TEMPLATES.WAITLIST_WELCOME,
    params: defaultParams,
  });
}

/**
 * Send launch notification to waitlist subscribers
 * @param emails Array of subscriber emails
 * @param params Additional parameters for the email template
 * @returns Promise with API response
 */
export async function sendWaitlistLaunchEmail(
  emails: string[],
  params: Record<string, any> = {}
): Promise<any> {
  const defaultParams = {
    LAUNCH_DATE: new Date().toLocaleDateString(),
    PRODUCT_NAME: process.env.NEXT_PUBLIC_PRODUCT_NAME || 'PromptFlow',
    PRODUCT_URL: process.env.NEXT_PUBLIC_URL || 'https://promptflow.io',
    ...params,
  };
  
  // If no template ID is set, use a basic email
  if (!EMAIL_TEMPLATES.WAITLIST_LAUNCH) {
    // Use basic HTML email
    const htmlContent = `
      <html>
        <body>
          <h1>We've Launched!</h1>
          <p>We're excited to announce that ${defaultParams.PRODUCT_NAME} is now live!</p>
          <p>You can now access the platform at <a href="${defaultParams.PRODUCT_URL}">${defaultParams.PRODUCT_URL}</a>.</p>
          <p>Thank you for your patience and support.</p>
          <p>Best regards,<br>The ${defaultParams.PRODUCT_NAME} Team</p>
        </body>
      </html>
    `;
    
    // For bulk sending, we'd typically use Brevo's campaign feature
    // But for demonstration, we're sending individual emails
    // Limited to 10 per batch to avoid rate limits
    const batches = [];
    const batchSize = 10;
    
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      const batchPromises = batch.map(email => 
        sendTransactionalEmail({
          to: [{ email }],
          subject: `We've Launched! ${defaultParams.PRODUCT_NAME} is Live`,
          htmlContent,
          params: defaultParams,
        })
      );
      
      batches.push(Promise.all(batchPromises));
    }
    
    return Promise.all(batches);
  }
  
  // Using template-based email
  const batches = [];
  const batchSize = 10;
  
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    
    const batchPromises = batch.map(email => 
      sendTransactionalEmail({
        to: [{ email }],
        templateId: EMAIL_TEMPLATES.WAITLIST_LAUNCH,
        params: defaultParams,
      })
    );
    
    batches.push(Promise.all(batchPromises));
  }
  
  return Promise.all(batches);
}

/**
 * Send welcome email to new registered user
 * @param email User's email
 * @param name User's name
 * @param params Additional parameters for the email template
 * @returns Promise with API response
 */
export async function sendUserWelcomeEmail(
  email: string,
  name: string,
  params: Record<string, any> = {}
): Promise<any> {
  const defaultParams = {
    FIRST_NAME: name.split(' ')[0],
    PRODUCT_NAME: process.env.NEXT_PUBLIC_PRODUCT_NAME || 'PromptFlow',
    PRODUCT_URL: process.env.NEXT_PUBLIC_URL || 'https://promptflow.io',
    ...params,
  };
  
  // If no template ID is set, use a basic email
  if (!EMAIL_TEMPLATES.USER_WELCOME) {
    return sendTransactionalEmail({
      to: [{ email, name }],
      subject: `Welcome to ${defaultParams.PRODUCT_NAME}`,
      htmlContent: `
        <html>
          <body>
            <h1>Welcome, ${defaultParams.FIRST_NAME}!</h1>
            <p>Thank you for joining ${defaultParams.PRODUCT_NAME}. We're excited to have you on board.</p>
            <p>You can now start using our platform to discover and create AI workflows.</p>
            <p>Best regards,<br>The ${defaultParams.PRODUCT_NAME} Team</p>
          </body>
        </html>
      `,
      params: defaultParams,
    });
  }
  
  return sendTransactionalEmail({
    to: [{ email, name }],
    templateId: EMAIL_TEMPLATES.USER_WELCOME,
    params: defaultParams,
  });
}

/**
 * Send credit purchase confirmation email
 * @param email User's email
 * @param name User's name
 * @param amount Amount of credits purchased
 * @param bonusAmount Amount of bonus credits
 * @param totalAmount Total credits (purchased + bonus)
 * @param amountPaid Amount paid in USD
 * @param params Additional parameters for the email template
 * @returns Promise with API response
 */
export async function sendCreditPurchaseEmail(
  email: string,
  name: string,
  amount: number,
  bonusAmount: number,
  totalAmount: number,
  amountPaid: number,
  params: Record<string, any> = {}
): Promise<any> {
  const defaultParams = {
    FIRST_NAME: name.split(' ')[0],
    PURCHASE_DATE: new Date().toLocaleDateString(),
    CREDIT_AMOUNT: amount.toLocaleString(),
    BONUS_AMOUNT: bonusAmount.toLocaleString(),
    TOTAL_AMOUNT: totalAmount.toLocaleString(),
    AMOUNT_PAID: amountPaid.toFixed(2),
    PRODUCT_NAME: process.env.NEXT_PUBLIC_PRODUCT_NAME || 'PromptFlow',
    ...params,
  };
  
  // If no template ID is set, use a basic email
  if (!EMAIL_TEMPLATES.CREDIT_PURCHASE) {
    return sendTransactionalEmail({
      to: [{ email, name }],
      subject: `${defaultParams.PRODUCT_NAME} - Credit Purchase Confirmation`,
      htmlContent: `
        <html>
          <body>
            <h1>Purchase Confirmation</h1>
            <p>Thank you for your purchase, ${defaultParams.FIRST_NAME}!</p>
            <p>Here's a summary of your purchase:</p>
            <ul>
              <li>Base credits: ${defaultParams.CREDIT_AMOUNT}</li>
              <li>Bonus credits: ${defaultParams.BONUS_AMOUNT}</li>
              <li>Total credits: ${defaultParams.TOTAL_AMOUNT}</li>
              <li>Amount paid: $${defaultParams.AMOUNT_PAID}</li>
            </ul>
            <p>Your credits have been added to your account.</p>
            <p>Best regards,<br>The ${defaultParams.PRODUCT_NAME} Team</p>
          </body>
        </html>
      `,
      params: defaultParams,
    });
  }
  
  return sendTransactionalEmail({
    to: [{ email, name }],
    templateId: EMAIL_TEMPLATES.CREDIT_PURCHASE,
    params: defaultParams
  });
}