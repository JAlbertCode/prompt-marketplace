# PromptFlow Credit System Documentation

This document provides an overview of the PromptFlow platform's credit system, including how credits are priced, earned, and used.

## Credit System Overview

PromptFlow uses a credit-based billing system where users purchase and spend credits to run AI models. The credit system offers a simple way to unify costs across different AI models and providers.

### Credit Basics

- **1 credit = $0.000001 USD**
- **$1 = 1,000,000 credits**

### Credit Buckets

Credits are stored in "buckets" with the following properties:
- **Type**: purchased, bonus, or referral
- **Amount**: The original amount of credits in the bucket
- **Remaining**: Current balance of credits in the bucket
- **Source**: Where the credits came from (e.g., "stripe_purchase", "automation_bonus")
- **Timestamp**: When the credits were added
- **Expiry**: When the credits expire (if applicable)

Credits are burned in this priority order:
1. Purchased credits (oldest first)
2. Bonus credits (oldest first)
3. Referral credits (oldest first)

## Model Pricing

Model costs vary based on the model and prompt length. Pricing is divided into three categories based on prompt length:

- **Short**: < 1,500 characters
- **Medium**: 1,500 to 6,000 characters
- **Long**: > 6,000 characters

Sample pricing for popular models (in credits):

| Model | Short | Medium | Long |
|-------|-------|--------|------|
| GPT-4o | 8,500 | 15,000 | 23,500 |
| GPT-4o Mini | 1,000 | 1,800 | 2,800 |
| GPT-4.1 | 3,400 | 6,000 | 9,400 |
| Sonar Pro Medium | 700 | 1,200 | 1,900 |
| Sonar Pro High | 200 | 300 | 500 |

## Credit Bundles

Users can purchase credits in the following bundles:

| Bundle | Price | Base Credits | Bonus Credits | Total Credits | Price per Million |
|--------|-------|--------------|--------------|---------------|-------------------|
| Starter | $10 | 10M | 0 | 10M | $1.00 |
| Basic | $25 | 25M | 2.5M | 27.5M | $0.91 |
| Pro | $50 | 50M | 7.5M | 57.5M | $0.87 |
| Business | $100 | 100M | 20M | 120M | $0.83 |
| Enterprise | $100 | 100M | 40M | 140M | $0.71 |

Enterprise tier requires 1.4M+ monthly credit usage.

## Creator Fees

Content creators on PromptFlow can monetize their prompts and flows:

- Creators can set optional percentage fees on their prompts (added to base model cost)
- When users run a prompt with a creator fee:
  - 80% of the fee goes to the creator
  - 20% of the fee is retained by the platform

Example:
- A medium GPT-4o prompt costs 15,000 credits
- Creator adds a 10% fee (1,500 credits)
- User pays 16,500 credits total
- Creator receives 1,200 credits (80% of 1,500)
- Platform retains 300 credits (20% of 1,500)

## Platform Fees

Platform fees are added to cover operational costs:

- When there is no creator fee:
  - 10% platform markup is added to the base model cost
- When there is a creator fee:
  - No additional platform markup (platform gets 20% of creator fee instead)

## Automation Bonus Program

Users who automate workflows via the n8n integration can earn monthly bonus credits based on usage:

| Monthly Usage | Monthly Bonus |
|---------------|---------------|
| 100K - 299K | 10,000 |
| 300K - 599K | 40,000 |
| 600K - 999K | 100,000 |
| ≥ 1.4M | 400,000 (auto-enterprise) |

Bonus logic:
- Usage is calculated based on monthly credit burn through n8n webhooks
- Users who reach 1.4M+ monthly usage automatically qualify for enterprise tier pricing
- Bonus credits expire after 30 days

## API Integration

All credit operations are available through our API:

### Key Endpoints
- `/api/credits` - Get credit balance and breakdown
- `/api/credits/charge` - Charge credits for model usage
- `/api/credits/calculate-cost` - Calculate cost before running a model
- `/api/credits/usage` - Get usage statistics
- `/api/credits/transactions` - View transaction history
- `/api/webhooks/n8n/[flowId]` - Run prompts via n8n for automation bonus

### Webhooks
PromptFlow provides webhook endpoints for n8n integration to qualify for automation bonuses:
- All webhook calls must include a valid API key in the Authorization header
- Webhook endpoints tag transactions with 'n8n_api' source
- Credit consumption is logged for monthly bonus calculation

## Implementation Details

The credit system is implemented in the following key files:

- `/src/lib/credits.ts` - Core credit management functionality
- `/src/lib/models/modelRegistry.ts` - Model definitions and pricing
- `/src/utils/creditManager.ts` - Credit transaction utilities
- `/src/lib/automation/bonusTierCalculator.ts` - Automation bonus calculation

## Best Practices

- Always use the standardized credit functions from `/lib/credits.ts`
- Use `calculatePromptCreditCost()` to calculate costs before running prompts
- Tag credit transactions with appropriate sources for analytics
- Use the n8n webhooks for automation to qualify for bonuses