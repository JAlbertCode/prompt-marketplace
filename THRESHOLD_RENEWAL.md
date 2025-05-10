# PromptFlow Threshold-Based Auto-Renewal System

This document outlines the threshold-based auto-renewal system for PromptFlow's credit system.

## Overview

Unlike traditional subscription models that renew on a fixed time schedule (monthly/yearly), PromptFlow implements a threshold-based auto-renewal system. This system automatically purchases new credits when a user's credit balance falls below a specified threshold.

## How It Works

1. **User Preferences**:
   - Users can enable/disable auto-renewal
   - Users select which credit bundle to purchase when the threshold is reached
   - Users set their minimum credit threshold (default: 10% of their last purchase)

2. **Threshold Check**:
   - After every credit burn operation, the system checks the user's remaining balance
   - If the balance falls below their threshold AND auto-renewal is enabled, a new purchase is triggered

3. **Purchase Process**:
   - System uses the user's default payment method stored in Stripe
   - Creates a new charge for the selected credit bundle
   - Adds new credits to the user's account
   - Sends a notification about the auto-renewal

## Implementation Components

### Database Schema

Additional fields needed for user preferences:

```prisma
model User {
  // existing fields
  autoRenewalEnabled    Boolean @default(false)
  autoRenewalThreshold  Int     @default(1000000)  // 1M credits by default
  autoRenewalBundleId   String? // ID of the bundle to purchase
  // other fields
}
```

### Credit Burn Logic

The credit burn function needs to check the threshold after burning:

```typescript
export async function burnCredits(options: BurnCreditsOptions): Promise<boolean> {
  // Existing burn logic...
  
  // After successful burn, check for auto-renewal threshold
  const remainingCredits = await getUserTotalCredits(userId);
  await checkAutoRenewalThreshold(userId, remainingCredits);
  
  return true;
}

async function checkAutoRenewalThreshold(userId: string, remainingCredits: number) {
  // Get user preferences
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      autoRenewalEnabled: true,
      autoRenewalThreshold: true,
      autoRenewalBundleId: true
    }
  });
  
  // If auto-renewal is enabled and credits are below threshold
  if (
    user?.autoRenewalEnabled && 
    user.autoRenewalBundleId &&
    remainingCredits < user.autoRenewalThreshold
  ) {
    // Trigger auto-renewal purchase
    await triggerAutoRenewal(userId, user.autoRenewalBundleId);
  }
}
```

### Payment Processing

The auto-renewal purchase function:

```typescript
async function triggerAutoRenewal(userId: string, bundleId: string) {
  try {
    // Get user's payment methods from Stripe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, email: true }
    });
    
    if (!user?.stripeCustomerId) {
      throw new Error('No Stripe customer ID found');
    }
    
    // Get bundle details
    const bundle = getCreditBundles().find(b => b.id === bundleId);
    if (!bundle) {
      throw new Error('Invalid bundle ID');
    }
    
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: bundle.price * 100, // Convert to cents
      currency: 'usd',
      customer: user.stripeCustomerId,
      automatic_payment_methods: { enabled: true },
      description: `Auto-renewal: ${bundle.name} Credit Bundle`,
      metadata: {
        userId,
        bundleId,
        isAutoRenewal: 'true'
      }
    });
    
    // Log the auto-renewal attempt
    await prisma.autoRenewalLog.create({
      data: {
        userId,
        bundleId,
        amount: bundle.price,
        paymentIntentId: paymentIntent.id,
        status: 'pending'
      }
    });
    
    // Send notification email
    await sendAutoRenewalNotification(user.email, bundle);
    
    return paymentIntent;
    
  } catch (error) {
    console.error('Auto-renewal failed:', error);
    
    // Log the failure
    await prisma.autoRenewalLog.create({
      data: {
        userId,
        bundleId,
        status: 'failed',
        errorMessage: error.message
      }
    });
    
    // Send failure notification
    await sendAutoRenewalFailureNotification(userId);
    
    throw error;
  }
}
```

### Stripe Webhook Handler

The webhook handler for handling auto-renewal payment events:

```typescript
// In webhook handler for 'payment_intent.succeeded'
if (event.type === 'payment_intent.succeeded') {
  const paymentIntent = event.data.object;
  
  // Check if this is an auto-renewal
  if (paymentIntent.metadata?.isAutoRenewal === 'true') {
    const { userId, bundleId } = paymentIntent.metadata;
    const bundle = getCreditBundles().find(b => b.id === bundleId);
    
    if (bundle && userId) {
      // Add base credits as purchased
      await addCredits(
        userId,
        bundle.baseCredits,
        'purchased',
        `auto_renewal_${bundleId}`
      );
      
      // Add bonus credits if any
      if (bundle.bonusCredits > 0) {
        await addCredits(
          userId,
          bundle.bonusCredits,
          'bonus',
          `auto_renewal_bonus_${bundleId}`,
          90 // 90 days expiry for bonus credits
        );
      }
      
      // Update auto-renewal log
      await prisma.autoRenewalLog.update({
        where: {
          paymentIntentId: paymentIntent.id
        },
        data: {
          status: 'completed',
          completedAt: new Date()
        }
      });
      
      // Send success notification
      await sendAutoRenewalSuccessNotification(userId, bundle);
    }
  }
}
```

## User Experience

### Settings Page

The auto-renewal settings page allows users to:

1. Enable/disable auto-renewal
2. Select which credit bundle to purchase when threshold is reached
3. Set their minimum credit threshold
4. View auto-renewal history

### Notifications

Users receive notifications:

1. When auto-renewal is about to trigger (at 110% of threshold)
2. When auto-renewal has been completed
3. If auto-renewal fails (payment issue)

### Transparency

The system provides complete transparency:

1. All auto-renewals are clearly logged in transaction history
2. Email receipts sent for all auto-renewal purchases
3. Users can disable auto-renewal at any time

## Testing Strategy

To ensure the auto-renewal system works correctly:

1. **Unit Tests**:
   - Verify threshold calculation logic
   - Test bundle selection logic
   - Validate payment processing

2. **Integration Tests**:
   - Simulate credit burn to trigger auto-renewal
   - Test Stripe webhook handling
   - Verify credit additions

3. **Edge Cases**:
   - Payment method failure handling
   - Threshold set to zero
   - Multiple rapid burns triggering multiple renewals

## Implementation Phases

1. **Phase 1: Core Functionality**
   - Database schema updates
   - Basic threshold detection
   - Payment processing

2. **Phase 2: User Interface**
   - Settings page
   - Notification system
   - Transaction history integration

3. **Phase 3: Optimizations**
   - Smart threshold suggestions
   - Budget controls
   - Usage forecasting

## Security Considerations

1. All payment information is stored securely in Stripe
2. No credit card details are stored in our database
3. All auto-renewal operations are logged for audit purposes
4. Automatic lockout after multiple failed payment attempts
5. Strict validation of threshold values

## Comparison to Traditional Subscriptions

| Feature | Threshold-Based | Traditional Subscription |
|---------|----------------|--------------------------|
| Billing Frequency | Variable (as needed) | Fixed (monthly/yearly) |
| User Control | High (set threshold) | Low (fixed dates) |
| Cost Efficiency | Pay only when needed | Pay regardless of usage |
| Implementation | Custom logic required | Simpler built-in APIs |
| User Experience | Based on actual usage | Time-based regardless of usage |
