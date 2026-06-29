---
name: ui-component-test
description: Add interaction tests to UI components using Storybook play functions and Vitest. Use when adding tests to components, implementing user interaction testing, or validating component behaviour.
---

# Component Interaction Testing

This skill guides you through writing comprehensive interaction tests for UI components using Storybook play functions, Testing Library, and Vitest. These tests verify that components respond correctly to user interactions.

## When to Use This Skill

- Adding tests to new or existing components
- Verifying user interaction behaviour (clicks, typing, form submissions)
- Testing component state changes
- Validating error handling and edge cases
- Implementing test-driven development (TDD) for components

## Prerequisites

- Storybook 8+ configured (use `ui-storybook-setup` skill)
- `@storybook/test` and `@storybook/addon-vitest` installed
- Component with Storybook stories created

## Testing Philosophy

**Test user behaviour, not implementation details.**

- ✅ Test what users see and do
- ✅ Query by role, label, and text (accessible queries)
- ✅ Simulate real user interactions
- ❌ Don't test internal state directly
- ❌ Don't use `data-testid` unless necessary
- ❌ Don't test implementation details

## Writing Interaction Tests

### Basic Play Function Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
import { Button } from './button';

export const WithClick: StoryObj<typeof Button> = {
  args: {
    children: 'Click me',
  },
  play: async ({ canvasElement, args }) => {
    // Get the canvas (component's root element)
    const canvas = within(canvasElement);
    
    // Find elements using accessible queries
    const button = canvas.getByRole('button', { name: /click me/i });
    
    // Simulate user interaction
    await userEvent.click(button);
    
    // Assert expected outcome
    await expect(button).toHaveFocus();
  },
};
```

### Testing Form Interactions

```typescript
// LoginForm.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect, waitFor } from '@storybook/test';
import { LoginForm } from './login-form';

const meta = {
  title: 'Forms/LoginForm',
  component: LoginForm,
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SuccessfulLogin: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Find form fields by label (accessible!)
    const emailInput = canvas.getByLabelText(/email/i);
    const passwordInput = canvas.getByLabelText(/password/i);
    const submitButton = canvas.getByRole('button', { name: /sign in/i });
    
    // Type into fields
    await userEvent.type(emailInput, 'user@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    // Submit form
    await userEvent.click(submitButton);
    
    // Wait for async operation
    await waitFor(() => {
      expect(canvas.getByText(/welcome back/i)).toBeInTheDocument();
    });
  },
};

export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const emailInput = canvas.getByLabelText(/email/i);
    const submitButton = canvas.getByRole('button', { name: /sign in/i });
    
    // Type invalid email
    await userEvent.type(emailInput, 'not-an-email');
    
    // Try to submit
    await userEvent.click(submitButton);
    
    // Assert error message appears
    await waitFor(() => {
      expect(canvas.getByText(/invalid email/i)).toBeInTheDocument();
    });
  },
};

export const EmptySubmission: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const submitButton = canvas.getByRole('button', { name: /sign in/i });
    
    // Submit without filling fields
    await userEvent.click(submitButton);
    
    // Assert validation errors
    expect(canvas.getByText(/email is required/i)).toBeInTheDocument();
    expect(canvas.getByText(/password is required/i)).toBeInTheDocument();
  },
};
```

### Testing Keyboard Navigation

```typescript
export const KeyboardNavigation: Story = {
  render: () => (
    <div>
      <Button>First</Button>
      <Button>Second</Button>
      <Button>Third</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    
    // Tab through buttons
    await userEvent.tab();
    expect(buttons[0]).toHaveFocus();
    
    await userEvent.tab();
    expect(buttons[1]).toHaveFocus();
    
    await userEvent.tab();
    expect(buttons[2]).toHaveFocus();
    
    // Test Enter key
    await userEvent.keyboard('{Enter}');
    // Assert expected behaviour
  },
};
```

### Testing Component State Changes

```typescript
// Counter.stories.tsx
export const IncrementDecrement: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const counter = canvas.getByTestId('counter-value');
    const incrementBtn = canvas.getByRole('button', { name: /increment/i });
    const decrementBtn = canvas.getByRole('button', { name: /decrement/i });
    
    // Initial state
    expect(counter).toHaveTextContent('0');
    
    // Increment
    await userEvent.click(incrementBtn);
    expect(counter).toHaveTextContent('1');
    
    await userEvent.click(incrementBtn);
    expect(counter).toHaveTextContent('2');
    
    // Decrement
    await userEvent.click(decrementBtn);
    expect(counter).toHaveTextContent('1');
  },
};
```

### Testing Async Behaviour

```typescript
// SearchInput.stories.tsx
export const SearchWithResults: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const searchInput = canvas.getByRole('searchbox');
    
    // Type search query
    await userEvent.type(searchInput, 'react');
    
    // Wait for debounced search
    await waitFor(
      () => {
        expect(canvas.getByText(/showing results for "react"/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
    
    // Verify results appeared
    const results = canvas.getAllByRole('listitem');
    expect(results.length).toBeGreaterThan(0);
  },
};
```

### Testing Error States

```typescript
export const ErrorHandling: Story = {
  parameters: {
    // Mock API failure
    msw: {
      handlers: [
        http.post('/api/login', () => {
          return HttpResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          );
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const emailInput = canvas.getByLabelText(/email/i);
    const passwordInput = canvas.getByLabelText(/password/i);
    const submitButton = canvas.getByRole('button', { name: /sign in/i });
    
    await userEvent.type(emailInput, 'user@example.com');
    await userEvent.type(passwordInput, 'wrong-password');
    await userEvent.click(submitButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(canvas.getByRole('alert')).toHaveTextContent(/invalid credentials/i);
    });
  },
};
```

## Query Priority

Use Testing Library queries in this order of preference:

1. **Accessible queries (prefer these)**:
   - `getByRole('button', { name: /submit/i })`
   - `getByLabelText(/email/i)`
   - `getByPlaceholderText(/search/i)`
   - `getByText(/welcome/i)`

2. **Semantic queries**:
   - `getByAltText(/profile picture/i)`
   - `getByTitle(/close dialog/i)`

3. **Test IDs (last resort)**:
   - `getByTestId('custom-element')`

```typescript
// ✅ Good: Accessible queries
const button = canvas.getByRole('button', { name: /submit/i });
const input = canvas.getByLabelText(/email address/i);

// ❌ Bad: Test IDs everywhere
const button = canvas.getByTestId('submit-button');
const input = canvas.getByTestId('email-input');
```

## Setup and Teardown

### beforeEach in Stories

```typescript
// .storybook/preview.ts
import { beforeEach } from '@storybook/test';

export default {
  decorators: [
    (Story) => {
      beforeEach(() => {
        // Reset state before each story
        localStorage.clear();
        sessionStorage.clear();
      });
      
      return <Story />;
    },
  ],
};
```

### Per-Story Setup

```typescript
export const WithMockedDate: Story = {
  beforeEach: () => {
    // Mock Date for consistent timestamps
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01'));
  },
  play: async ({ canvasElement }) => {
    // Test with mocked date
  },
  // Cleanup automatically handled
};
```

## Mocking with MSW

Mock network requests using Mock Service Worker:

```typescript
// .storybook/preview.ts
import { initialize, mswLoader } from 'msw-storybook-addon';

initialize();

export default {
  loaders: [mswLoader],
};
```

```typescript
// Component.stories.tsx
import { http, HttpResponse } from 'msw';

export const LoadingState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/users', async () => {
          await delay(2000);
          return HttpResponse.json({ users: [] });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Check loading state appears
    expect(canvas.getByText(/loading/i)).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(canvas.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  },
};
```

## Running Tests

### Development Mode

```bash
# Run tests in watch mode
yarn test-storybook:watch

# Run tests with UI
yarn test-storybook:ui

# Run specific story
yarn test-storybook -t "Button/WithClick"
```

### CI Mode

```bash
# Run all tests once
yarn test-storybook

# With coverage
yarn test-storybook:coverage
```

## Advanced Patterns

### Testing Race Conditions

```typescript
export const RaceConditionHandling: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    // Click multiple times rapidly
    await userEvent.click(button);
    await userEvent.click(button);
    await userEvent.click(button);
    
    // Verify only one request was made
    await waitFor(() => {
      const requests = canvas.getAllByTestId('request-log');
      expect(requests).toHaveLength(1);
    });
  },
};
```

### Testing IME Composition (International Input)

```typescript
export const IMEInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    
    // Simulate IME composition (e.g., Japanese input)
    await userEvent.click(input);
    await userEvent.keyboard('[ControlLeft>]a[/ControlLeft]'); // Ctrl+A
    
    // Type with composition
    await userEvent.type(input, 'こんにちは');
    
    expect(input).toHaveValue('こんにちは');
  },
};
```

### Context-Dependent Tests

```typescript
export const WithThemeContext: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider theme="dark">
        <Story />
      </ThemeProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const element = canvas.getByRole('button');
    
    // Assert dark theme styles
    expect(element).toHaveClass('dark:bg-gray-900');
  },
};
```

## Debugging Tests

### View Test Results in Storybook

1. Open Storybook (`yarn storybook`)
2. Navigate to the story
3. Open "Interactions" panel
4. See step-by-step test execution

### Use Step-by-Step Debugging

```typescript
export const DebuggableTest: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    
    await step('Fill in email', async () => {
      const emailInput = canvas.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'user@example.com');
    });
    
    await step('Fill in password', async () => {
      const passwordInput = canvas.getByLabelText(/password/i);
      await userEvent.type(passwordInput, 'password123');
    });
    
    await step('Submit form', async () => {
      const submitButton = canvas.getByRole('button', { name: /sign in/i });
      await userEvent.click(submitButton);
    });
    
    await step('Verify success message', async () => {
      await waitFor(() => {
        expect(canvas.getByText(/welcome back/i)).toBeInTheDocument();
      });
    });
  },
};
```

## Best Practices Checklist

- [ ] Use accessible queries (getByRole, getByLabelText)
- [ ] Test user behaviour, not implementation
- [ ] Use `await` for all user interactions
- [ ] Use `waitFor` for async assertions
- [ ] Mock network requests with MSW
- [ ] Clean up side effects (timers, storage)
- [ ] Use descriptive test names
- [ ] Test error states and edge cases
- [ ] Keep tests independent (no shared state)
- [ ] Use `step()` for complex test scenarios

## Common Pitfalls

### ❌ Not Awaiting User Events

```typescript
// Wrong
userEvent.click(button); // Missing await
expect(button).toHaveFocus();

// Correct
await userEvent.click(button);
expect(button).toHaveFocus();
```

### ❌ Not Using waitFor for Async

```typescript
// Wrong
await userEvent.click(submitButton);
expect(canvas.getByText(/success/i)).toBeInTheDocument(); // May fail

// Correct
await userEvent.click(submitButton);
await waitFor(() => {
  expect(canvas.getByText(/success/i)).toBeInTheDocument();
});
```

### ❌ Testing Implementation Details

```typescript
// Wrong - testing internal state
expect(component.state.isOpen).toBe(true);

// Correct - testing visible behaviour
expect(canvas.getByRole('dialog')).toBeVisible();
```

## Next Steps

After adding interaction tests:

1. Use `ui-visual-regression` skill for visual testing
2. Use `ui-accessibility-test` skill for a11y validation
3. Set up CI to run tests on every commit

## References

- [Storybook Interaction Testing](https://storybook.js.org/docs/writing-tests/interaction-testing)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [Vitest Browser Mode](https://vitest.dev/guide/browser)
