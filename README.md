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

### In Progress
- API integration with Sonar - Currently experiencing CORS issues
- Proxy API route for Sonar API calls
- Fixing client/server component architecture

### Current Status
- ✅ Fixed the React.use() error in the [promptId] page by removing React.use() and accessing params directly
- ⚠️ Still need to test API integration with Sonar through the proxy route
- ⚠️ Credit system needs to be tested end-to-end
- ⚠️ UI polish and error handling improvements needed
## Next Steps
- ✅ Fix the React.use() error in the [promptId] page
- Test and debug the Sonar API integration through the proxy route:
  - Verify API key is correctly passed to the server-side route
  - Check for any CORS issues
  - Add proper error handling
- Implement loading states and error messages for API calls
- Test the credit system end-to-end
- Add visual polish and improve user experience
- Add comprehensive error handling

## How It Works

### Credit System

- Each user starts with 1000 credits
- Credits are deducted when prompts are run, based on the prompt's cost
- Credit balance is stored in localStorage and persists between sessions
- Low credit warnings appear when balance falls below 200 credits

### Sonar API Integration

- The application uses a server-side API route to proxy requests to Perplexity Sonar API
- System prompts remain hidden from users during execution
- Responses from the API are displayed and can be downloaded

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
