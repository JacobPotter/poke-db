---
name: playwright-browser-testing
description: Use when running frontend browser tests with Vitest, debugging DOM elements with Playwright MCP, or validating Storybook UI components. Covers browser setup, MSW test harnesses, and accessibility inspection.
---
# Playwright Browser Testing & UI Verification Protocol

## Context
- **Testing Engine**: Vitest 2.1 configured with Playwright Chromium browser mode (`frontend/vite.config.ts`)
- **API Mocking**: Mock Service Worker (MSW) in `frontend/src/setupTests.ts` and `frontend/src/test/mocks/`
- **Component Explorer**: Storybook 8 (`frontend/npm run storybook` on `:6006`)
- **Live Verification**: Playwright MCP server (`playwright` toolset) for interactive browser validation against Vite dev server (`:5173`) or Storybook (`:6006`)

---

## Execution Steps

### 1. Prerequisites & Browser Installation
Vitest runs tests against real Chromium instances managed by Playwright (not a synthetic jsdom environment).

```bash
cd frontend
# Ensure Playwright browser binaries are installed
npx playwright install chromium
```

### 2. Running Frontend Vitest Browser Tests

```bash
cd frontend

# Run all tests in headless CI mode
npx vitest run

# Run tests in watch mode
npm test

# Run a specific test file
npx vitest run src/components/ui/tests/DarkModeButton.test.tsx

# Run tests matching a filter pattern
npx vitest run -t "PokemonCard"

# Run tests with code coverage report
npx vitest run --coverage
```

### 3. Writing Vitest Browser Mode Component Tests
Co-locate test files in `tests/` subdirectories adjacent to the target component (e.g., `src/components/<domain>/tests/<Component>.test.tsx`).

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PokemonCard } from '../PokemonCard';
import { mockPokemon } from '../../../test/fixtures/pokemon';

describe('PokemonCard', () => {
  it('renders pokemon name and sprite correctly in browser DOM', () => {
    render(<PokemonCard pokemon={mockPokemon} />);
    const nameHeading = screen.getByRole('heading', { name: /pikachu/i });
    expect(nameHeading).toBeInTheDocument();
  });
});
```

### 4. Interactive UI Verification with Playwright MCP
When developing new UI components or diagnosing rendering defects:

1. **Start the local server**:
   - For app SPA: `cd frontend && npm run dev` (running at `http://localhost:5173`)
   - For Storybook components: `cd frontend && npm run storybook` (running at `http://localhost:6006`)
2. **Inspect via Playwright MCP**:
   - Navigate to the page/story URL using Playwright MCP tools.
   - Take accessibility tree snapshots to verify ARIA roles, text contrast, and DOM hierarchy.
   - Trigger clicks, keyboard navigation, and form inputs to observe interactive state changes.

### 5. Mock Service Worker (MSW) Integration
- `src/setupTests.ts` automatically initializes MSW worker lifecycle hooks (`beforeAll`, `afterEach`, `afterAll`).
- Custom API response mocks belong in `src/test/mocks/handlers.ts`.
- Reusable mock JSON payloads belong in `src/test/fixtures/`.

---

## Key Constraints
- **Vitest requires Playwright Chromium**: Do not assume jsdom semantics; window, localStorage, and real CSS layout are active.
- **Always mock network calls via MSW in unit/component tests**: Never hit live backend endpoints during automated test runs.
- **Keep test files co-located**: Place in `src/components/<domain>/tests/`.
