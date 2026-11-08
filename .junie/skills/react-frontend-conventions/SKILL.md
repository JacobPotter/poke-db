---
name: react-frontend-conventions
description: Use when adding or modifying frontend code in the PokeDB React SPA. Enforces TanStack Query patterns, React Context for UI state, MSW-based testing, Tailwind CSS, strict TypeScript, and the established component/file organization.
---
# React Frontend Conventions Protocol

## Context
- **Framework**: React 18 + TypeScript 5.5 + Vite 5
- **Styling**: Tailwind CSS 3.4
- **Server State**: `@tanstack/react-query` v5
- **HTTP Client**: `axios` / `axios-hooks`
- **Testing**: Vitest 2.1 (Playwright Chromium browser mode), `@testing-library/react`, MSW
- **Components**: Storybook 8
- **Routing**: React Router DOM

---

## Execution Steps

### 1. Data Flow — TanStack Query Architecture

Server state flows through a three-layer pattern:

| Layer | Location | Purpose |
|-------|----------|---------|
| Raw API functions | `src/query/api/` | Make HTTP requests (e.g., `getPokemon`, `getMoveTypes`) |
| Query key factories | `src/query/keyFactories.ts` | Centralize query keys and options |
| Custom hooks | `src/query/hooks/` | Wrap queries as reusable hooks (e.g., `usePokemon`) |

**Query client defaults** (`src/query/queryClient.ts`):
- `staleTime`: 10 minutes
- `gcTime`: 15 minutes
- `refetchOnWindowFocus`: false

**When adding a new data fetch:**
1. Create a raw function in `src/query/api/<feature>.ts` that returns typed data.
2. Add a query key to `src/query/constants.ts` (e.g., `QUERY_KEYS.newFeature`).
3. Create query options in `src/query/keyFactories.ts` using the key factory pattern.
4. Create a custom hook in `src/query/hooks/use<Feature>.ts`.

Example pattern:
```ts
// src/query/api/pokemon.ts
export async function getPokemon(page: number, name?: string, typeId?: string) {
  const response = await axios.get<ListPokemonResponse>('/api/v1/pokemon', { params: { page, pokemonName: name, pokemonTypeId: typeId } });
  return response.data;
}

// src/query/keyFactories.ts
export const getPokemonQueryOptions = (page: number, name?: string, typeId?: string) => ({
  queryKey: [QUERY_KEYS.pokemon, { page, name, typeId }],
  queryFn: () => getPokemon(page, name, typeId),
});

// src/query/hooks/usePokemon.ts
export const usePokemon = () => {
  const { data } = useQuery(getPokemonQueryOptions(currentPage, name, typeId));
  // ...
};
```

### 2. Global UI State — React Context

Global UI state lives in React contexts under `src/context/`, not in Redux or similar state managers.

Existing contexts:
- `DarkModeContext` — theme toggle state
- `MoveTypeContext` — move type filtering state

**When adding new global UI state:**
- Create a context file in `src/context/<ContextName>.tsx`.
- Provide the context near the root of the app tree.
- Keep server state in TanStack Query; use Context only for UI-level state (theme, filters, modals).

### 3. Component Organization

Components are grouped by domain under `src/components/<domain>/`:

| Domain | Contents |
|--------|----------|
| `layout/` | Header, footer, navigation |
| `pages/` | Page-level components |
| `pokemon/` | Pokemon-specific UI (cards, details, pokedex) |
| `moveTypes/` | Move type badges, filters |
| `ui/` | Shared primitives (buttons, modals, etc.) |

Shared types are in `src/models/`.

**When adding a new component:**
- Place it in the appropriate domain folder under `src/components/<domain>/`.
- Use Tailwind CSS utility classes — **no inline styles**.
- Document reusable UI components with Storybook stories in adjacent `stories/` folders.

### 4. TypeScript — Strict Typing

- **Avoid `any`** — use proper TypeScript types or interfaces.
- Shared models live in `src/models/` (e.g., `PokemonSpecies`, `MoveType`).
- API response types should match the Go backend structs.
- Use `Awaited<ReturnType<...>>` for loader data types.

### 5. Testing — Vitest with Playwright Browser Mode

**Configuration**: Vitest runs in real Chromium via Playwright browser mode (not jsdom).

**Test structure:**
- Tests are co-located in `tests/` subdirectories adjacent to the component.
- Example: `src/components/ui/tests/DarkModeButton.test.tsx`.

**Mock Service Worker (MSW):**
- `src/setupTests.ts` starts an MSW worker before every test and resets handlers afterward.
- Mock handlers are in `src/test/mocks/handlers.ts`.
- Fixtures are in `src/test/fixtures/`.
- Render helpers are in `src/test/utils/`.

**Running tests:**
```bash
cd frontend
npx vitest run                    # CI/headless mode
npm test                          # Interactive watch mode
npx vitest run src/path/to/test.test.tsx  # Single file
npx vitest run -t "TestName"     # By test name regex
npx vitest run --coverage        # With coverage
```

**When writing new tests:**
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    const element = screen.getByRole('...');
    expect(element).toBeInTheDocument();
  });
});
```

**When adding new API mocks:**
- Add handlers to `src/test/mocks/handlers.ts`.
- Place JSON fixtures in `src/test/fixtures/`.

### 6. Framework Documentation & Visual Debugging via MCP

#### A. Context7 MCP for Live Documentation
When implementing new queries, mutations, route configurations, or Tailwind utilities, leverage Context7 MCP (`context7` toolset) to avoid hallucinated or outdated APIs:
- **TanStack Query v5**: Query options syntax (`queryOptions`), `useQuery`, `useMutation`, `useQueryClient` cache invalidation patterns, and `gcTime` / `staleTime` configs (note: v5 uses `gcTime` instead of v4's `cacheTime`).
- **Tailwind CSS 3.4**: Look up utility class names for flexbox, grid, transitions, dark mode (`dark:` variant), and typography.
- **Vitest & React Testing Library**: Query latest API signatures for browser-mode assertions and Mock Service Worker (MSW) integration.

#### B. Playwright MCP for Interactive UI Verification
Use Playwright MCP (`playwright` toolset) to inspect and validate running UI instances:
- Connect to local Vite dev server (`http://localhost:5173`) or Storybook (`http://localhost:6006`).
- Navigate to pages/components, take accessibility snapshots, click elements, and inspect rendered DOM trees to verify CSS styling, responsive layout, and interaction states.

### 7. Build and Development

```bash
cd frontend
npm run dev            # Vite dev server on :5173, proxies /api to localhost:8080
npm run build          # tsc -b && vite build (typecheck is part of the build)
npm run lint           # eslint .
npm run storybook      # Component explorer on :6006
```

**Important**: `npm run build` includes TypeScript typechecking — if typecheck fails, the build fails.

### 8. Request Path

- **Local dev**: Browser → Vite (`:5173`) → proxy `/api` → Go API (`:8080`).
- **Production**: nginx serves the SPA; `location /api/` proxies to `http://api:8080/`. The trailing slash on `proxy_pass` strips the `/api/` prefix, so Go routes still resolve under `/api/v1`.

### 9. Loaders

Data loaders for React Router live in `src/loaders/`. They prefetch data before page rendering and pass initial data to TanStack Query hooks via `useLoaderData()`.

---

## Key Constraints

- **No `any` types** — use strict TypeScript interfaces.
- **No inline styles** — use Tailwind CSS utility classes.
- **Server state in TanStack Query** — not in React Context or global stores.
- **UI state in React Context** — not in Redux or similar.
- **Tests in `tests/` subdirectories** — co-located with components.
- **Vitest uses Playwright Chromium** — not jsdom. Playwright browsers must be installed (`npx playwright install`).
- **MSW handles all API calls in tests** — tests hit mocked responses, not the real backend.
- **Stories in `stories/` folders** — adjacent to documented components.
- **Build includes typecheck** — `npm run build` runs `tsc -b` first.
