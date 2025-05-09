# Credit System Migration Guide

This guide explains how to migrate from the legacy credit system to the new bucket-based credit system which supports Stripe integration.

## Overview

The new credit system introduces several improvements:

1. **Credit Buckets**: Credits are now stored in buckets with different types (purchased, bonus, referral)
2. **Expiry Dates**: Credits can optionally expire (especially bonus credits)
3. **Stripe Integration**: Complete payment flow with Stripe Checkout
4. **Creator Revenue Sharing**: Automatic distribution of creator fees
5. **Transaction History**: Detailed transaction tracking and filtering

## Migration Steps

### 1. Update Dependencies

First, ensure you have the latest dependencies:

```bash
npm install
```

### 2. Apply Database Migrations

Run the Prisma migration to update the database schema:

```bash
npm run migrate
```

Alternatively, if you're in development and want to push the schema directly:

```bash
npm run db:push
```

### 3. Seed Credit Data

To migrate existing users' credits to the new bucket system:

```bash
npm run seed:credits
```

This script will:
- Create purchased credit buckets for existing users with their legacy credits
- Add a small bonus amount to migrated users
- Create starter buckets for new users

### 4. Configure Stripe (Production Only)

In production, you'll need to set up Stripe:

1. Create a Stripe account if you don't have one
2. Set up Stripe products for each credit bundle (Starter, Basic, Pro, etc.)
3. Configure Stripe webhook endpoints
4. Add your Stripe keys to environment variables:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 5. Test the Integration

In development mode, you can use the development mode which skips the actual Stripe checkout:

```
NEXT_PUBLIC_SKIP_STRIPE=true
```

This allows you to test the credit purchase flow without setting up Stripe.

### Database Changes

The migration adds the following tables:

- `CreditBucket`: Stores credit balances with types and expiry
- `CreditBonus`: Tracks automation bonus allocations
- `FlowUnlock`: Replaces UnlockedFlow with additional data

It also modifies `CreditTransaction` to include more detailed information.

## Rollback (If Needed)

If you need to rollback the migration, you can use:

```bash
npx prisma migrate reset
```

**Warning**: This will reset your entire database. Make sure you have backups.

## Support

If you encounter any issues during migration, please contact the development team.
