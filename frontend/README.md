# PokeDB Frontend Client

The **PokeDB Frontend** is an interactive, responsive Pokédex Single Page Application (SPA) built with **React 18**, **TypeScript 5.5**, **Vite 5**, and **Tailwind CSS 3.4**. It leverages **TanStack Query v5** for efficient server state synchronization and client caching, with dedicated support for light/dark themes and type interactions.

---

## 1. Tech Stack & Key Libraries

- **Framework & Build**: React 18, TypeScript 5.5, Vite 5.
- **Styling**: Tailwind CSS 3.4, PostCSS, Autoprefixer, Heroicons.
- **Server State & Data Fetching**: `@tanstack/react-query` v5, `axios-hooks`.
- **Routing**: `react-router-dom` v6.
- **Component Explorer**: Storybook 8 with MSW addon (`msw-storybook-addon`).
- **Testing & Mocking**: Vitest 2.1 in Playwright Chromium browser mode, `@testing-library/react`, Mock Service Worker (MSW).

---

## 2. Directory & Component Architecture

Components are organized by feature domain under `src/components/`, with co-located tests and Storybook stories:

```
frontend/
├── public/                # Static assets & MSW mockServiceWorker.js
├── src/
│   ├── assets/            # SVG icons, Pokédex assets, images
│   ├── components/        # Domain-driven UI components
│   │   ├── layout/        # Layout wrapper, Navbar, NavbarItem
│   │   ├── moveTypes/     # Type details, charts, list & summary
│   │   ├── pages/         # Page views (PokemonPage, TypesPage, EvolutionsPage, MovesPage)
│   │   ├── pokemon/       # Pokemon list, summary, details, evolution chain view
│   │   └── ui/            # UI primitives (Pokedex casing, DarkModeButton, Tooltip, Skeletons)
│   ├── context/           # Global React UI contexts (DarkModeContext, MoveTypeContext)
│   ├── loaders/           # Route data loaders & query prefetch routines
│   ├── models/            # Shared TypeScript domain models & interfaces
│   ├── query/             # TanStack Query infrastructure
│   │   ├── api/           # Raw HTTP fetchers (pokemon.ts, moveType.ts, evolution.ts)
│   │   ├── helpers/       # Prefetching helpers
│   │   ├── hooks/         # Custom query hooks (usePokemon, useMoveTypes, useEvolutions)
│   │   ├── keyFactories.ts # Centralized query key definitions
│   │   └── queryClient.ts  # Global QueryClient configuration
│   ├── test/              # Test utilities, MSW handlers & mock fixtures
│   │   ├── fixtures/      # Reusable API mock data payloads
│   │   ├── mocks/         # MSW browser worker & HTTP handlers
│   │   └── utils/         # Custom render helpers wrapped with QueryClientProvider
│   ├── App.tsx            # Main router & layout root
│   ├── main.tsx           # React DOM entrypoint
│   └── setupTests.ts      # Vitest test setup and MSW lifecycle integration
├── nginx.conf             # Production Nginx reverse proxy configuration
├── vite.config.ts         # Vite build, proxy, & Vitest browser config
└── package.json
```

---

## 3. Server State Management (TanStack Query)

All API data flows through TanStack Query to ensure optimal caching, background refetching, and de-duplication:

- **Query Key Factories (`src/query/keyFactories.ts`)**: Centralizes structured query keys (e.g. `pokemonKeys.list(filter)`, `evolutionKeys.detail(id)`) to ensure predictable cache invalidation and prefetching.
- **Custom Hooks (`src/query/hooks/`)**:
  - `usePokemon`: Paginated and filtered Pokémon lists, single Pokémon details, and species information.
  - `useMoveTypes`: Move type lists, damage relations, and type effectiveness matrix.
  - `useEvolutions`: Recursive multi-branch evolution chains and trigger requirements.
- **Cache Configuration (`src/query/queryClient.ts`)**:
  - `staleTime`: 10 minutes (`1000 * 60 * 10`)
  - `gcTime`: 15 minutes (`1000 * 60 * 15`)
  - `refetchOnWindowFocus`: `false` (prevents unnecessary refetches on tab switching)

---

## 4. Global UI State (React Context)

Global client-only UI state is managed with React Contexts located in `src/context/`:
- **`DarkModeContext`**: Manages light and dark theme toggling, persisting preferences to `localStorage` and synchronizing with Tailwind's `dark` class on the root element.
- **`MoveTypeContext`**: Provides active type selections across the application for interactive type damage charts and Pokémon filtering.

---

## 5. Development & Build Commands

All commands are run from the `frontend/` directory:

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start Vite development server (proxies /api to http://localhost:8080)
npm run dev

# 3. Typecheck and build production bundle (tsc -b && vite build)
npm run build

# 4. Preview production build locally
npm run preview

# 5. Run ESLint checks
npm run lint

# 6. Launch Storybook component explorer (:6006)
npm run storybook
```

---

## 6. Request Proxying: Dev vs Production

- **Local Development**:
  Vite's dev server (`http://localhost:5173`) proxies `/api` calls directly to `http://localhost:8080` (configured in `vite.config.ts`).
- **Production (Nginx)**:
  Nginx serves the bundled static assets from `/usr/share/nginx/html` and proxies `/api` requests to `http://api:8080` using `frontend/nginx.conf`. SPA client-side routes (e.g., `/pokemon/charizard`) resolve cleanly via `try_files $uri $uri/ /index.html;`.

---

## 7. Testing Strategy (Vitest + Playwright + MSW)

Frontend tests run in a real **Chromium browser** environment via Playwright and Vitest (`@vitest/browser`), rather than an emulated JSDOM environment.

### Running Tests

```bash
cd frontend

# Run all tests in headless CI mode
npx vitest run

# Run tests in interactive watch mode
npm test

# Run a specific test file
npx vitest run src/components/ui/tests/DarkModeButton.test.tsx

# Run tests matching a test name
npx vitest run -t "DarkModeButton"

# Run tests with coverage report
npx vitest run --coverage
```

> **Note**: Playwright browser binaries must be installed prior to first run (`npx playwright install chromium`).

### Mock Service Worker (MSW)
- `src/setupTests.ts` starts an MSW worker (`src/test/mocks/worker.ts`, `handlers.ts`) before all tests and resets handlers after each test.
- Component tests interact with realistic mocked HTTP API endpoints without hitting a live backend API server.

### Writing Component Tests

Test files are co-located in `tests/` directories next to their corresponding components:

```tsx
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import React from 'react';
import { renderWithProviders } from '../../../test/utils/renderWithProviders';
import { DarkModeButton } from '../DarkModeButton';

describe('DarkModeButton', () => {
  it('renders theme toggle button correctly', () => {
    renderWithProviders(<DarkModeButton />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});
```

---

## 8. Storybook Component Explorer

Re-usable UI components, Pokédex screens, and layout elements are documented with interactive Storybook stories located in `stories/` subdirectories.

```bash
cd frontend
npm run storybook
```
Opens the Storybook explorer on `http://localhost:6006`.

---

## Related Documentation

- [Project Overview & Quickstart](../README.md)
- [System Architecture](../ARCHITECTURE.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Backend Development Guide](../api/README.md)
- [Kubernetes & GitOps Repository](https://github.com/JacobPotter/poke-db-gitops)
