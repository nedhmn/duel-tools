# Frontend Rules & Preferences

## Code Style

- Kebab-case filenames (`batch-processing.tsx`, not `BatchProcessing.tsx`)
- `@/` path alias for all imports, never relative
- Arrow functions for components and handlers, no `React.FC`, no class components
- Named exports only, never default exports

## Project Structure

- Routes: `src/routes/` (file-based, TanStack Router)
- Features: `src/features/{feature}/` — `api.ts` (query hooks), `types.ts`, components
- Shared components: `src/components/`
- Linter-ignored: `src/components/ui/`, `src/lib/`, `src/routeTree.gen.ts`

## Components

- Loading states: `isLoading` → skeleton loaders, `isFetching` → opacity transitions
- Error states: graceful degradation with error message, never crash
- No boolean prop proliferation — create explicit variants instead
- Derive values during render — don't `useState` + `useEffect` to compute derived state

## Data Fetching (TanStack Query)

- All API hooks in `features/{feature}/api.ts`
- Query keys: hierarchical arrays — `["resource", "sub", filters]`
- Paginated queries: always use `placeholderData: keepPreviousData`
- Conditional queries: `enabled: !!id`

## Mutations & Error Handling

- Always `try/catch` at the call site, never in mutation config
- Success: `toast.success("Message")` — Error: `toast.error(error instanceof Error ? error.message : "Fallback")`
- Use `isPending` to disable submit buttons during submission

## State Management (Zustand)

- UI state only (auth, sidebar), never server/app state
- Always wrap with `persist` middleware

## Environment Variables

- Always access via `env.VITE_*` from `@/env` (t3-env), never `import.meta.env` directly

## Commands

- `pnpm dlx shadcn@latest add <component>` — add shadcn components
- `pnpm dlx @tanstack/router-cli generate` — regenerate route tree after adding/removing/renaming routes
