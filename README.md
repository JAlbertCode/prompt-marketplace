# PromptFlow

A modular prompt marketplace where users can create, run, and chain AI prompts.

## Features

- Browse single prompts and multi-step prompt flows
- Run prompts by filling in input fields and seeing results immediately
- Create and publish individual prompts
- Build advanced flows by chaining multiple prompts together
- Spend credits per prompt execution
- Export flows to external automation platforms
- User accounts with favorites, personal dashboard, and credit management
- User-owned prompts and flows with publishing controls

## Model Registry System

The platform uses a centralized model registry system to manage all available AI models:

- **Central Registry**: All models are defined in a single source of truth at `/src/lib/models/modelRegistry.ts`
- **Model Metadata**: Each model includes comprehensive metadata such as provider, type, capabilities, pricing, and status
- **Transparent Pricing**: Base costs are calculated from actual provider API pricing with clear formulas
- **Consistent Usage**: All components reference the same registry for model information
- **User Interface**: Model details are displayed consistently throughout the application
- **Flexible Creator Fees**: Creators can set optional fees that are added to the base cost
- **Cost Calculations**: Automatic calculation of total cost with platform fees

The model registry supports multiple model types:
- **Text Generation**: Models like GPT-4, GPT-4o, and Sonar series
- **Image Generation**: Models like DALL-E 3, DALL-E 2, and Stable Diffusion
- **Hybrid Models**: Models that support both text and image capabilities

Components that use the model registry:
- `ModelInfoBadge`: Displays model information with cost breakdown
- `EnhancedModelSelector`: Improved model selection interface with filtering
- `ModelCard`: Detailed card view for models with complete pricing information
- `PriceCalculator`: Component for calculating costs with different fee structures

### Core Concepts
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

### User Account System
- **User Authentication**: Register and login with email/password or OAuth (GitHub, Google)
- **User Dashboard**: View all your created prompts and flows
- **Favorites**: Save prompts and flows for quick access
- **User Settings**: Manage profile information and password
- **Credit Management**: View balance and purchase credits

### Credit System
- 1,000 credits = $1.00
- Transparent cost breakdown for all transactions
- Each prompt has three cost components:
  - System cost (based on actual provider API pricing)
  - Creator fee (optional, set by prompt creator, defaults to 0)
  - Platform fee (10% of creator fee or 100 credits minimum)
- Each step in a flow burns credits separately when executed
- Creators earn 90% of unlock fees for premium flows
- Platform takes only 10% of prompt and flow fees

### Marketplace
- Browse both single prompts and flows
- Filter by type (Single/Flow), price (Free/Paid), and popularity
- Creators can sell prompt flows with one-time unlock fees

## Tech Stack

The project is built with a practical, scalable architecture:

- **Frontend**: Next.js with App Router + TypeScript
- **Authentication**: NextAuth.js with JWT strategy
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Notifications**: react-hot-toast
- **API**: Perplexity Sonar API, OpenAI API
- **Payments**: Stripe integration (planned)

### Scalability Considerations

The architecture is designed for practical initial deployment with a clear path to scale:

- **Authentication**: NextAuth.js with the JWT strategy works well for the initial user base. Can be switched to database sessions for larger scale.
- **Database**: Postgres provides a solid foundation. Ready for connection pooling and read replicas when needed.
- **API Design**: RESTful endpoints with modular structure for easy maintenance and scaling.
- **Caching**: Next.js built-in caching utilized for static content. Can add Redis or similar when needed.
- **Statelessness**: Components designed to be stateless to support horizontal scaling later.

## Getting Started

1. Clone the repository
2. Copy `.env.local.example` to `.env.local` and fill in the required values
3. Install dependencies: `npm install`
4. Create and migrate the database: `npx prisma migrate dev`
5. Run the development server: `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000) in your browser

### First-time Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create database migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

## Project Structure

```
/
├── prisma/                   # Database schema and migrations
├── src/
│   ├── app/                  # App routes
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication API
│   │   │   ├── credits/      # Credit management API
│   │   │   ├── favorites/    # Favorites API
│   │   │   ├── flows/        # Flows API
│   │   │   ├── prompts/      # Prompts API
│   │   │   ├── register/     # User registration API
│   │   │   └── user/         # User profile API
│   │   ├── dashboard/        # User dashboard
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   ├── settings/         # User settings
│   │   ├── create/           # Create prompts and flows
│   │   ├── run/              # Execute prompts and flows
│   │   └── page.tsx          # Marketplace home page
│   ├── components/           # UI components
│   │   ├── layout/           # Layout components
│   │   ├── marketplace/      # Marketplace components
│   │   ├── creator/          # Prompt and flow creation
│   │   ├── runner/           # Prompt and flow execution
│   │   └── ui/               # Common UI elements
│   ├── providers/            # React context providers
│   ├── utils/                # Utilities and helpers
│   │   ├── creditManager.ts  # Credit management logic
│   │   ├── imageTransformer.ts # Image transformation
│   │   ├── validationRules.ts # Input validation
│   │   └── exportManager.ts  # Export functionality
│   ├── lib/                  # Utilities and logic
│   │   ├── store/            # Zustand stores
│   │   ├── api/              # API integrations
│   │   └── utils/            # Helper utilities
│   ├── types/                # TypeScript definitions
│   └── styles/               # Global styles
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

### Recently Added (May 2025)
- **User Authentication System**: Register, login, profile management
- **User Dashboard**: View and manage your prompts and flows
- **Favorites Management**: Save and organize your favorite prompts and flows
- **Profile Settings**: Update user profile and change password
- **Credit Purchase System**: Buy credits with integrated payment processing
- **Creator Payments**: Automatic distribution of fees to prompt creators

### In Progress
- Editing published prompts
- Search functionality for prompt selection in flow builder
- Comprehensive image output handling
- Webhook URL functionality for flows
- Basic observability and logging

### Known Issues
1. No way to edit prompts after publication
2. Flow builder needs search functionality for adding prompts
3. Flow export implementation is incomplete
4. ~~Navigation issues in prompt execution flow~~ (Fixed April 2025)
5. ~~Image generation not displaying properly~~ (Fixed April 2025)
6. ~~Duplicate credit displays~~ (Fixed April 2025)
7. ~~Non-functional image transformation prompts~~ (Fixed May 2025)
8. ~~Outdated prompt references in flow examples~~ (Fixed May 2025)
9. ~~Inconsistent navigation with favorites and create buttons~~ (Fixed May 2025)
10. ~~"Flow not found" error when clicking on flows from home page~~ (Fixed May 2025)

## Latest Updates

### Credit System Improvements (May 2025)
- Reduced platform fee from 20% to 10% for prompt runs and flow unlocks
- Added transparent cost breakdown in prompt creation UI
- Improved clarity on how credits are calculated and distributed
- Created separate creator fee field distinct from total prompt cost
- Added real-time cost calculation based on selected model and creator fee
- Ensured users cannot set costs below the baseline system cost
- Updated all related documentation to reflect the new fee structure

### Navigation & Interface Updates (May 2025)
- Consolidated favorites functionality to use the same UI/logic throughout the application
- Fixed navigation issues with inconsistent favorites button behavior
- Standardized "Create" button to always navigate to the main create page
- Fixed "Flow not found" error when clicking on flows from the home page
- Improved flow navigation to properly validate and load flow data
- Unified user experience for favorites between navbar and dashboard
- Implemented automatic redirect from standalone favorites page to dashboard
- Enhanced marketplace card data to ensure proper flow rendering

### User Account System (May 2025)
- Implemented complete user authentication with email/password and OAuth
- Created user dashboard for managing personal prompts and flows
- Added favorites system for saving prompts and flows
- Created user profile and settings management
- Integrated credit purchase system with secure payment processing
- Implemented creator payment distribution for prompt fees
- Added favorites management for organizing saved content

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

## Contributing

To continue development:
1. Address the known issues listed above
2. Complete the flow execution components
3. Finalize the export functionality
4. Improve user dashboard features and analytics
5. Enhance credit purchase options and history
