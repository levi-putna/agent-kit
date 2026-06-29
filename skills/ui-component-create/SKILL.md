---
name: ui-component-create
description: Create reusable UI components following shadcn/ui patterns and modern React best practices. Use when building new components, creating design system primitives, or implementing UI elements with proper composition patterns.
---

# Creating UI Components

This skill guides you through creating high-quality, reusable UI components following 2026 best practices, with a focus on shadcn/ui patterns, composition over configuration, and testability.

## When to Use This Skill

- Creating new UI components from scratch
- Building design system primitives
- Implementing reusable interface elements
- Converting designs into production-ready components
- Refactoring existing components for better composition

## Core Principles

### 1. Composition Over Configuration

Build complex UIs by composing simple primitives rather than adding complex props:

**❌ Bad: Configuration-heavy component**
```typescript
<Card 
  title="User Profile"
  subtitle="Manage your account"
  showAvatar={true}
  avatarUrl="/avatar.jpg"
  actions={[{ label: 'Edit', onClick: () => {} }]}
  footer="Last updated today"
/>
```

**✅ Good: Compositional approach**
```typescript
<Card>
  <CardHeader>
    <div className="flex items-center gap-4">
      <Avatar src="/avatar.jpg" />
      <div>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>Manage your account</CardDescription>
      </div>
    </div>
  </CardHeader>
  <CardContent>{/* ... */}</CardContent>
  <CardFooter>
    <Button>Edit</Button>
    <p className="text-sm text-muted-foreground">Last updated today</p>
  </CardFooter>
</Card>
```

### 2. Treat Components as Owned Source Code

With shadcn/ui, components are copied into your codebase. This means:

- You own and maintain the code
- Customisation doesn't break updates
- Build abstractions intentionally
- Version control is your friend

### 3. Layered Architecture

Organise components in three layers:

```
src/components/
├── ui/              # Primitives (shadcn/ui components)
│   ├── button.tsx
│   ├── card.tsx
│   └── input.tsx
├── blocks/          # Product-specific compositions
│   ├── user-card.tsx
│   └── search-bar.tsx
└── features/        # Domain-specific components
    └── auth/
        └── login-form.tsx
```

## Component Creation Workflow

### Step 1: Check for Existing Primitives

Before creating a component, check if shadcn/ui provides a suitable primitive:

```bash
# List available shadcn/ui components
npx shadcn@latest add

# Add a specific component
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

**Prefer shadcn/ui and Vercel AI Elements over custom components.**

### Step 2: Define Component API

Start with a minimal API and only add props when proven necessary:

```typescript
// Start simple
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

// Avoid over-engineering
// ❌ Don't add these unless actually needed:
// isLoading?: boolean;
// leftIcon?: React.ReactNode;
// rightIcon?: React.ReactNode;
// fullWidth?: boolean;
// rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
```

### Step 3: Implement with TypeScript and CVA

Use Class Variance Authority (CVA) for variant management:

```typescript
// components/ui/button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * Button component for triggering actions and events
 * 
 * @example
 * ```tsx
 * <Button variant="default">Click me</Button>
 * <Button variant="outline" size="sm">Small button</Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
```

### Step 4: Create Compound Components

For complex components, use compound component patterns:

```typescript
// components/ui/card.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Card component for grouping related content
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

### Step 5: Add Documentation Comments

Every component should have:

```typescript
/**
 * Brief description of what the component does
 * 
 * @example
 * ```tsx
 * <Button variant="default">Click me</Button>
 * ```
 * 
 * @param variant - Visual style variant
 * @param size - Size variant
 * @param asChild - Merge props to child element (polymorphic behaviour)
 */
```

### Step 6: Create Storybook Stories

Create a comprehensive story file covering all variants:

```typescript
// components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Size variant',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
};

// Size variants
export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
};

export const Icon: Story = {
  args: {
    children: '🔍',
    size: 'icon',
  },
};

// States
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

// Interactive example
export const WithIcon: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button>
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Item
      </Button>
    </div>
  ),
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex gap-2">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">🔍</Button>
      </div>
    </div>
  ),
};
```

## Design Token Integration

Use CSS variables for consistent theming:

```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    /* ... more tokens */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    /* ... more tokens */
  }
}
```

Reference tokens in components:

```typescript
className="bg-background text-foreground border-border"
```

## Product-Specific Abstractions

Create higher-level components for your product:

```typescript
// components/blocks/user-card.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface UserCardProps {
  name: string;
  email: string;
  avatarUrl?: string;
  onEdit?: () => void;
}

/**
 * Product-specific user card component
 * Composes primitives with business logic
 */
export function UserCard({ name, email, avatarUrl, onEdit }: UserCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar src={avatarUrl} fallback={name[0]} />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardFooter>
        <Button onClick={onEdit}>Edit Profile</Button>
      </CardFooter>
    </Card>
  );
}
```

## Vercel AI Elements Integration

For AI-specific components, prefer Vercel AI Elements:

```bash
# Install AI Elements
npx @ai-elements/cli@latest add
```

Use AI Elements for AI-specific UI:

```typescript
import { Conversation, Message, MessageResponse, PromptInput } from '@/components/ai-elements';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  
  return (
    <div>
      <Conversation>
        {messages.map((message) => (
          <Message key={message.id} from={message.role}>
            <MessageResponse>{message.content}</MessageResponse>
          </Message>
        ))}
      </Conversation>
      
      <PromptInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
```

## Best Practices Checklist

Before considering a component complete:

- [ ] Component uses TypeScript with proper type definitions
- [ ] Uses CVA for variant management (if applicable)
- [ ] Forwards refs for proper DOM access
- [ ] Includes comprehensive JSDoc documentation
- [ ] Has displayName set for better debugging
- [ ] Exports types alongside component
- [ ] Uses design tokens (CSS variables) for styling
- [ ] Maintains accessibility (ARIA attributes, keyboard navigation)
- [ ] Has Storybook stories covering all variants
- [ ] Follows composition over configuration principle
- [ ] Placed in appropriate layer (ui/, blocks/, or features/)

## Common Patterns

### Loading States

```typescript
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>
```

### Error States

```typescript
<Card className={cn(error && 'border-destructive')}>
  {error && (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )}
</Card>
```

### Responsive Design

```typescript
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {items.map((item) => (
    <Card key={item.id}>{/* ... */}</Card>
  ))}
</div>
```

## Next Steps

After creating components:

1. Use `ui-component-test` skill to add interaction tests
2. Use `ui-visual-regression` skill for visual testing
3. Use `ui-accessibility-test` skill to verify accessibility
4. Document usage in Storybook with MDX pages

## References

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [CVA (Class Variance Authority)](https://cva.style/docs)
- [Compound Component Pattern](https://kentcdodds.com/blog/compound-components-with-react-hooks)
