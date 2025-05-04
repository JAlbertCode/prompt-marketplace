# PromptFlow Credit System

## Overview

The PromptFlow credit system manages payments and rewards in the marketplace with these key features:

- **Credit Value**: 1 credit = $0.000001 (1,000,000 credits = $1.00)
- **Whole-Number Credits**: All credit amounts are whole numbers (no decimals)
- **Three-Part Pricing**:
  - Base Inference Cost (from model)
  - Creator Fee (optional, 80% to creator, 20% to platform)
  - Platform Markup (when no creator fee)

## Platform Markup Logic

```typescript
if (inferenceCost < 10_000)         // < $0.01
  platformMarkup = inferenceCost * 0.20;  // 20% markup
else if (inferenceCost < 100_000)   // < $0.10
  platformMarkup = inferenceCost * 0.10;  // 10% markup
else
  platformMarkup = 500;             // Flat 500 credits ($0.0005)
```

## Testing the Credit System

A dedicated testing page is available at `/test-credits` where you can:

1. View credit balances for test users
2. Add credits to test accounts
3. Test prompt runs with credit deductions
4. View transaction history
5. Observe creator payments

### Running the Test Environment

1. Apply the schema migration:
   ```
   npx prisma migrate dev --name credit-system
   ```

2. Run the credit migration script:
   ```
   npx ts-node scripts/migrate-credits.ts
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Visit `http://localhost:3000/test-credits` to interact with the credit system

## Implementation Details

### Core Files

- **Credit Manager**: `/utils/creditManager.ts`
  - Handles all credit operations and transactions
  - Provides methods for adding/deducting credits
  - Calculates costs based on model and creator fees

- **Model Registry**: `/lib/models/modelRegistry.ts`
  - Stores all available AI models
  - Defines base costs in whole-number credits
  - Provides model information throughout the app

- **Model Costs**: `/lib/models/modelCosts.ts`
  - Provides utility functions for cost calculations
  - Handles credit-to-dollar conversions
  - Formats costs for display

### API Endpoints

- **GET /api/credits/balance** - Get a user's credit balance
- **GET /api/credits/transactions** - Get a user's transaction history
- **POST /api/credits/add** - Add credits to a user's account
- **POST /api/credits/calculate-cost** - Calculate cost for prompt execution
- **POST /api/credits/charge-prompt** - Charge credits for a prompt run

### Database Models

- **UserCredits** - Stores user credit balances
- **CreditTransaction** - Records all credit movements
- **PromptRun** - Tracks prompt executions with cost breakdowns
- **UnlockedFlow** - Records flow unlocks by users

## Revenue Distribution

When a user runs a prompt with a creator fee:
- 80% of the creator fee goes to the creator
- 20% of the creator fee goes to the platform
- Base inference cost is kept by the platform to cover API costs

When a user unlocks a flow:
- 80% of the unlock fee goes to the creator
- 20% of the unlock fee goes to the platform

## Production Considerations

For production deployment:
1. Ensure proper error handling and transaction integrity
2. Implement a proper payment gateway for credit purchases
3. Add authentication and authorization to credit API endpoints
4. Set up regular database backups
5. Implement monitoring for credit transactions
6. Consider rate limiting on credit operations
