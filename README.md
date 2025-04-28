# Sonar Prompt Marketplace

A web application for browsing, running, and creating AI prompts powered by the Perplexity Sonar API.

## Project Overview

Sonar Prompt Marketplace is a platform where users can:

- Browse a curated list of optimized prompts
- Run prompts with custom inputs and view results in real-time
- Create and publish their own prompts
- Manage credits for prompt execution
- Access webhook URLs for external automation (optional feature)

## Tech Stack

- **Frontend Framework**: Next.js with TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Notifications**: react-hot-toast
- **API Integration**: Perplexity Sonar API

## Credit System

### Overview

The credit system in Sonar Prompt Marketplace forms the economic backbone of the platform. It provides a standardized mechanism for pricing prompt executions, compensating prompt creators, and ensuring the platform's sustainability.

### How Credits Work

- **Credits as Currency**: Credits function as the internal currency of the platform
- **Pay-per-Use Model**: Users spend credits each time they run a prompt
- **Baseline Costs**: Every prompt has a minimum cost based on the model it uses
- **Creator Premium**: Prompt creators can charge additional credits beyond the baseline

### Credit Cost Structure

#### Baseline Costs

The baseline cost for each prompt is determined by the model it uses:

| Model            | Baseline Credits | Reasoning                              |
|------------------|-----------------|----------------------------------------|
| sonar-small-online | 15             | Basic model with minimal compute needs |
| sonar-medium-chat  | 25             | Moderate compute requirements          |
| sonar-large-online | 40             | High compute requirements              |

These baseline costs are calculated by:
1. Determining the average cost per API call to the model
2. Converting that cost to an appropriate number of credits
3. Ensuring margin to cover platform operations

#### Creator Premium

Prompt creators can set an additional premium on top of the baseline cost:

- **Minimum**: Baseline cost (we must cover our API costs)
- **Maximum**: No hard limit, but market forces naturally limit what users will pay
- **Recommended**: Baseline + 5-50 credits depending on the value provided

### Economic Model

#### For the Platform

The credit system allows the platform to:

1. **Cover API Costs**: Baseline credits ensure that the actual costs of Sonar API calls are covered
2. **Generate Revenue**: A portion of the premium can be retained by the platform
3. **Scale Economically**: Higher-value/higher-cost prompts naturally generate more revenue

#### For Creators

The credit system incentivizes creators to:

1. **Create Quality Prompts**: Better prompts can command higher premiums
2. **Optimize for Efficiency**: Using smaller models when possible reduces baseline costs
3. **Build a Reputation**: Popular prompt creators can gradually increase their premiums

#### For Users

The credit system provides users with:

1. **Transparency**: Clear cost before running any prompt
2. **Value Assessment**: Users can decide if a prompt is worth its credit cost
3. **Budget Control**: Credit balance provides natural usage limits

### Implementation Details

- Credit validation ensures costs are never below model baseline
- Visual indicators show when credits are low (< 200)
- Clear warnings when credits are insufficient for a prompt run
- System automatically enforces minimum costs during prompt creation

### Future Enhancements

1. **Credit Purchases**: Ability to buy credits with real currency
2. **Creator Payouts**: Mechanisms to compensate popular prompt creators
3. **Subscription Models**: Options for unlimited access to certain prompt categories
4. **Usage Analytics**: Tools for creators to see how their prompts are performing

## Current Implementation Status

### Completed
- Project structure and initial setup
- Type definitions for prompts and API interactions
- State management using Zustand stores (prompts and credits)
- UI components for the marketplace
- Basic routing and page templates
- Fixed hydration errors in the root layout
- Fixed prompt loading issues in the run page
- Implemented proper client-side initialization for components
- Credit system implementation with model-based baseline costs
- Search and filtering functionality
- Favorites system with dedicated page
- Improved modal display for example outputs with React Portal

### In Progress
- API integration with Sonar - Currently experiencing CORS issues
- Proxy API route for Sonar API calls
- Improving client/server component architecture

## Recent Improvements

### UI Enhancements
1. **Example Display** - Completely reimplemented example modal using React Portal for stable rendering
2. **Card Layout** - Fixed styling to ensure consistent card heights and proper positioning of elements
3. **Credit System** - Implemented full credit system with visual indicators for low balance
4. **Search and Filtering** - Added search functionality with model type and credit cost filtering

### New Features
1. **Favorites System** - Users can now favorite prompts and access them via a dedicated page
2. **Better Error Handling** - Added robust error checking throughout the application
3. **Credit Warnings** - Visual feedback when credits are low or insufficient for a prompt
4. **UI Polish** - Active state indicators for navigation, better spacing, and responsive design
5. **Modal Animations** - Smooth animations for modal opening/closing with improved accessibility

### Bug Fixes
1. Fixed hydration errors in the application
2. Fixed "getPrompt is not a function" and "removePrompt is not a function" errors
3. Ensured proper client-side initialization for components
4. Fixed deployment issues on Vercel
5. Fixed modal flickering and display issues with React Portal implementation

## Work In Progress and Handoff Notes

### Current Implementation Status
- ✅ Fixed the React.use() error in the [promptId] page by keeping the original params access method
- ✅ Updated the API endpoint from 'sonar.perplexity.ai/ask' to 'api.perplexity.ai/chat/completions'
- ✅ Added proper error handling for API responses
- ✅ Added max_tokens parameter to ensure complete responses
- ✅ Fixed model naming to use the 'sonar' model type supported by Perplexity API
- ✅ Added reset prompt store function to restore initial prompt templates
- ✅ Added example outputs to all prompts with toggle to preview
- ✅ Started implementation of prompt testing functionality
- ✅ Fixed hydration errors by adding suppressHydrationWarning to body and implementing proper client-side initialization
- ✅ Fixed the "getPrompt is not a function" error by checking for function existence before usage
- ✅ Added better error handling for when store functions are unavailable
- ✅ Fixed modal flickering issues with React Portal implementation
- ✅ Added accessibility improvements to modals (keyboard handling, focus management)
- ✅ Implemented smooth animations for modal transitions
- ✅ Implemented model-based credit cost system with automatic baseline enforcement
- ✅ Added favorites system for saving and accessing favorite prompts
- ✅ Added search and filtering for finding specific prompts

## Latest Implementations

### N8N Webhook Integration
We've added a complete N8N webhook integration example to the Webhook Display component:

- Detailed step-by-step instructions for setting up N8N workflows
- JSON payload example for prompt execution
- Visual guide explaining how webhooks work with the platform
- Toggle feature to show/hide the webhook documentation

### Credit Purchase System
Added a mock credit purchase system with the following features:

- Credit purchase options dropdown in the header
- Three pricing tiers (100, 500, and 1000 credits)
- Visual feedback when credits are purchased
- Improved styling for low credit warnings

### SEO Improvements
Enhanced metadata and search engine optimization:

- Improved page titles with relevant keywords
- Expanded meta descriptions
- Added OpenGraph data for better social sharing
- Keyword optimization for better search visibility

### Next Steps

1. **Enhance Webhook Functionality**:
   - Implement actual webhook API endpoint for external systems
   - Add request validation and authentication
   - Create webhook execution logs and history

2. **Improve Payment Integration**:
   - Integrate with a real payment provider (Stripe)
   - Add subscription plans for unlimited prompt usage
   - Implement creator payouts for popular prompts

3. **Advanced Analytics**:
   - Add usage analytics for prompt creators
   - Implement execution metrics and performance tracking
   - Create dashboard for prompt performance visualization

### Memory Considerations
- If you encounter memory limitations, focus on fixing one issue at a time
- Consider testing locally with a smaller dataset if needed

### Future Work (After Core Functionality)
- Implement N8N webhook example integration
- Expand search and filtering capabilities
- Improve UI feedback during execution
- Implement credit purchase system
- Develop creator payout mechanism

## Example Modal Implementation

The application uses a completely redesigned modal implementation for displaying example outputs:

- **React Portal** - Modals are rendered outside the normal DOM hierarchy using Portals
- **SSR Compatible** - Custom ClientPortal component ensures compatibility with Next.js SSR
- **Keyboard Support** - Modals can be closed with the Escape key
- **Focus Management** - Focus is trapped within the modal for accessibility
- **Smooth Animations** - Modals have fade and slide animations for a polished experience

## Known Issues and Workarounds

### Next.js Parameter Warning

You may see the following warning in the console:

```
A param property was accessed directly with `params.promptId`. `params` is now a Promise...
```

This warning appears because we're accessing route parameters directly in a Client Component. We've kept this implementation because using `React.use()` as suggested caused errors with our Client Component setup. This is a deprecation warning but does not affect functionality.

### Perplexity API Model Mapping

Perplexity API requires using specific model identifiers. We've implemented a mapping system that converts all our model types to the basic 'sonar' model for compatibility:

```typescript
const modelMap = {
  'sonar-small-online': 'sonar',
  'sonar-medium-chat': 'sonar',
  'sonar-large-online': 'sonar',
  // other models mapped to 'sonar'
};
```

Do not change this mapping or the application will encounter 400 Bad Request errors.

## How It Works

### Credit System

- Each user starts with 1000 credits
- Credits are deducted when prompts are run, based on the prompt's cost
- Credit balance is stored in localStorage and persists between sessions
- Low credit warnings appear when balance falls below 200 credits
- Prompt costs are automatically set to at least the baseline cost for the selected model

### Sonar API Integration

- The application uses a server-side API route to proxy requests to Perplexity API through the `/chat/completions` endpoint
- System prompts remain hidden from users during execution
- Responses from the API are displayed and can be downloaded
- Error handling is implemented for API failures

### Prompt Creation

- Users can create custom prompts with defined input fields
- System prompts and input definitions are stored locally
- Prompts can have different credit costs and use different Sonar models
- The system enforces minimum credit costs based on the selected model

### Favorites System

- Users can mark prompts as favorites for quick access
- Favorites are stored in localStorage and persist between sessions
- A dedicated favorites page shows all saved prompts
- The header displays the number of favorites for easy access

### Search and Filtering

- Users can search prompts by title and description
- Filtering by model type to find prompts using specific models
- Credit cost filtering to find prompts within a budget range
- Results update in real-time as filters are applied

## Development

### Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with required API keys (copy from `.env.local.example`)
4. Start the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

```
SONAR_API_KEY=your_api_key_here
```

## Directory Structure

```
/
├── public/            # Static assets
├── src/
│   ├── app/           # Next.js app router pages
│   │   ├── page.tsx   # Home page (prompt listing)
│   │   ├── run/       # Prompt execution pages
│   │   ├── submit/    # Prompt creation page
│   │   ├── favorites/ # Favorites page
│   │   └── api/       # API routes for proxying Sonar requests
│   ├── components/    # Reusable UI components
│   │   ├── layout/    # Layout components (Header, Footer, ClientLayout)
│   │   ├── shared/    # Shared UI components (Button, LoadingIndicator)
│   │   └── ui/        # Specialized UI components (PromptCard, PromptForm, etc.)
│   ├── lib/           # Utilities and helper functions
│   │   ├── sonarApi.ts         # Sonar API integration
│   │   ├── promptHelpers.ts    # Helpers for prompt management
│   │   ├── creditHelpers.ts    # Functions for credit management
│   │   └── downloadHelpers.ts  # Functions for downloading outputs
│   ├── store/         # Zustand store configurations
│   │   ├── usePromptStore.ts   # Store for prompts data
│   │   ├── useCreditStore.ts   # Store for credit management
│   │   └── useFavoriteStore.ts # Store for favorites management
│   └── types/         # TypeScript type definitions
└── ... configuration files
```

## License

MIT
