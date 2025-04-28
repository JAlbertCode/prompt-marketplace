# Sonar Prompt Marketplace

A web application for browsing, running, and creating AI prompts powered by the Perplexity Sonar API and OpenAI DALL-E image generation.

## Project Overview

PromptFlow Marketplace is a platform where users can:

- Browse a curated list of optimized prompts for text and image generation
- Run prompts with custom inputs and view results in real-time
- Create and publish their own prompts with optional creator fees
- Use credit system to manage prompt execution costs
- Share generated outputs directly on the platform
- Unlock prompts to access system prompts for learning

## Tech Stack

- **Frontend Framework**: Next.js with TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Notifications**: react-hot-toast
- **API Integration**:
  - Perplexity Sonar API for text generation
  - OpenAI DALL-E API for image generation

## Credit System

### Overview

The credit system in PromptFlow forms the economic backbone of the platform. It provides a standardized mechanism for pricing prompt executions, compensating prompt creators, and ensuring the platform's sustainability.

### How Credits Work

- **Credits as Currency**: Credits function as the internal currency of the platform
- **Pay-per-Use Model**: Users spend credits each time they run a prompt
- **Baseline Costs**: Every prompt has a minimum cost based on the model it uses
- **Creator Premium**: Prompt creators can charge additional credits beyond the baseline

### Credit Cost Structure

#### Baseline Costs

The baseline cost for each prompt is determined by the model it uses:

| Model Type | Model | Baseline Credits | Reasoning |
|------------|------------------|-----------------|----------------------------------------|
| **Text** | sonar-small-online | 15 | Basic model with minimal compute needs |
| **Text** | sonar-medium-chat | 25 | Moderate compute requirements |
| **Text** | sonar-large-online | 40 | High compute requirements |
| **Image** | dall-e-2 | 50 | Basic image generation |
| **Image** | dall-e-3 (standard) | 100 | High-quality image generation |
| **Image** | dall-e-3 (HD) | 200 | Premium image generation |

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

1. **Cover API Costs**: Baseline credits ensure that the actual costs of API calls are covered
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

## Image Generation Features

PromptFlow now supports image generation using OpenAI's DALL-E models. This allows users to:

1. **Create Visual Content**: Generate images from text descriptions
2. **Combine with Text Prompts**: Use both text and image generation in the same prompt
3. **Control Image Settings**: Specify size, quality, and style parameters
4. **Share Generated Images**: Easily share or download generated images

### Image Generation Models

- **DALL-E 2**: Faster, more affordable image generation
- **DALL-E 3**: Higher quality, more detailed image generation with better prompt adherence
- **DALL-E 3 HD**: Premium quality with enhanced details and resolution

### Image Generation Use Cases

PromptFlow includes templates for various image generation scenarios:

- **Marketing Materials**: Create professional advertising visuals
- **Product Visualization**: Generate realistic product images from descriptions
- **Brand Identity**: Create mood boards and visual design assets
- **Custom Illustrations**: Generate unique artwork for various purposes

### Technical Implementation

- Secure proxy API endpoint to OpenAI's DALL-E API
- Integration with the credit system to manage image generation costs
- Support for various image parameters including size, quality, and style
- Fallback mechanisms for development and testing

## Current Implementation Status

### Completed
- Project structure and initial setup
- Type definitions for prompts and API interactions
- State management using Zustand stores (prompts, credits, favorites, unlocked prompts)
- UI components for the marketplace
- Basic routing and page templates
- Credit system implementation with model-based baseline costs
- Search and filtering functionality
- Favorites system with dedicated page
- Enhanced Hero section with clear value proposition
- Sharing functionality for generated responses
- Image generation capability with DALL-E integration

### In Progress
- Improved card layout to prevent content overflow
- Complete image generation and display
- Enhanced prompt run page for both text and image outputs
- API integration refinements

### Up Next
- Auto top-up functionality for credit management
- Webhook integration for external automation
- Expanded image generation options

## Development

### Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with required API keys:
   ```
   SONAR_API_KEY=your_sonar_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Start the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Directory Structure

```
/
├── public/            # Static assets
├── src/
│   ├── app/           # Next.js app router pages
│   │   ├── page.tsx   # Home page (prompt listing)
│   │   ├── run/       # Prompt execution pages
│   │   ├── submit/    # Prompt creation page
│   │   ├── favorites/ # Favorites page
│   │   ├── shared/    # Shared response display
│   │   └── api/       # API routes for proxying requests
│   ├── components/    # Reusable UI components
│   │   ├── layout/    # Layout components (Header, Footer, Hero)
│   │   ├── shared/    # Shared UI components (Button, LoadingIndicator)
│   │   └── ui/        # Specialized UI components (PromptCard, etc.)
│   ├── lib/           # Utilities and helper functions
│   │   ├── sonarApi.ts        # Sonar API integration
│   │   ├── imageApi.ts        # DALL-E API integration
│   │   ├── creditHelpers.ts   # Credit management utilities
│   │   ├── shareHelpers.ts    # Sharing functionality
│   │   └── sessionHelpers.ts  # Session management
│   ├── store/         # Zustand store configurations
│   │   ├── usePromptStore.ts      # Store for prompts data
│   │   ├── useCreditStore.ts      # Store for credit management
│   │   ├── useFavoriteStore.ts    # Store for favorites management
│   │   └── useUnlockedPromptStore.ts # Store for unlocked prompts
│   └── types/         # TypeScript type definitions
└── ... configuration files
```

## License

MIT
