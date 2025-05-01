# PromptFlow

A modular prompt marketplace where users can create, run, and chain AI prompts.

## Features

- Browse single prompts and multi-step prompt flows
- Run prompts by filling in input fields and seeing results immediately
- Create and publish individual prompts
- Build advanced flows by chaining multiple prompts together
- Spend credits per prompt execution
- Export flows to external automation platforms

## Core Concepts

### Single Prompts
Individual prompts tied to specific AI models with defined input/output structure.

#### Supported Models
- **Text Generation**: GPT-4, GPT-4o, Sonar (small, medium, large) via API
- **Image Generation**: DALL-E 3 via OpenAI API (direct, one model prompts)

#### Updated Prompts List
- **Image Prompt Writer**: Create detailed text prompts for image generation tools
- **Product Description Generator**: Create professional product descriptions
- **Brand Style Guide Creator**: Generate comprehensive brand guidelines
- **DALL-E Image Creator**: Generate images directly with OpenAI's DALL-E 3
- **Character Portrait Generator**: Create detailed character portraits and concept art
- **Product Mockup Generator**: Create professional product mockups for marketing
- **Landscape Scene Generator**: Create beautiful landscape images for backgrounds

### Prompt Flows
Chains of prompts where outputs from one step feed into the next, creating powerful automation sequences. This is the proper way to connect multiple models (like text generation followed by image generation).

#### Content Creation Flow Example
The Content Creation Flow demonstrates how to chain multiple prompts together for a complete workflow:

1. **Step 1: Generate Blog Post**
   - Uses the "Blog Post Generator" prompt
   - Creates a complete blog post based on your topic, tone, and audience

2. **Step 2: Create Image Prompt for DALL-E**
   - Uses the "Image Prompt Writer" prompt
   - Takes the blog post output and creates a detailed image description

3. **Step 3: Generate Matching Image**
   - Uses the "DALL-E Image Creator" prompt
   - Takes the detailed image description and generates a matching image

This flow showcases how to:
- Pass outputs from one step to inputs of the next step
- Combine text generation with image generation
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
│   │   └── run/                # Execute prompts and flows
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

### Implemented
- Basic data models for prompts and flows
- Storage for prompts, flows, and unlocked items
- Creator UI for building prompts and flows
- Marketplace UI for browsing and filtering
- Flow execution system with step visualization
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
7. ~~Non-functional image transformation prompts~~ (Fixed May 2025)
8. ~~Outdated prompt references in flow examples~~ (Fixed May 2025)

## Latest Updates

### Direct Image Generation Support (May 2025)
- Added 4 new prompts that use DALL-E 3 for direct image generation
- Implemented DALL-E Image Creator for general image creation
- Added specialized generators for Character Portraits, Product Mockups, and Landscapes
- Each prompt follows the one prompt, one model principle
- Created distinct input fields with appropriate options for each use case
- Integrated properly with the credit system
- Updated Content Creation Flow example to use current prompts
- Added third step to the flow to showcase direct image generation

### Prompt Consistency Update (May 2025)
- Renamed and refined prompts to better match their single-model functionality
- Updated "Marketing Image Description Creator" to "Image Prompt Writer"
- Changed "Product Visualization" to "Product Description Generator"
- Updated "Brand Mood Board Creator" to "Brand Style Guide Creator"
- Fixed misleading descriptions that implied image generation within single prompts
- Made all prompt descriptions clearly indicate their text-only output purpose

### Image Transformation Prompts Removal (May 2025)
- Removed non-functional image transformation prompts that didn't work with OpenAI API
- Eliminated prompts with 'transformation' capability and 'gpt-image-1' model
- Removed prompts: Lego Character Transformation, Studio Ghibli Art Style, Pixel Art Converter, Oil Painting Portrait, and Comic Book Hero Transformation
- Updated remaining prompts to strictly follow the one prompt, one model principle
- Removed dual-model prompts that had both text and image capabilities
- Simplified types to maintain only working models with clear separation of concerns

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
