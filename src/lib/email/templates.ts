/**
 * Email template utilities for sending emails via Brevo
 */
import { sendTransactionalEmail } from './brevo';

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
    ...params,
  };
  
  // If no template ID is set, send a simple email
  if (!EMAIL_TEMPLATES.WAITLIST_WELCOME) {
    // Send a basic welcome email instead
    return sendTransactionalEmail({
      to: [{ email }],
      subject: 'Welcome to the AI Marketplace Waitlist',
      htmlContent: `
        <html>
          <body>
            <h1>Welcome to the AI Marketplace!</h1>
            <p>Thank you for joining our waitlist. We're excited to have you on board.</p>
            <p>We'll keep you updated on our progress and let you know when we launch.</p>
            <p>Best regards,<br>The AI Marketplace Team</p>
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
  // If no template ID is set, use a basic email
  if (!EMAIL_TEMPLATES.WAITLIST_LAUNCH) {
    // Use basic HTML email
    const htmlContent = `
      <html>
        <body>
          <h1>We've Launched!</h1>
          <p>We're excited to announce that the AI Marketplace is now live!</p>
          <p>You can now access the platform at <a href="https://aimarketplace.com">aimarketplace.com</a>.</p>
          <p>Thank you for your patience and support.</p>
          <p>Best regards,<br>The AI Marketplace Team</p>
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
          subject: 'We\'ve Launched! The AI Marketplace is Live',
          htmlContent,
          params,
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
        params,
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
  // If no template ID is set, use a basic email
  if (!EMAIL_TEMPLATES.USER_WELCOME) {
    return sendTransactionalEmail({
      to: [{ email, name }],
      subject: 'Welcome to the AI Marketplace',
      htmlContent: `
        <html>
          <body>
            <h1>Welcome, ${name}!</h1>
            <p>Thank you for joining the AI Marketplace. We're excited to have you on board.</p>
            <p>You can now start using our platform to discover and create AI workflows.</p>
            <p>Best regards,<br>The AI Marketplace Team</p>
          </body>
        </html>
      `,
      params: {
        FIRST_NAME: name.split(' ')[0],
        ...params,
      },
    });
  }
  
  return sendTransactionalEmail({
    to: [{ email, name }],
    templateId: EMAIL_TEMPLATES.USER_WELCOME,
    params: {
      FIRST_NAME: name.split(' ')[0],
      ...params,
    },
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
  // If no template ID is set, use a basic email
  if (!EMAIL_TEMPLATES.CREDIT_PURCHASE) {
    return sendTransactionalEmail({
      to: [{ email, name }],
      subject: 'Credit Purchase Confirmation',
      htmlContent: `
        <html>
          <body>
            <h1>Purchase Confirmation</h1>
            <p>Thank you for your purchase, ${name.split(' ')[0]}!</p>
            <p>Here's a summary of your purchase:</p>
            <ul>
              <li>Base credits: ${amount.toLocaleString()}</li>
              <li>Bonus credits: ${bonusAmount.toLocaleString()}</li>
              <li>Total credits: ${totalAmount.toLocaleString()}</li>
              <li>Amount paid: $${amountPaid.toFixed(2)}</li>
            </ul>
            <p>Your credits have been added to your account.</p>
            <p>Best regards,<br>The AI Marketplace Team</p>
          </body>
        </html>
      `,
      params: {
        FIRST_NAME: name.split(' ')[0],
        PURCHASE_DATE: new Date().toLocaleDateString(),
        CREDIT_AMOUNT: amount.toLocaleString(),
        BONUS_AMOUNT: bonusAmount.toLocaleString(),
        TOTAL_AMOUNT: totalAmount.toLocaleString(),
        AMOUNT_PAID: amountPaid.toFixed(2),
        ...params,
      },
    });
  }
  
  return sendTransactionalEmail({
    to: [{ email, name }],
    templateId: EMAIL_TEMPLATES.CREDIT_PURCHASE,
    params: {
      FIRST_NAME: name.split(' ')[0],
      PURCHASE_DATE: new Date().toLocaleDateString(),
      CREDIT_AMOUNT: amount.toLocaleString(),
      BONUS_AMOUNT: bonusAmount.toLocaleString(),
      TOTAL_AMOUNT: totalAmount.toLocaleString(),
      AMOUNT_PAID: amountPaid.toFixed(2),
      ...params,
    },
  });
}