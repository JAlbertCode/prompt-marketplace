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

## MVP Scope

### Core Features

1. **Prompt Browsing**
   - View all available prompts
   - Display title, description, and credit cost

2. **Prompt Execution**
   - Fill in required inputs
   - Execute prompts with Sonar API
   - View and download results (text or images)
   - Deduct credits from user balance

3. **Prompt Creation**
   - Create new prompts with system instructions, input fields
   - Select AI model (e.g., sonar-small-online, sonar-medium-chat)
   - Set credit cost for execution
   - Publish to marketplace

4. **Credit System**
   - Start with 1000 credits
   - Deduct credits based on prompt cost
   - Display remaining credits
   - Show warnings for low balance

5. **Optional: Webhook Integration**
   - Display dummy webhook URLs for published prompts
   - Copy webhook URL for external integration

## How It Works

### Credit System

- Each user starts with 1000 credits
- Credits are deducted when prompts are run, based on the prompt's cost
- Credit balance is stored in localStorage and persists between sessions
- Low credit warnings appear when balance falls below 200 credits

### Sonar API Integration

- The application uses the Perplexity Sonar API for executing prompts
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
NEXT_PUBLIC_SONAR_API_KEY=your_api_key_here
```

## Directory Structure

```
/
├── public/            # Static assets
├── src/
│   ├── app/           # Next.js app router pages
│   │   ├── page.tsx   # Home page (prompt listing)
│   │   ├── run/       # Prompt execution pages
│   │   └── submit/    # Prompt creation page
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and helper functions
│   ├── store/         # Zustand store configurations
│   └── types/         # TypeScript type definitions
└── ... configuration files
```

## License

MIT
