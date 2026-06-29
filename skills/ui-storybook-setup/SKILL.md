---
name: ui-storybook-setup
description: Set up Storybook for isolated component development and testing. Use when initialising a component library, adding Storybook to a project, or configuring component isolation tooling.
---

# Storybook Setup for Component Isolation

Storybook is the industry-standard tool for developing and testing UI components in isolation. This skill guides you through setting up Storybook 8+ with the modern testing stack for React components.

## When to Use This Skill

- Initialising a new component library or design system
- Adding component isolation tooling to an existing project
- Setting up component testing infrastructure
- Enabling component-driven development workflow

## Prerequisites

- Node.js 18+
- React project (Next.js, Vite, or Create React App)
- Package manager (yarn, npm, or pnpm)

## Installation Steps

### 1. Install Storybook

Run the Storybook CLI to auto-detect your framework and install:

```bash
npx storybook@latest init
```

This command:
- Detects your framework (React, Next.js, Vue, etc.)
- Installs required dependencies
- Creates `.storybook/` configuration directory
- Adds example stories
- Updates `package.json` scripts

### 2. Install Testing Addons

Install the essential addons for comprehensive component testing:

```bash
# Core testing addons
yarn add -D @storybook/addon-vitest @storybook/addon-a11y @storybook/test

# Additional useful addons
yarn add -D @storybook/addon-interactions @storybook/addon-coverage
```

### 3. Configure Storybook for Testing

Update `.storybook/main.js` or `.storybook/main.ts`:

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@storybook/addon-coverage',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

### 4. Configure Vitest Integration

Create or update `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { storybookTest } from '@storybook/experimental-addon-vitest/plugin';

export default defineConfig({
  plugins: [
    react(),
    storybookTest({
      storybookScript: 'yarn storybook --ci',
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['.storybook/vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.stories.{ts,tsx}', '**/*.test.{ts,tsx}'],
    },
  },
});
```

### 5. Add Vitest Setup File

Create `.storybook/vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { beforeAll } from 'vitest';

beforeAll(() => {
  // Global setup for all tests
  // Reset any global state, configure test environment
});
```

### 6. Update Package Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "test-storybook": "vitest --project=storybook",
    "test-storybook:ui": "vitest --project=storybook --ui",
    "test-storybook:watch": "vitest --project=storybook --watch",
    "test-storybook:coverage": "vitest --project=storybook --coverage"
  }
}
```

## Component Story Format (CSF3)

Create stories using the modern CSF3 format:

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic stories
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

// Story with interaction test
export const WithInteraction: Story = {
  args: {
    children: 'Click me',
  },
  play: async ({ canvasElement }) => {
    const { userEvent, within, expect } = await import('@storybook/test');
    const canvas = within(canvasElement);
    
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    await expect(button).toHaveFocus();
  },
};
```

## Directory Structure

Organise your Storybook files:

```
project/
├── .storybook/
│   ├── main.ts              # Storybook configuration
│   ├── preview.ts           # Global decorators and parameters
│   ├── vitest.setup.ts      # Test setup
│   └── manager.ts           # UI customization (optional)
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── button.stories.tsx
│   │   │   ├── card.tsx
│   │   │   └── card.stories.tsx
│   │   └── blocks/          # Composed components
│   │       ├── header.tsx
│   │       └── header.stories.tsx
│   └── lib/
└── vitest.config.ts
```

## Best Practices

### 1. Story Organisation
- Place stories next to components (`Button.tsx` → `Button.stories.tsx`)
- Use clear, descriptive story names
- Group related stories under logical titles
- Use the `autodocs` tag for automatic documentation

### 2. Story Coverage
- Create a story for each significant component state
- Cover all variants and size options
- Include edge cases (loading, error, empty states)
- Test interactive states (hover, focus, disabled)

### 3. Decorators and Parameters
Use decorators for consistent context:

```typescript
// .storybook/preview.ts
import type { Preview } from '@storybook/react';
import { ThemeProvider } from 'next-themes';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="light">
        <div className="p-8">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default preview;
```

### 4. Performance
- Use Vite for fast builds and HMR
- Enable build caching in CI
- Only include necessary addons
- Use `lazyCompilation` for large story sets

## Integration with shadcn/ui

If using shadcn/ui components:

1. **Import Styles**: Ensure global styles are imported in preview:

```typescript
// .storybook/preview.ts
import '../src/app/globals.css';
```

2. **Configure Tailwind**: Update Tailwind config to watch Storybook files:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{ts,tsx}',
    './.storybook/**/*.{ts,tsx}',
  ],
  // ... rest of config
};
```

3. **Theme Integration**: Use CSS variables for consistent theming:

```typescript
// .storybook/preview.ts
export const parameters = {
  backgrounds: {
    default: 'light',
    values: [
      { name: 'light', value: 'hsl(0 0% 100%)' },
      { name: 'dark', value: 'hsl(222.2 84% 4.9%)' },
    ],
  },
};
```

## Running Storybook

```bash
# Development mode with hot reload
yarn storybook

# Build static site for deployment
yarn build-storybook

# Run tests in watch mode
yarn test-storybook:watch

# Generate coverage report
yarn test-storybook:coverage
```

## CI Integration

Add Storybook testing to your CI pipeline:

```yaml
# .github/workflows/storybook-tests.yml
name: Storybook Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      
      - name: Run Storybook tests
        run: yarn test-storybook
      
      - name: Generate coverage
        run: yarn test-storybook:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
```

## Troubleshooting

### Common Issues

1. **Import errors**: Ensure path aliases in `tsconfig.json` are mirrored in Storybook config
2. **CSS not loading**: Import global styles in `.storybook/preview.ts`
3. **Vitest integration failing**: Check `storybookScript` points to correct command
4. **Slow builds**: Enable Vite caching and use `lazyCompilation`

## Next Steps

After setting up Storybook:

1. Use the `ui-component-create` skill to create new components
2. Use the `ui-component-test` skill to add interaction tests
3. Use the `ui-visual-regression` skill to add visual testing
4. Use the `ui-accessibility-test` skill to add accessibility testing

## References

- [Storybook Documentation](https://storybook.js.org/docs)
- [Storybook Testing](https://storybook.js.org/docs/writing-tests)
- [Component Story Format (CSF)](https://storybook.js.org/docs/api/csf)
- [Vitest Integration](https://storybook.js.org/docs/writing-tests/vitest-plugin)
