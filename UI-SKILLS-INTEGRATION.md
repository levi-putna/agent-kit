# UI Skills Integration with Broader Development Harness

## Overview

The UI skills complement and integrate with the existing skill ecosystem you have in place. They fill a specific gap in the development workflow: **building and testing UI components in isolation with proper quality gates**.

## Your Existing Skills Ecosystem

Based on the agent-kit system, you already have access to:

### 1. **Prisma Skills** (Database Layer)
- `prisma-cli-migrate-dev` - Database migrations
- `prisma-client-api-model-queries` - Data access patterns
- `prisma-database-setup-*` - Database configuration
- And ~40 other Prisma-related skills

### 2. **Vercel Skills** (Deployment & Infrastructure)
- `next-forge` - Next.js project setup
- `vercel-cli` - Deployment workflows
- `vercel-functions` - Serverless functions
- `ai-sdk` - AI integration patterns
- `auth` - Authentication setup

### 3. **Notion Skills** (Project Management)
- `create-task` - Task creation
- `create-page` - Documentation
- `database-query` - Data management
- `knowledge-capture` - Documentation workflows

### 4. **Supabase Skills** (Backend Services)
- `supabase` - Backend setup
- `supabase-postgres-best-practices` - Database patterns

## How UI Skills Integrate

The new UI skills complete the **frontend layer** of the development stack:

```
┌─────────────────────────────────────────────────────────┐
│                    Project Management                    │
│                   (Notion Skills)                        │
│  • Create tasks  • Document  • Track progress           │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│                  (Next.js / React)                       │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │         🆕 UI Layer (NEW UI SKILLS)             │   │
│  │  • ui-component-create                          │   │
│  │  • ui-component-test                            │   │
│  │  • ui-storybook-setup                           │   │
│  └─────────────────────────────────────────────────┘   │
│                            ↓                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │       Business Logic (Vercel AI SDK)            │   │
│  │  • ai-sdk  • chat-sdk  • workflow               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│              (Prisma + Supabase Skills)                  │
│  • Database migrations  • Queries  • Best practices      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              Deployment & Infrastructure                 │
│                   (Vercel Skills)                        │
│  • vercel-cli  • vercel-functions  • env-vars           │
└─────────────────────────────────────────────────────────┘
```

## Integration Patterns

### Pattern 1: Full-Stack Feature Development

When building a complete feature, skills trigger in sequence:

```
User Request: "Build a user profile management page"

┌──────────────────────────────────────────────┐
│ 1. Database (Prisma Skills)                  │
│    • prisma-cli-migrate-dev                  │
│    Create User model and profile fields      │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ 2. Backend (Vercel Skills)                   │
│    • vercel-functions                        │
│    Create API endpoints for profile updates  │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ 3. UI Components (🆕 UI Skills)              │
│    • ui-component-create                     │
│    Create ProfileCard component              │
│    • ui-component-test                       │
│    Add interaction tests                     │
│    • ui-accessibility-test                   │
│    Ensure WCAG compliance                    │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ 4. Integration & Testing                     │
│    • ui-visual-regression                    │
│    Capture visual baselines                  │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ 5. Deployment (Vercel Skills)                │
│    • vercel-cli                              │
│    Deploy to production                      │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ 6. Documentation (Notion Skills)             │
│    • create-page                             │
│    Document new feature                      │
└──────────────────────────────────────────────┘
```

### Pattern 2: AI-Powered UI Components

When building AI features, UI skills work with AI SDK skills:

```
User: "Add a chatbot to the support page"

┌──────────────────────────────────────────────┐
│ Vercel AI SDK Skills                         │
│  • ai-sdk: Set up AI configuration           │
│  • chat-sdk: Configure chat streaming        │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ 🆕 UI Skills (with AI Elements)              │
│  • ui-component-create                       │
│    Use Vercel AI Elements:                   │
│    - Conversation component                  │
│    - Message component                       │
│    - PromptInput component                   │
│                                              │
│  • ui-component-test                         │
│    Test streaming behaviour                  │
│    Test message rendering                    │
│                                              │
│  • ui-accessibility-test                     │
│    Ensure chat is keyboard accessible        │
│    Test screen reader announcements          │
└──────────────────────────────────────────────┘
```

### Pattern 3: Design System + Database Integration

When building data-driven UI:

```
User: "Create a dashboard with user analytics"

┌──────────────────────────────────────────────┐
│ Prisma Skills                                │
│  Query user analytics data                   │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ 🆕 UI Skills                                 │
│  • ui-component-library                      │
│    Set up design system structure            │
│                                              │
│  • ui-component-create                       │
│    Create reusable dashboard components:     │
│    - StatsCard (shadcn/ui Card + data)       │
│    - ChartWidget (with data binding)         │
│    - DataTable (with Prisma queries)         │
│                                              │
│  • ui-storybook-setup                        │
│    Mock Prisma data in Storybook stories     │
│    Develop components independently          │
└──────────────────────────────────────────────┘
```

## Skill Activation Logic

### Automatic Activation (Build Flow)

The agent automatically activates UI skills when:

1. **Component Doesn't Exist**
   ```
   Agent detects: Need UserCard component
   Component status: Not found in codebase
   Action: Trigger ui-component-create
   ```

2. **Tests Missing**
   ```
   Agent detects: Component exists but no tests
   Action: Trigger ui-component-test
   ```

3. **Accessibility Issues**
   ```
   Agent detects: Component fails axe-core scan
   Action: Trigger ui-accessibility-test
   ```

4. **Visual Regression Setup Needed**
   ```
   Agent detects: No Storybook or Chromatic setup
   Action: Trigger ui-storybook-setup + ui-visual-regression
   ```

### Manual Activation (Isolation Mode)

Developers can explicitly invoke skills:

```bash
# Agent reads the skill when you ask:
"Use ui-component-create to build a new Button component"
"Run ui-accessibility-test on the LoginForm"
"Set up Storybook using ui-storybook-setup"
```

## Decision Tree: When UI Skills Activate

```
Agent receives task → Does it involve UI?
                              │
                    ┌─────────┴─────────┐
                   No                  Yes
                    │                   │
              Use other skills    Check component exists?
              (Prisma, Vercel)           │
                                  ┌──────┴──────┐
                                 Yes            No
                                  │              │
                         ┌────────┴────────┐    Trigger:
                    Needs tests?    OK     │    • ui-component-create
                         │                 │
                    ┌────┴────┐            │
                   Yes       No            │
                    │         │            │
              Trigger:        │            │
              • ui-component-test          │
              • ui-accessibility-test      │
              • ui-visual-regression       │
                                          │
                                    Use component
                                    in application
```

## Cross-Skill Workflows

### Workflow 1: "Build a Feature" (Uses Multiple Skill Categories)

```
Task: "Add user authentication with social login"

Step 1: Auth Setup (Vercel Skills)
  └─ Use: auth skill
     Configure NextAuth.js

Step 2: Database (Prisma Skills)
  └─ Use: prisma-cli-migrate-dev
     Create User and Session models

Step 3: UI Components (🆕 UI Skills)
  └─ Use: ui-component-create
     Create:
     - LoginButton (shadcn/ui Button)
     - AuthModal (shadcn/ui Dialog)
     - SocialLoginButtons
  
  └─ Use: ui-component-test
     Test login flow interactions
  
  └─ Use: ui-accessibility-test
     Ensure keyboard navigation
     Test screen reader support

Step 4: Documentation (Notion Skills)
  └─ Use: create-page
     Document auth flow

Step 5: Deployment (Vercel Skills)
  └─ Use: vercel-cli
     Deploy with environment variables
```

### Workflow 2: "Refactor Existing UI" (UI Skills in Isolation)

```
Task: "Improve existing dashboard components"

Step 1: Set up isolation environment
  └─ Use: ui-storybook-setup
     Configure Storybook if not exists

Step 2: Component development
  └─ Use: ui-component-create
     Refactor each component to:
     - Use shadcn/ui primitives
     - Follow composition patterns
     - Create Storybook stories

Step 3: Testing
  └─ Use: ui-component-test
     Add interaction tests
  
  └─ Use: ui-accessibility-test
     Fix accessibility issues
  
  └─ Use: ui-visual-regression
     Capture new baselines

Step 4: Architecture
  └─ Use: ui-component-library
     Establish governance patterns
     Set up quality gates
```

## Skill Dependencies

The UI skills have specific dependencies on other skills:

```
ui-storybook-setup
  Prerequisites:
  - Next.js/React project (may use next-forge skill)
  - Package manager configured

ui-component-create
  Prerequisites:
  - ui-storybook-setup (recommended)
  May reference:
  - ai-sdk skills (for AI components)
  - shadcn skill (for component installation)

ui-component-test
  Prerequisites:
  - ui-storybook-setup (required)
  - Component with stories exists

ui-visual-regression
  Prerequisites:
  - ui-storybook-setup (required)
  - Vercel account (for Chromatic)

ui-accessibility-test
  Prerequisites:
  - ui-storybook-setup (recommended)
  Works standalone for testing existing components

ui-component-library
  Prerequisites:
  - All other UI skills
  Used when establishing design system governance
```

## Benefits of Integration

### 1. Consistent Development Flow

Without UI skills:
```
Agent builds feature → Creates components ad-hoc → No tests → No isolation → Hard to maintain
```

With UI skills:
```
Agent builds feature → Checks component library → Creates with patterns → Adds tests → Maintains quality
```

### 2. Reusability Across Skills

UI skills generate reusable components that other skills reference:

```
Prisma skill creates data model
     ↓
Vercel skill creates API
     ↓
UI skill creates component (once)
     ↓
Component reused across:
  - Dashboard (uses ui-component-library patterns)
  - Admin panel (uses same components)
  - Mobile view (responsive by default)
  - Different features (tested and accessible)
```

### 3. Quality Gates

UI skills enforce quality that protects the entire application:

```
Pull Request created
     ↓
CI runs:
  ✓ Prisma migration tests (Prisma skills)
  ✓ API endpoint tests (Vercel skills)
  ✓ Component interaction tests (🆕 ui-component-test)
  ✓ Visual regression tests (🆕 ui-visual-regression)
  ✓ Accessibility tests (🆕 ui-accessibility-test)
     ↓
All pass → Safe to merge
```

## Usage Examples

### Example 1: Agent Building a Feature

```
User: "Add a blog post creation page"

Agent analysis:
- Need: Database model (Prisma)
- Need: API endpoints (Vercel)
- Need: UI components (UI Skills)

Agent workflow:
1. Read prisma-cli-migrate-dev skill
2. Create Post model
3. Generate Prisma Client
4. Read vercel-functions skill
5. Create POST /api/posts endpoint
6. Read ui-component-create skill
7. Check if RichTextEditor component exists → No
8. Create RichTextEditor component with:
   - shadcn/ui primitives
   - Storybook stories
   - Interaction tests
   - Accessibility support
9. Integrate everything into /blog/new page
```

### Example 2: Manual Component Development

```
Developer: "I need to create a complex data table component"

Workflow:
1. Run: ui-storybook-setup (if not exists)
2. Read: ui-component-create skill
3. Follow patterns to:
   - Use shadcn/ui Table
   - Add sorting/filtering
   - Create comprehensive stories
4. Read: ui-component-test skill
5. Add tests for:
   - Sorting behaviour
   - Filtering logic
   - Pagination
6. Read: ui-accessibility-test skill
7. Ensure:
   - Keyboard navigation
   - Screen reader support
   - WCAG compliance
```

## Key Takeaways

1. **Complementary, Not Replacement**: UI skills don't replace existing skills; they fill the UI layer gap

2. **Automatic Integration**: Agent automatically uses UI skills when building features that need UI

3. **Isolation Capability**: Can be used independently for focused component development

4. **Quality Enforcement**: Adds testing and accessibility gates to the development workflow

5. **Ecosystem Awareness**: UI skills reference other skills (ai-sdk for AI components, shadcn for primitives)

6. **Progressive Enhancement**: Use as much or as little as needed—from just Storybook setup to full design system governance

## Getting Started

If you're adding these to your project:

```bash
# Add to project
npx @levi-putna/agent-kit@latest add levi-putna/agent-kit --project

# Agent will now:
# - Check for UI needs during feature development
# - Automatically use UI skills when creating components
# - Maintain component quality through testing
# - Ensure accessibility and visual consistency
```

The skills integrate seamlessly into your existing workflow while adding robust UI development capabilities.
