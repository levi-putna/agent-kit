---
name: ui-visual-regression
description: Set up and run visual regression tests for UI components using Chromatic or Percy. Use when adding visual testing, catching unintended UI changes, or ensuring design consistency across browsers.
---

# Visual Regression Testing

This skill guides you through implementing visual regression testing for UI components. Visual tests catch unintended changes in appearance, layout, and styling that traditional tests miss.

## When to Use This Skill

- Setting up visual regression testing for the first time
- Catching unintended visual changes in PRs
- Testing cross-browser rendering differences
- Validating responsive design breakpoints
- Ensuring design system consistency

## Why Visual Testing Matters

Traditional tests verify behaviour but miss visual bugs:

- ✅ Functional test: Button is clickable
- ❌ Visual bug: Button text overflows container
- ❌ Visual bug: Wrong colour in dark mode
- ❌ Visual bug: Layout breaks on mobile

Visual regression testing captures these issues automatically.

## Option 1: Chromatic (Recommended)

Chromatic is built by the Storybook team and integrates seamlessly.

### Setup Chromatic

1. **Create Chromatic Account**

Visit [chromatic.com](https://www.chromatic.com) and sign in with GitHub.

2. **Install Chromatic**

```bash
yarn add -D chromatic
```

3. **Configure Project Token**

Add to `.env` (never commit this):

```bash
CHROMATIC_PROJECT_TOKEN=your_token_here
```

4. **Add Package Script**

```json
{
  "scripts": {
    "chromatic": "chromatic --exit-zero-on-changes"
  }
}
```

5. **Run Initial Build**

```bash
yarn chromatic
```

This builds Storybook and captures baselines for all stories.

### Configure Visual Tests

#### Storybook Configuration

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  // Chromatic-specific settings
  features: {
    buildStoriesJson: true,
  },
};

export default config;
```

#### Story-Level Configuration

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    // Chromatic configuration
    chromatic: {
      // Viewports to test (default is desktop)
      viewports: [320, 768, 1200],
      // Delay capture for animations
      delay: 300,
      // Disable animations for consistent snapshots
      disableSnapshot: false,
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

// Skip visual testing for this story
export const Interactive: Story = {
  args: {
    children: 'Click me',
  },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};
```

### Responsive Testing

Test multiple viewports:

```typescript
export const ResponsiveCard: Story = {
  parameters: {
    chromatic: {
      viewports: [320, 768, 1024, 1920],
    },
  },
  render: () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Responsive Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This card adapts to different screen sizes.</p>
      </CardContent>
    </Card>
  ),
};
```

### Handling Animations

Disable animations for consistent snapshots:

```css
/* .storybook/preview-head.html */
<style>
  .chromatic-ignore * {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
</style>
```

```typescript
export const AnimatedButton: Story = {
  parameters: {
    chromatic: {
      delay: 500, // Wait for animation to complete
    },
  },
};
```

### CI Integration

Add to GitHub Actions:

```yaml
# .github/workflows/chromatic.yml
name: Chromatic

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Required for Chromatic

      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run Chromatic
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          exitZeroOnChanges: true
          autoAcceptChanges: 'main'
```

### Reviewing Changes

1. **Automatic Checks**: Chromatic runs on every PR
2. **Review UI**: Visit the Chromatic build link in PR checks
3. **Accept/Deny**: Review visual diffs and accept intentional changes
4. **Baselines Updated**: Accepted changes become new baselines

## Option 2: Percy

Percy is another popular visual testing platform.

### Setup Percy

1. **Create Percy Account**

Visit [percy.io](https://percy.io) and connect your repository.

2. **Install Percy**

```bash
yarn add -D @percy/cli @percy/storybook
```

3. **Add Package Script**

```json
{
  "scripts": {
    "percy": "percy storybook ./storybook-static"
  }
}
```

4. **Build and Upload**

```bash
# Build Storybook
yarn build-storybook

# Upload to Percy
PERCY_TOKEN=your_token yarn percy
```

### Percy CI Integration

```yaml
# .github/workflows/percy.yml
name: Percy

on: [push, pull_request]

jobs:
  percy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Build Storybook
        run: yarn build-storybook

      - name: Run Percy
        run: yarn percy
        env:
          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
```

## Option 3: Playwright Visual Testing

For projects already using Playwright:

```bash
yarn add -D @playwright/test
```

### Playwright Visual Test

```typescript
// tests/button.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Button', () => {
  test('matches visual snapshot', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/ui-button--default');
    
    const button = page.locator('button');
    await expect(button).toHaveScreenshot('button-default.png');
  });

  test('hover state matches snapshot', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/ui-button--default');
    
    const button = page.locator('button');
    await button.hover();
    await expect(button).toHaveScreenshot('button-hover.png');
  });
});
```

### Update Snapshots

```bash
# Update all snapshots
yarn playwright test --update-snapshots

# Update specific test
yarn playwright test button.spec.ts --update-snapshots
```

## Testing Strategies

### 1. Test All Variants

```typescript
// Button.stories.tsx
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div className="flex gap-2">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>
      <div className="flex gap-2">
        <Button disabled>Disabled</Button>
      </div>
    </div>
  ),
  parameters: {
    chromatic: { viewports: [1200] },
  },
};
```

### 2. Test Dark Mode

```typescript
export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div className="dark">
        <div className="bg-background p-8">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
```

### 3. Test RTL (Right-to-Left)

```typescript
export const RTL: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
  parameters: {
    chromatic: { viewports: [1200] },
  },
};
```

### 4. Test Loading States

```typescript
export const LoadingStates: Story = {
  render: () => (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
};
```

### 5. Test Error States

```typescript
export const ErrorState: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
};
```

## Ignoring Dynamic Content

### Ignore Specific Elements

```typescript
export const WithTimestamp: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Article</CardTitle>
        <CardDescription data-chromatic="ignore">
          Posted {new Date().toLocaleString()}
        </CardDescription>
      </CardHeader>
    </Card>
  ),
};
```

### Mock Dynamic Data

```typescript
export const WithMockedDate: Story = {
  decorators: [
    (Story) => {
      // Mock date for consistent snapshots
      const OriginalDate = Date;
      global.Date = class extends OriginalDate {
        constructor() {
          super();
          return new OriginalDate('2026-01-01T00:00:00Z');
        }
      } as any;
      
      return <Story />;
    },
  ],
};
```

## Performance Optimization

### 1. Batch Similar Tests

```typescript
// Test all button variants in one snapshot
export const AllButtonVariants: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      {/* All variants here */}
    </div>
  ),
};
```

### 2. Skip Unnecessary Stories

```typescript
export const DevelopmentOnly: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};
```

### 3. Use Turbosnap

Enable Turbosnap in Chromatic to only test changed components:

```json
{
  "scripts": {
    "chromatic": "chromatic --only-changed"
  }
}
```

## Best Practices Checklist

- [ ] Visual tests run on every PR
- [ ] All component variants have visual tests
- [ ] Responsive breakpoints are tested
- [ ] Dark mode is tested (if supported)
- [ ] Animations are disabled or delayed
- [ ] Dynamic content is mocked or ignored
- [ ] Baselines are reviewed before accepting
- [ ] CI is configured to block on visual changes
- [ ] Team reviews visual diffs during PR review

## Troubleshooting

### Flaky Visual Tests

1. **Problem**: Snapshots differ slightly between runs
   - **Solution**: Disable animations, mock dates/random data

2. **Problem**: Font rendering differences
   - **Solution**: Use web fonts, wait for font loading

3. **Problem**: Images not loaded
   - **Solution**: Add delay, wait for network idle

### CI Issues

1. **Problem**: Chromatic fails in CI
   - **Solution**: Ensure `fetch-depth: 0` in checkout action

2. **Problem**: Percy upload fails
   - **Solution**: Check `PERCY_TOKEN` is set correctly

## Cost Considerations

- **Chromatic**: Free tier includes 5,000 snapshots/month
- **Percy**: Free tier includes 5,000 snapshots/month
- **Playwright**: Free (self-hosted snapshots)

Choose based on team size and snapshot volume.

## Next Steps

After setting up visual regression testing:

1. Review and accept initial baselines
2. Train team on reviewing visual diffs
3. Set up Slack/email notifications for changes
4. Document visual testing workflow in team docs

## References

- [Chromatic Documentation](https://www.chromatic.com/docs)
- [Percy Documentation](https://docs.percy.io/)
- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Storybook Visual Testing](https://storybook.js.org/docs/writing-tests/visual-testing)
