# PromptFlow

A modular prompt marketplace where users can create, run, and chain AI prompts.

## Features

- Browse single prompts and multi-step prompt flows
- Run prompts by filling in input fields and seeing results immediately
- Create and publish individual prompts
- Build advanced flows by chaining multiple prompts together
- Transform images with AI using GPT-4o (new!)
- Spend credits per prompt execution
- Export flows to external automation platforms

## Core Concepts

### Single Prompts
Individual prompts tied to specific AI models (text or image generation) with defined input/output structure.

### Image Transformations
Specialized prompts that allow users to upload their own photos and transform them into different artistic styles, characters, or scenes using GPT-4o's advanced image generation capabilities. Examples include:

- Transforming photos into Lego characters
- Converting images to Studio Ghibli animation style
- Creating pixel art from photographs
- Turning photos into oil paintings or comic book art

### Prompt Flows
Chains of prompts where outputs from one step feed into the next, creating powerful automation sequences.

#### Content Creation Flow Example
The Content Creation Flow demonstrates how to chain multiple prompts together for a complete workflow:

1. **Step 1: Generate Blog Post**
   - Uses the "Blog Post Generator" prompt
   - Creates a complete blog post based on your topic, tone, and audience

2. **Step 2: Create Image Description for DALL-E**
   - Uses the "Marketing Image Description Creator" prompt
   - Takes the blog post output and creates a detailed image description
   - This description is then used to generate an image with DALL-E 3

This flow showcases how to:
- Pass outputs from one step to inputs of the next step
- Combine text generation (Sonar API) with image generation (DALL-E API)
- Create a complete content package (text + matching image) in one workflow

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
│   │   ├── page.tsx            # Marketplace home page
│   │   ├── create/             # Create prompts and flows
│   │   ├── run/                # Execute prompts and flows
│   │   └── transform/          # Image transformation
│   ├── components/             # UI components
│   │   ├── layout/             # Layout components
│   │   ├── marketplace/        # Marketplace components
│   │   ├── creator/            # Prompt and flow creation
│   │   ├── runner/             # Prompt and flow execution
│   │   ├── transformer/        # Image transformation components
│   │   └── ui/                 # Common UI elements
│   ├── lib/                    # Utilities and logic
│   │   ├── store/              # Zustand stores
│   │   ├── api/                # API integrations
│   │   └── utils/              # Helper utilities
│   ├── types/                  # TypeScript definitions
│   └── styles/                 # Global styles
```

## Development Status

### Implemented
- Basic data models for prompts and flows
- Storage for prompts, flows, and unlocked items
- Creator UI for building prompts and flows
- Marketplace UI for browsing and filtering
- Flow execution system with step visualization
- Image transformation with GPT-4o integration
- Photo upload and style customization
- Multiple artistic styles and character transformations
- Improved select input options in PromptBuilder
- Proper prompt identification in flows
- Fixed image generation in flows
- Favorite prompt functionality from flows

### In Progress
- Editing published prompts
- Search functionality for prompt selection in flow builder
- Comprehensive image output handling
- Webhook URL functionality for flows

### Known Issues
1. No way to edit prompts after publication
2. Flow builder needs search functionality for adding prompts
3. Flow export implementation is incomplete
4. ~~Navigation issues in prompt execution flow~~ (Fixed April 2025)
5. ~~Image generation not displaying properly~~ (Fixed April 2025)
6. ~~Duplicate credit displays~~ (Fixed April 2025)

## Latest Updates

### Image Transformation Features (April 2025)
- Added photo upload and transformation using GPT-4o
- Created specialized transformation prompts for various styles and characters
- Implemented user-friendly interface for image transformations
- Added style presets and customization options
- Integrated with existing credit system

### UI and Navigation Improvements (April 2025)
- Fixed navigation in the prompt execution flow for easier return to the marketplace
- Improved image generation to properly display generated images
- Removed duplicate credit displays across the application
- Updated hero section to better account for prompt flows
- Added breadcrumb navigation for better user orientation
- Enhanced image generation prompts for better quality results

### Flow Execution UI Improvements
- Input fields are now organized by prompt/step for clarity
- Added prompt step preview on the flow execution page
- Each step now shows which specific prompt is being used
- Fixed card text truncation with line clamping
- Positioned flow buttons and credits consistently at the bottom of cards
- Improved flow step visualization with vertical timeline view

### Select Options Enhancement
- Added proper UI for managing select field options in the PromptBuilder
- Fields now display a dedicated options editor when the type is set to 'select'
- Multiple options can be added, edited, and removed

### Credit System Fixes
- Credits are now properly deducted when running flows
- Added credit warnings when insufficient credits are available
- Improved credit information display throughout the application

## Contributing

To continue development:
1. Address the known issues listed above
2. Complete the flow execution components
3. Finalize the export functionality
