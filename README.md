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

### Key Integration Features

- **Robust Contact Synchronization**: Uses multiple API synchronization methods to ensure contacts are properly added to lists
- **Direct List Assignment**: Auto-adds new contacts to appropriate lists with fallback mechanisms
- **Waitlist Management**: Automatically adds signups to List ID 3 for PromptFlow's waitlist

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

The system uses custom Brevo API clients for maximum reliability:

1. `src/lib/email/brevo.ts` - Base Brevo API client
2. `src/lib/email/brevoSync.ts` - Enhanced contact synchronization using multiple API endpoints
3. `src/lib/email/templates.ts` - Reusable email template system

### Setup Instructions

1. Create a Brevo account at https://www.brevo.com/
2. Set up contact lists:
   - Waitlist (list ID 3 is used for PromptFlow waitlist)
   - Registered Users
   - Credit Purchasers
   - Active Flow Users
3. Create email templates for different events
4. Create automation workflows in Brevo's interface
5. Configure environment variables:
   - `BREVO_API_KEY`: Your Brevo API key
   - `BREVO_WAITLIST_LIST_ID`: Set to 3 for PromptFlow's waitlist in Brevo

**Note**: The custom implementation does not require installing the Brevo SDK directly.

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

### Admin Notification System

The platform includes a real-time notification system for administrators:

- **Server-Sent Events (SSE)**: Real-time updates without polling
- **Event Types**:
  - Waitlist signups
  - User registrations
  - Credit purchases
  - Prompt/Flow creations
- **Admin Dashboard Integration**: Notifications appear in the admin interface
- **Event History**: Recent events are stored in memory for new connections

Administrators are automatically notified when new users join the waitlist, helping to track interest and engagement before launch.

### Important Note

This implementation uses Brevo's cloud-based automation workflows rather than local cron jobs. All scheduled and recurring emails are configured directly in the Brevo dashboard, making it easy to manage without the need for hosting recurring jobs locally.

## Development Tips

### Environment Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.sample` to `.env.local` and fill in the values
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

### Database Fallback Mode

The application includes a database fallback mode to handle database connection issues:

- If you encounter Prisma errors in the console, make sure your database is properly configured
- By default, the application uses `USE_DB_FALLBACK=true` and can work without a real database
- See [DATABASE_FALLBACK.md](DATABASE_FALLBACK.md) for more details on troubleshooting database issues

> NOTE: The application uses client-safe API routes for database operations. All direct Prisma usage is kept server-side to prevent browser compatibility issues.

### Email Dependency Installation

```bash
npm run setup:email
```

## Production Deployment Guide

### Prerequisites

1. Vercel account (https://vercel.com)
2. PostgreSQL database (e.g., Supabase, Neon, Vercel Postgres)
3. Stripe account for payments (https://stripe.com)
4. Brevo account for email marketing (https://brevo.com)
5. API keys for OpenAI and other AI providers

### Environment Configuration

Set up the following environment variables in your Vercel project:

1. **Database Configuration**
   - `DATABASE_URL` - PostgreSQL connection string (with SSL enabled and connection pooling)
   - `USE_DB_FALLBACK` - Set to `false` in production

2. **Authentication**
   - `NEXTAUTH_URL` - Your production domain (e.g., https://promptflow.io)
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `GITHUB_ID` and `GITHUB_SECRET` - OAuth credentials from GitHub
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - OAuth credentials from Google

3. **Payment Processing**
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (starts with pk_live_)
   - `STRIPE_SECRET_KEY` - Stripe secret key (starts with sk_live_)
   - `STRIPE_WEBHOOK_SECRET` - Webhook signing secret from Stripe
   - Stripe product IDs for each credit bundle

4. **Email Marketing**
   - `BREVO_API_KEY` - API key from Brevo
   - `BREVO_WAITLIST_LIST_ID` - List ID for waitlist (default: 3)
   - Template IDs for various email notifications

5. **AI Model Integration**
   - `OPENAI_API_KEY` - OpenAI API key
   - `SONAR_API_KEY` - Sonar API key
   - Additional API keys for other providers

6. **Rate Limiting & Security**
   - `RATE_LIMIT_REQUESTS` - Requests per window (default: 100)
   - `RATE_LIMIT_WINDOW` - Window in seconds (default: 60)

7. **Application Settings**
   - `NODE_ENV` - Set to `production`
   - `NEXT_PUBLIC_PRODUCT_NAME` - Product name (default: PromptFlow)
   - `NEXT_PUBLIC_URL` - Public URL (e.g., https://promptflow.io)

### Deployment Steps

1. **Database Setup**
   - Create a PostgreSQL database in your preferred provider
   - Run Prisma migrations: `npx prisma migrate deploy`

2. **Vercel Deployment**
   - Connect your GitHub repository to Vercel
   - Configure environment variables in the Vercel dashboard
   - Deploy the project

3. **Stripe Configuration**
   - Create products in Stripe dashboard for each credit bundle
   - Set up webhook endpoints (pointing to `/api/webhooks/stripe`)
   - Update the product IDs in your environment variables

4. **Email Setup**
   - Create contact lists and email templates in Brevo
   - Set up automation workflows for different user actions

5. **Monitoring Setup**
   - Configure Vercel Analytics
   - Set up health check monitoring (pointing to `/health` endpoint)
   - Enable logging for API routes if needed

### Post-Deployment Verification

1. Test the login/signup flow with OAuth providers
2. Verify credit purchase with Stripe integration
3. Test prompt execution with different AI models
4. Confirm email notifications are working properly
5. Validate the credit system is tracking usage correctly

### Security Considerations

1. All API keys are server-side only (never exposed to the client)
2. Rate limiting is enabled to prevent abuse
3. Security headers are added to all responses
4. All database queries use Prisma's parameterized queries to prevent SQL injection
5. Authentication state is handled securely with NextAuth.js
6. Stripe payments use webhooks with signature verification
7. API routes are protected by middleware authentication checks

### Scaling Considerations

1. **Database Connection Pooling**
   - Connection limits and timeouts are configured in the DATABASE_URL
   - Prisma keeps connections alive with periodic pings

2. **Edge Compute & CDN**
   - Static assets are cached with proper headers
   - Edge middleware handles rate limiting at the edge

3. **Memory Management**
   - In-memory stores (like rate limiting) reset on deployments
   - For persistent rate limiting, consider implementing Redis

4. **Pricing Optimization**
   - Model tiers are configured for cost management
   - Credit purchases include volume discounts
   - Make sure to set profitable margins on model usage

### Troubleshooting

1. **Database Issues**
   - Check connection strings and network access
   - Verify Prisma migrations are deployed
   - The health endpoint (`/health`) provides database status

2. **Payment Processing**
   - Check Stripe webhook logs for missed events
   - Verify webhook signatures
   - Test purchases with Stripe test mode

3. **Email Delivery**
   - Verify Brevo API key and permissions
   - Check email templates and list IDs
   - Monitor email deliverability in Brevo dashboard

4. **API Rate Limiting**
   - Adjust rate limits if needed based on usage patterns
   - Implement tiered rate limits for different user types

### Regular Maintenance Tasks

1. Clean up expired credit buckets (handled by cron job)
2. Award automation bonuses (handled by cron job)
3. Monitor API usage and adjust rate limits
4. Update AI model pricing when vendor prices change
5. Review database performance and optimize queries
6. Update dependencies and NextJS version

## Bundle Analysis

This project uses `@next/bundle-analyzer` to analyze the bundle size of the application. You can run the analysis with:

```bash
npm run analyze
```

This will generate bundle analysis reports in the `.next/analyze` directory.
