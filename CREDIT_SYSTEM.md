# PromptFlow Credit System

This document outlines the credit system in PromptFlow, including the recent interface improvements and credit management features.

## Overview

PromptFlow uses a credit-based system where:
- 1 credit = $0.000001 USD
- $1 = 1,000,000 credits

Credits are used to run prompts, flows, and other operations on the platform. Different models have different credit costs based on prompt length and complexity.

## Credit Management Interface

The credit management experience has been completely redesigned for consistency and ease of use:

### Key Features

1. **Consistent Credit Access**
   - Credit button available from all parts of the application
   - Credit balance visible in the main navigation
   - One-click access to credit management

2. **Credit Pages**
   - **Purchase Credits**: Buy credit bundles with bonus credits
   - **Transaction History**: Track all credit transactions
   - **Usage Analytics**: Visualize usage patterns by model and time

3. **Credit Dashboard Widget**
   - Quick access from the main dashboard
   - Shows credit breakdown (purchased, bonus, referral)
   - Real-time balance updates

## Credit Components

The following components have been created to manage the credit system:

### 1. CreditsButton
A versatile button component for accessing credit management from anywhere in the app.

```jsx
<CreditsButton 
  credits={userCredits} 
  variant="minimal" // "default", "minimal", or "icon"
/>
```

### 2. CreditPageHeader
A unified header for all credit-related pages.

```jsx
<CreditPageHeader 
  title="Page Title" 
  description="Description text"
  credits={totalCredits}
/>
```

### 3. CreditWidget
A dashboard widget displaying credit information.

```jsx
<CreditWidget userId={session.user.id} />
```

## Credit Types

There are three types of credits in PromptFlow:

1. **Purchased Credits**
   - Bought directly through credit bundles
   - Never expire
   - Highest priority in burn order

2. **Bonus Credits**
   - Included with purchases or earned through automation
   - May have expiration dates
   - Second priority in burn order

3. **Referral Credits**
   - Earned by referring new users
   - May have expiration dates
   - Lowest priority in burn order

## Credit Bundles

The following credit bundles are available for purchase:

| Bundle | Price | Base Credits | Bonus Credits | Total Credits | Price/Million |
|--------|-------|--------------|---------------|---------------|---------------|
| Starter | $10  | 10M          | 0             | 10M           | $1.00         |
| Basic   | $25  | 25M          | 2.5M          | 27.5M         | $0.91         |
| Pro     | $50  | 50M          | 7.5M          | 57.5M         | $0.87         |
| Business| $100 | 100M         | 20M           | 120M          | $0.83         |
| Enterprise| $100| 100M         | 40M           | 140M          | $0.71*        |

*Enterprise tier requires a minimum monthly burn of 1.4M credits.

## Automation Bonuses

Users with automated flows receive monthly bonuses based on usage:

| Monthly Burn | Bonus Credits |
|--------------|---------------|
| 100K-299K    | 10,000        |
| 300K-599K    | 40,000        |
| 600K-999K    | 100,000       |
| ≥1.4M        | 400,000 (auto-enterprise) |

## Credit Transaction History

The transaction history page provides:
- Detailed record of all credit operations
- Filtering by time period
- Export functionality
- Visualization of usage patterns

## Usage Analytics

The usage analytics page shows:
- Model usage breakdown
- Usage over time (7/30/90 day views)
- Credit burn rate and projections

## Implementation Details

All credit components use the "use client" directive for client-side interactivity and follow Next.js App Router best practices. Credit information is loaded asynchronously with proper error handling to ensure the UI remains functional even if the credit system encounters issues.
