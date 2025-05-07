# PromptFlow: AI Prompt Marketplace & Automation Platform

PromptFlow is a comprehensive platform for AI prompt management, automation, and monetization.

## Features

- Run prompts with real models (OpenAI, Sonar, Lilypad)
- Chain prompts together with Flow automation
- Credit-based billing system (1 credit = $0.000001)
- Creator monetization (optional fees + unlockable content)
- Export Flows to n8n for automation

## Credit System

- 1 credit = $0.000001 USD
- $1 = 1,000,000 credits

Credits are stored in buckets:
- Type (purchased, bonus, referral)
- Amount
- Remaining
- Source
- Timestamp

Burn priority: purchased → bonus → referral

## Credit Bundles
| Price | Base | Bonus | Total |
|-------|------|-------|-------|
| $10 | 10M | 0 | 10M |
| $25 | 25M | 2.5M | 27.5M |
| $50 | 50M | 7.5M | 57.5M |
| $100 | 100M | 20M | 120M |
| Enterprise | 100M | 40M | 140M |

## Email Automation System

The platform implements a comprehensive event-based email marketing system using Brevo (formerly Sendinblue):

### Features

- **Waitlist Management**: Capture and manage potential users before launch
- **Event-Triggered Emails**: Automatically send emails based on user actions:
  - Account creation
  - Credit purchases
  - Prompt creation/execution
  - Flow creation/execution
- **Marketing Automation**: Use Brevo's automation platform for:
  - Recurring newsletters
  - Drip campaigns
  - Re-engagement campaigns
  - Cart abandonment reminders

### Implementation Details

The system uses Brevo's API to:
1. Track user events via webhooks
2. Segment users based on behavior
3. Trigger automated email sequences
4. Manage email templates in a centralized location

### Setup Instructions

1. Create a Brevo account at https://www.brevo.com/
2. Set up contact lists:
   - Waitlist
   - Registered Users
   - Credit Purchasers
   - Active Flow Users
3. Create email templates for different events
4. Create automation workflows in Brevo's interface
5. Configure environment variables:
   - `BREVO_API_KEY`: Your Brevo API key

6. Install the Brevo SDK:
   ```bash
   npm install sib-api-v3-sdk
   ```

### Email Workflows To Create in Brevo

1. **Waitlist Journey**:
   - Welcome email on signup
   - Automated weekly platform updates
   - Launch notification

2. **User Onboarding**:
   - Welcome email on account creation
   - Platform tutorial series
   - First prompt creation guide

3. **Customer Engagement**:
   - First credit purchase congratulations
   - Credit usage reminders
   - Low balance alerts

4. **User Activation**:
   - Prompt creation follow-up
   - Flow creation tutorial
   - Inactive user re-engagement

### Important Note

This implementation uses Brevo's cloud-based automation workflows rather than local cron jobs. All scheduled and recurring emails are configured directly in the Brevo dashboard, making it easy to manage without the need for hosting recurring jobs locally.

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.sample` to `.env.local` and fill in the values
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

### Email Dependency Installation

```bash
npm run setup:email
```
