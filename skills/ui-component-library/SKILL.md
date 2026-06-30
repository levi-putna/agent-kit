---
name: ui-component-library
description: Architect and maintain a scalable component library with proper governance, versioning, and documentation. Use when building a design system, establishing component standards, or scaling UI development across teams.
---

# Component Library Architecture

This skill provides a comprehensive guide for architecting, building, and maintaining a production-grade component library or design system that scales across teams and applications.

## When to Use This Skill

- Starting a new design system or component library
- Scaling UI development across multiple teams
- Establishing component governance and standards
- Refactoring an existing component library
- Setting up monorepo architecture for components

## Architecture Overview

A production component library is a layered system:

```
┌─────────────────────────────────────┐
│     Applications (consumers)         │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  Composed Components (blocks/)       │
│  - UserCard, SearchBar, Header       │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  UI Primitives (ui/)                 │
│  - Button, Card, Dialog (shadcn/ui)  │
└─────────────────────────────────────┐
                 ↓
┌─────────────────────────────────────┐
│  Headless Primitives                 │
│  - Radix UI, Headless UI             │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  Design Tokens                       │
│  - Colors, Spacing, Typography       │
└─────────────────────────────────────┘
```

## Directory Structure

### Monorepo Structure (Recommended)

```
my-design-system/
├── apps/
│   ├── web/                    # Main application
│   └── docs/                   # Documentation site (Storybook)
├── packages/
│   ├── ui/                     # Component library
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/         # Primitives (shadcn/ui)
│   │   │   │   │   ├── button/
│   │   │   │   │   │   ├── button.tsx
│   │   │   │   │   │   ├── button.stories.tsx
│   │   │   │   │   │   ├── button.test.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── card/
│   │   │   │   │   └── dialog/
│   │   │   │   ├── blocks/     # Composed components
│   │   │   │   │   ├── user-card/
│   │   │   │   │   └── search-bar/
│   │   │   │   └── index.ts
│   │   │   ├── lib/
│   │   │   │   ├── utils.ts
│   │   │   │   └── cn.ts
│   │   │   └── styles/
│   │   │       └── globals.css
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   ├── tokens/                 # Design tokens
│   │   ├── src/
│   │   │   ├── colors.ts
│   │   │   ├── spacing.ts
│   │   │   ├── typography.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── utils/                  # Shared utilities
│       ├── src/
│       └── package.json
├── .storybook/                 # Storybook config
├── turbo.json                  # Turborepo config
├── package.json                # Root package.json
└── README.md
```

### Single-Repo Structure (Simpler)

```
my-app/
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── button.stories.tsx
│   │   │   └── card.tsx
│   │   ├── blocks/             # Composed components
│   │   │   ├── user-card.tsx
│   │   │   └── search-bar.tsx
│   │   └── features/           # Feature-specific
│   │       └── auth/
│   │           └── login-form.tsx
│   ├── lib/
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
├── .storybook/
└── package.json
```

## Design Token System

Implement a three-tier token system:

### 1. Global Tokens (Base Values)

```typescript
// packages/tokens/src/colors.ts
export const colors = {
  // Raw colour values
  gray: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  blue: {
    // ...
  },
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  6: '1.5rem',
  8: '2rem',
  12: '3rem',
  16: '4rem',
} as const;

export const typography = {
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;
```

### 2. Semantic Tokens (Contextual Meanings)

```css
/* globals.css */
@layer base {
  :root {
    /* Semantic tokens reference global tokens */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... */
  }
}
```

### 3. Component Tokens (Component-Specific)

```typescript
// Component-specific overrides
const buttonVariants = cva('base-styles', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
    },
  },
});
```

## Component API Design

### Start Minimal

```typescript
// ✅ Start with minimal API
interface ButtonProps {
  variant?: 'default' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  children: React.ReactNode;
}

// ❌ Don't over-engineer upfront
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  // ... 20 more props
}
```

### Composition Over Configuration

```typescript
// ✅ Compose primitives
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ Configuration hell
<Card
  title="Title"
  content="Content"
  showHeader={true}
  headerAlign="left"
/>
```

## Governance Model

### RFC Process for Major Changes

```markdown
# RFC: Add Loading State to Button

## Summary
Add optional loading state to Button component with spinner and disabled interaction.

## Motivation
User research shows confusion when buttons don't provide feedback during async operations.

## Detailed Design
```typescript
interface ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
}
```

## Alternatives Considered
1. Create separate LoadingButton component (rejected: duplication)
2. Use children prop (rejected: inconsistent pattern)

## Migration Path
Fully backward compatible. No breaking changes.

## Open Questions
- Should loading state disable the button?
- What icon/spinner to use?
```

### Contribution Workflow

1. **Propose**: Submit RFC for new components or breaking changes
2. **Review**: Design system team reviews and approves
3. **Implement**: Follow contribution guidelines
4. **Test**: Automated tests + manual review
5. **Document**: Update Storybook docs
6. **Release**: Semantic versioning with changelog

## Quality Gates

### Automated Checks (CI)

```yaml
# .github/workflows/quality.yml
name: Component Quality

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      
      - name: Type check
        run: yarn tsc --noEmit
      
      - name: Lint
        run: yarn lint
      
      - name: Unit tests
        run: yarn test
      
      - name: Component tests
        run: yarn test-storybook
      
      - name: A11y tests
        run: yarn test-storybook --a11y
      
      - name: Visual regression
        run: yarn chromatic
        env:
          CHROMATIC_PROJECT_TOKEN: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
      
      - name: Build
        run: yarn build
```

### Component Checklist

Before merging a new component:

- [ ] **TypeScript**: Proper type definitions
- [ ] **Tests**: Unit tests + interaction tests
- [ ] **A11y**: Passes axe-core, keyboard accessible
- [ ] **Visual**: Visual regression tests added
- [ ] **Docs**: Storybook stories with all variants
- [ ] **Examples**: Usage examples in stories
- [ ] **Performance**: No unnecessary re-renders
- [ ] **Responsive**: Works on mobile/tablet/desktop
- [ ] **Dark mode**: Works in light and dark themes
- [ ] **Tokens**: Uses design tokens (not hardcoded values)

## Versioning and Releases

### Semantic Versioning

```bash
# Patch: Bug fixes (1.0.0 → 1.0.1)
yarn changeset add --type patch

# Minor: New features (1.0.0 → 1.1.0)
yarn changeset add --type minor

# Major: Breaking changes (1.0.0 → 2.0.0)
yarn changeset add --type major
```

### Changesets Workflow

```bash
# 1. Make changes to components
# 2. Add changeset
yarn changeset add

# 3. Select packages and change type
# 4. Write changelog entry
# 5. Commit changeset file

# In CI: Create release PR
yarn changeset version

# Publish when merged
yarn changeset publish
```

### Migration Guides

For breaking changes, provide migration guides:

```markdown
# Migration Guide: v1 → v2

## Breaking Changes

### Button: Removed `type` prop

**Before:**
```typescript
<Button type="primary">Submit</Button>
```

**After:**
```typescript
<Button variant="default">Submit</Button>
```

### Card: Restructured compound components

**Before:**
```typescript
<Card title="Title" content="Content" />
```

**After:**
```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

## Automated Migration

Run codemod to automatically update:

```bash
npx @my-design-system/codemod v1-to-v2
```
```

## Documentation

### Storybook as Living Docs

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'A versatile button component for triggering actions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      description: 'The visual style variant',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
```

### MDX Documentation Pages

```mdx
{/* Button.mdx */}
import { Meta, Canvas, Controls, Story } from '@storybook/blocks';
import * as ButtonStories from './Button.stories';

<Meta of={ButtonStories} />

# Button

Buttons are used to trigger actions and events.

## Usage

<Canvas of={ButtonStories.Default} />

## Variants

<Canvas>
  <Story of={ButtonStories.Default} />
  <Story of={ButtonStories.Destructive} />
  <Story of={ButtonStories.Outline} />
</Canvas>

## Best Practices

- Use primary buttons for main actions
- Limit one primary button per section
- Use destructive variant for dangerous actions
- Ensure sufficient click target size (44x44px minimum)

## Accessibility

- Buttons are keyboard accessible (Enter/Space)
- Focus indicators are visible
- Loading states are announced to screen readers
```

## Performance Optimization

### Tree-Shaking

Export components individually:

```typescript
// packages/ui/src/index.ts
export { Button } from './components/ui/button';
export { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
// ... individual exports

// Consumers can tree-shake
import { Button } from '@my-design-system/ui';
```

### Bundle Analysis

```bash
# Analyze bundle size
yarn build
yarn analyze

# Check individual component sizes
npx size-limit
```

### Lazy Loading

```typescript
// Lazy load heavy components
const RichTextEditor = lazy(() => import('@my-design-system/ui/rich-text-editor'));

// Use with Suspense
<Suspense fallback={<Skeleton />}>
  <RichTextEditor />
</Suspense>
```

## Monitoring and Analytics

### Component Usage Tracking

```typescript
// Track component usage (opt-in)
export function Button({ variant, ...props }: ButtonProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      analytics.track('component.button.render', { variant });
    }
  }, [variant]);
  
  return <button {...props} />;
}
```

### Version Adoption Dashboard

Track which apps use which component versions:

```typescript
// packages/ui/src/lib/telemetry.ts
export const LIBRARY_VERSION = '2.1.0';

// Report to analytics
analytics.track('design-system.version', {
  version: LIBRARY_VERSION,
  app: process.env.APP_NAME,
});
```

## Best Practices Summary

1. **Composition**: Favour composition over configuration
2. **Tokens**: Use design tokens, never hardcode values
3. **Accessibility**: Automated + manual testing required
4. **Testing**: Unit + interaction + visual + a11y
5. **Documentation**: Storybook is the source of truth
6. **Versioning**: Semantic versioning with changesets
7. **Governance**: RFC process for breaking changes
8. **Quality Gates**: CI blocks merges on failures
9. **Performance**: Tree-shakeable, bundle size monitoring
10. **Migration**: Clear guides for breaking changes

## Workflow Integration

This skill ties together all UI skills:

```
┌──────────────────────────────────────────────┐
│  1. ui-storybook-setup                       │
│     Set up component isolation environment   │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│  2. ui-component-create                      │
│     Build components with proper patterns    │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│  3. ui-component-test                        │
│     Add interaction tests                    │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│  4. ui-visual-regression                     │
│     Add visual regression tests              │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│  5. ui-accessibility-test                    │
│     Validate accessibility                   │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│  6. ui-component-library (this skill)        │
│     Maintain governance and standards        │
└──────────────────────────────────────────────┘
```

## Resources

- [Design Systems Handbook](https://www.designbetter.co/design-systems-handbook)
- [Component Governance Best Practices](https://bradfrost.com/blog/post/design-system-governance/)
- [Atomic Design](https://atomicdesign.bradfrost.com/)
- [Storybook Component Encyclopedia](https://storybook.js.org/showcase)
