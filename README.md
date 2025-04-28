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

### In Progress
- API integration with Sonar - Currently experiencing CORS issues
- Proxy API route for Sonar API calls
- Improving client/server component architecture

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

### Immediate Next Steps (For Next Bot)
1. Complete the prompt testing functionality in PromptCreator.tsx:
   - The test mode UI is implemented but needs testing and debugging
   - Ensure test outputs are properly saved as examples
   - Fix the disabled button logic for the Create Prompt button

2. Fix merging of default templates with user-created ones:
   - We've added a merge strategy in usePromptStore.ts
   - Test that new users see all default templates
   - Ensure reset functionality properly restores all templates

3. Debug example output previews:
   - Make sure example outputs display properly in the PromptCard
   - Test toggle functionality for showing/hiding examples

### Memory Considerations
- If you encounter memory limitations, focus on fixing one issue at a time
- Consider testing locally with a smaller dataset if needed

### Future Work (After Core Functionality)
- Implement N8N webhook example integration
- Add search and filtering capability for prompts
- Improve UI feedback during execution
## Recent Improvements

### UI Enhancements
1. **Example Display** - Moved example outputs from in-card to a modal overlay for better space utilization
2. **Card Layout** - Fixed styling to ensure consistent card heights and proper positioning of elements
3. **Credit System** - Implemented full credit system with visual indicators for low balance
4. **Search and Filtering** - Added search functionality with model type and credit cost filtering

### New Features
1. **Favorites System** - Users can now favorite prompts and access them via a dedicated page
2. **Better Error Handling** - Added robust error checking throughout the application
3. **Credit Warnings** - Visual feedback when credits are low or insufficient for a prompt
4. **UI Polish** - Active state indicators for navigation, better spacing, and responsive design
5. **Modal Examples** - View example outputs in a full-screen modal for better readability

### Bug Fixes
1. Fixed hydration errors in the application
2. Fixed "getPrompt is not a function" and "removePrompt is not a function" errors
3. Ensured proper client-side initialization for components
4. Fixed deployment issues on Vercel

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

## Next Steps

- Add search and filtering for prompts on the home page
- Implement a favorites system for saving favorite prompts
- Add user profiles and the ability to share prompts
- Add tags/categories for better prompt organization
- Implement real webhook functionality

## How It Works

### Credit System

- Each user starts with 1000 credits
- Credits are deducted when prompts are run, based on the prompt's cost
- Credit balance is stored in localStorage and persists between sessions
- Low credit warnings appear when balance falls below 200 credits

### Sonar API Integration

- The application uses a server-side API route to proxy requests to Perplexity API through the `/chat/completions` endpoint
- System prompts remain hidden from users during execution
- Responses from the API are displayed and can be downloaded
- Error handling is implemented for API failures

### Prompt Creation

- Users can create custom prompts with defined input fields
- System prompts and input definitions are stored locally
- Prompts can have different credit costs and use different Sonar models

### Webhook URLs

- Each prompt has a dummy webhook URL for demonstration purposes
- The URLs show how external systems could potentially trigger prompts
- Webhook functionality is not implemented in the MVP

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
│   │   └── api/       # API routes for proxying Sonar requests
│   ├── components/    # Reusable UI components
│   │   ├── layout/    # Layout components (Header, Footer, ClientLayout)
│   │   ├── shared/    # Shared UI components (Button, LoadingIndicator)
│   │   └── ui/        # Specialized UI components (PromptCard, PromptForm, etc.)
│   ├── lib/           # Utilities and helper functions
│   │   ├── sonarApi.ts         # Sonar API integration
│   │   ├── promptHelpers.ts    # Helpers for prompt management
│   │   └── downloadHelpers.ts  # Functions for downloading outputs
│   ├── store/         # Zustand store configurations
│   │   ├── usePromptStore.ts   # Store for prompts data
│   │   └── useCreditStore.ts   # Store for credit management
│   └── types/         # TypeScript type definitions
└── ... configuration files
```

## License

MIT
