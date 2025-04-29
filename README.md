# PromptFlow

A modular prompt marketplace where users can create, run, and chain AI prompts.

## Features

- Browse single prompts and multi-step prompt flows
- Run prompts by filling in input fields and seeing results immediately
- Create and publish individual prompts
- Build advanced flows by chaining multiple prompts together
- Spend credits per prompt execution
- Export flows to external automation platforms (optional)

## Core Concepts

### Single Prompts
Individual prompts tied to specific AI models (text or image generation) with defined input/output structure.

### Prompt Flows
Chains of prompts where outputs from one step feed into the next, creating powerful automation sequences.

### Credit System
- Each prompt execution costs credits
- Each step in a flow burns credits separately
- Users can earn or spend credits by running or unlocking prompts/flows

### Marketplace
- Browse both single prompts and flows
- Filter by type (Single/Flow), price (Free/Paid), and popularity
- Creators can sell prompt flows with one-time unlock fees

## Tech Stack

- **Frontend**: Next.js + TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Notifications**: react-hot-toast
- **API**: Perplexity Sonar API
- **Persistence**: localStorage (MVP)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/
├── src/
│   ├── app/                    # App routes
│   ├── components/             # UI components
│   │   ├── layout/             # Layout components
│   │   ├── marketplace/        # Marketplace components
│   │   ├── creator/            # Prompt and flow creation
│   │   ├── runner/             # Prompt and flow execution
│   │   └── ui/                 # Common UI elements
│   ├── lib/                    # Utilities and logic
│   │   ├── store/              # Zustand stores
│   │   ├── api/                # API integrations
│   │   └── utils/              # Helper utilities
│   ├── types/                  # TypeScript definitions
│   └── styles/                 # Global styles
```

## Development Status

MVP in progress - see Issues for current tasks.
