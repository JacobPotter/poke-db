---
name: fullstack-go-react
description: Use when developing or refactoring full-stack features involving the Go backend and React frontend. Enforces schema-driven development, Go-to-TypeScript type synchronization, structured error handling, and coding standards across the stack.
---
# Full-Stack Go & React Development Protocol

## Context
- Backend: Go (Standard Library, Chi, or Gin) + pgx for Postgres
- Frontend: React + TypeScript + Tailwind CSS
- Data Flow: Strictly typed JSON over REST or WebSockets

## Execution Steps

1. Schema-Driven Engineering:
   - When modifying or adding a feature, ALWAYS design or update the database schema first.
   - Generate or modify Go structs to map directly to Postgres tables using strict typing (e.g., `pgtype` for nulls).

2. Type Handoff Protocol:
   - Immediately after updating Go structs, you must update or generate the corresponding TypeScript interfaces.
   - Do not write unvalidated frontend data fetchers; use Zod or a matching TypeScript contract.

3. Error Handling and Status Codes:
   - Go: Wrap errors cleanly (`fmt.Errorf("context: %w", err)`) and return structured JSON error payloads to the frontend: `{"error": "Readable message", "code": "VALIDATION_FAILED"}`.
   - React: Implement an explicit Error Boundary or Axios interceptor that reads this standardized error schema.

4. Coding Style Constraints:
   - Go: Enforce standard formatting (`go fmt`), explicit dependency injection (no magic globals), and explicit context propagation (`ctx context.Context`).
   - React: Prefer functional components, strict hook dependency arrays, and explicit prop/state types. No `any`.

