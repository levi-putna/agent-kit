---
name: ui-accessibility-test
description: Test UI components for accessibility compliance using axe-core, Storybook a11y addon, and manual testing techniques. Use when ensuring WCAG compliance, testing keyboard navigation, or validating screen reader compatibility.
---

# UI Accessibility Testing

This skill guides you through comprehensive accessibility (a11y) testing for UI components. Accessible components work for everyone, including users with disabilities who rely on assistive technologies.

## When to Use This Skill

- Ensuring WCAG 2.1 AA compliance
- Testing keyboard navigation
- Validating screen reader compatibility
- Checking colour contrast ratios
- Testing focus management
- Auditing existing components for accessibility issues

## Why Accessibility Matters

- **Legal requirement**: Many jurisdictions require WCAG compliance
- **Broader audience**: 15% of the global population has some form of disability
- **Better UX**: Accessible design benefits everyone (keyboard users, mobile users, etc.)
- **SEO benefits**: Semantic HTML improves search rankings

## Automated Testing with axe-core

### Install Storybook A11y Addon

```bash
yarn add -D @storybook/addon-a11y
```

### Configure Storybook

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y', // Add this
  ],
};

export default config;
```

### View A11y Results

1. Start Storybook: `yarn storybook`
2. Navigate to any story
3. Open the "Accessibility" panel
4. View violations, passes, and incomplete checks

### Configure A11y Tests

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    a11y: {
      // Configure axe-core
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
      // Test options
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        },
      },
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
```

### Disable Specific Rules

For stories that intentionally violate rules (e.g., design mockups):

```typescript
export const DesignMockup: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: false, // Disable for this story
          },
        ],
      },
    },
  },
};
```

## Automated Testing in CI

### Run axe-core in Tests

```typescript
// Button.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from './button';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('all variants should be accessible', async () => {
    const variants = ['default', 'destructive', 'outline', 'ghost'] as const;
    
    for (const variant of variants) {
      const { container } = render(<Button variant={variant}>Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }
  });
});
```

### Storybook Test Runner with A11y

```typescript
// .storybook/test-runner.ts
import { injectAxe, checkA11y } from 'axe-playwright';
import type { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page) {
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  },
};

export default config;
```

## Manual Keyboard Testing

Automated tools catch ~30-50% of accessibility issues. Manual testing is essential.

### Keyboard Navigation Checklist

Test every interactive component with keyboard only:

- [ ] **Tab**: Moves focus to next interactive element
- [ ] **Shift+Tab**: Moves focus to previous element
- [ ] **Enter**: Activates buttons and links
- [ ] **Space**: Activates buttons, checks checkboxes
- [ ] **Arrow keys**: Navigate within components (menus, tabs, etc.)
- [ ] **Escape**: Closes dialogs, menus, popovers
- [ ] **Home/End**: Jump to first/last item in lists

### Focus Management Tests

```typescript
// Dialog.stories.tsx
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { userEvent } = await import('@storybook/test');
    
    const triggerButton = canvas.getByRole('button', { name: /open dialog/i });
    
    // Open dialog
    await userEvent.click(triggerButton);
    
    // Focus should trap inside dialog
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    
    // Verify focus stays in dialog
    const dialog = canvas.getByRole('dialog');
    const focusedElement = document.activeElement;
    expect(dialog.contains(focusedElement)).toBe(true);
    
    // Close with Escape
    await userEvent.keyboard('{Escape}');
    
    // Focus should return to trigger
    expect(triggerButton).toHaveFocus();
  },
};
```

### Skip Links

Ensure skip links work:

```typescript
// Layout.stories.tsx
export const SkipLink: Story = {
  render: () => (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <nav>{/* Navigation */}</nav>
      <main id="main-content">{/* Content */}</main>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skipLink = canvas.getByText(/skip to main content/i);
    
    // Tab should focus skip link first
    await userEvent.tab();
    expect(skipLink).toHaveFocus();
    
    // Enter should skip to main content
    await userEvent.keyboard('{Enter}');
    const mainContent = canvas.getByRole('main');
    expect(document.activeElement).toBeCloseTo(mainContent);
  },
};
```

## Screen Reader Testing

### ARIA Attributes

Ensure proper ARIA attributes:

```typescript
// Button with loading state
<Button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      <span className="sr-only">Loading...</span>
      Loading
    </>
  ) : (
    'Submit'
  )}
</Button>

// Dialog
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent
    role="dialog"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <DialogTitle id="dialog-title">Confirm Action</DialogTitle>
    <DialogDescription id="dialog-description">
      Are you sure you want to continue?
    </DialogDescription>
  </DialogContent>
</Dialog>

// Form with error
<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    aria-invalid={!!error}
    aria-describedby={error ? 'email-error' : undefined}
  />
  {error && (
    <p id="email-error" role="alert" className="text-destructive">
      {error}
    </p>
  )}
</div>
```

### Live Regions

For dynamic updates:

```typescript
// Toast notification
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="toast"
>
  {message}
</div>

// Error banner (urgent)
<div
  role="alert"
  aria-live="assertive"
  className="error-banner"
>
  {error}
</div>

// Loading status
<div role="status" aria-live="polite">
  {isLoading ? 'Loading...' : 'Content loaded'}
</div>
```

### Screen Reader Only Text

```css
/* globals.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```typescript
<button>
  <X className="h-4 w-4" aria-hidden="true" />
  <span className="sr-only">Close dialog</span>
</button>
```

## Colour Contrast Testing

### Check Contrast Ratios

WCAG 2.1 AA requires:

- **Normal text**: 4.5:1 minimum
- **Large text** (18pt+): 3:1 minimum
- **UI components**: 3:1 minimum

### Test in Storybook

The a11y addon automatically checks contrast. View results in the Accessibility panel.

### Manual Testing

Use browser DevTools:

1. Inspect element
2. View "Accessibility" tab
3. Check "Contrast" section

### Design Token Validation

```typescript
// scripts/validate-contrast.ts
import { readFile } from 'fs/promises';

const contrastRatio = (l1: number, l2: number) => {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

async function validateContrast() {
  // Read CSS variables
  const css = await readFile('src/app/globals.css', 'utf-8');
  
  // Extract foreground/background pairs
  const foreground = extractLuminance(css, '--foreground');
  const background = extractLuminance(css, '--background');
  
  const ratio = contrastRatio(foreground, background);
  
  if (ratio < 4.5) {
    console.error(`Insufficient contrast: ${ratio.toFixed(2)}:1`);
    process.exit(1);
  }
  
  console.log(`✓ Contrast ratio: ${ratio.toFixed(2)}:1`);
}

validateContrast();
```

## Focus Indicators

Ensure visible focus indicators:

```css
/* globals.css */
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* For custom focus styles */
.button:focus-visible {
  ring: 2px solid hsl(var(--ring));
  ring-offset: 2px solid hsl(var(--background));
}
```

### Test Focus Indicators

```typescript
export const FocusIndicator: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button>First</Button>
      <Button>Second</Button>
      <Button>Third</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    
    // Tab through and verify focus is visible
    await userEvent.tab();
    expect(buttons[0]).toHaveFocus();
    // Visual check: focus ring should be visible
    
    await userEvent.tab();
    expect(buttons[1]).toHaveFocus();
  },
};
```

## Common Accessibility Patterns

### Buttons vs Links

```typescript
// ✅ Use button for actions
<Button onClick={handleSubmit}>Submit Form</Button>

// ✅ Use link for navigation
<Link href="/about">About Us</Link>

// ❌ Don't use link for actions
<a href="#" onClick={handleAction}>Do Action</a>

// ❌ Don't use button for navigation
<Button onClick={() => router.push('/about')}>About</Button>
```

### Form Labels

```typescript
// ✅ Explicit label
<div>
  <Label htmlFor="name">Name</Label>
  <Input id="name" name="name" />
</div>

// ✅ Wrapped label
<Label>
  Name
  <Input name="name" />
</Label>

// ❌ Missing label
<Input placeholder="Enter name" /> // Placeholder is not a label!
```

### Icon Buttons

```typescript
// ✅ Accessible icon button
<Button size="icon" aria-label="Close dialog">
  <X className="h-4 w-4" aria-hidden="true" />
</Button>

// ❌ No label
<Button size="icon">
  <X className="h-4 w-4" />
</Button>
```

### Complex Widgets

```typescript
// Combobox with proper ARIA
<Popover>
  <PopoverTrigger
    role="combobox"
    aria-expanded={open}
    aria-controls="combobox-list"
    aria-haspopup="listbox"
  >
    {selected || 'Select...'}
  </PopoverTrigger>
  <PopoverContent>
    <Command>
      <CommandInput placeholder="Search..." />
      <CommandList id="combobox-list" role="listbox">
        <CommandItem role="option">Option 1</CommandItem>
        <CommandItem role="option">Option 2</CommandItem>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
```

## Testing with Real Screen Readers

Automated tools can't replace real screen reader testing.

### Screen Reader Basics

**macOS**:
- VoiceOver: Cmd+F5
- Navigate: VO (Ctrl+Option) + Arrow keys

**Windows**:
- NVDA: Free, download from nvaccess.org
- JAWS: Commercial, widely used

**Testing Checklist**:
- [ ] All interactive elements are announced
- [ ] Element roles are correct (button, link, dialog, etc.)
- [ ] Form labels are associated correctly
- [ ] Error messages are announced
- [ ] Loading states are announced
- [ ] Focus order is logical

## CI Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/a11y.yml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      
      - name: Run Storybook
        run: yarn build-storybook
      
      - name: Run axe tests
        run: yarn test-storybook
      
      - name: Validate contrast ratios
        run: node scripts/validate-contrast.js
```

## Best Practices Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Colour contrast meets WCAG AA (4.5:1)
- [ ] All images have alt text
- [ ] Forms have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Loading states are announced
- [ ] Modals trap focus correctly
- [ ] Skip links are provided
- [ ] Heading hierarchy is logical (h1 → h2 → h3)
- [ ] ARIA attributes are used correctly
- [ ] Automated axe tests pass
- [ ] Manual screen reader testing completed

## Common Issues and Fixes

### Issue: Missing Form Labels

```typescript
// ❌ Problem
<Input placeholder="Email" />

// ✅ Solution
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" name="email" />
</div>
```

### Issue: Poor Colour Contrast

```typescript
// ❌ Problem: Gray text on light background
<p className="text-gray-400 bg-white">Low contrast</p>

// ✅ Solution: Use design tokens with validated contrast
<p className="text-muted-foreground bg-background">Good contrast</p>
```

### Issue: Icon-Only Button

```typescript
// ❌ Problem
<Button><X /></Button>

// ✅ Solution
<Button aria-label="Close">
  <X aria-hidden="true" />
</Button>
```

### Issue: Missing Focus Trap in Modal

```typescript
// ✅ Solution: Use Dialog primitive with built-in focus trap
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>{/* Focus trapped here */}</DialogContent>
</Dialog>
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Components](https://inclusive-components.design/)

## Next Steps

1. Run axe tests on all components
2. Perform manual keyboard testing
3. Test with real screen readers
4. Document accessibility patterns for the team
5. Set up CI to block PRs with accessibility violations
