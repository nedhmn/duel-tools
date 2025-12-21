# Frontend Development Guidelines

## Project Structure

```
src/
├── routes/              # TanStack Router file-based routes
│   ├── __root.tsx       # Root layout + Outlet
│   └── index.tsx        # Home page (/)
├── features/            # Feature-based modules
│   ├── api/
│   │   ├── client.ts    # Fetch wrapper
│   │   └── types.ts     # API types
│   ├── theme/
│   │   ├── store.ts     # Zustand theme store
│   │   └── theme-toggle.tsx
│   ├── layout/
│   │   ├── app-sidebar.tsx
│   │   └── site-header.tsx
│   ├── scrape/
│   │   ├── url-extractor.tsx
│   │   └── api.ts
│   ├── batch/
│   │   ├── batch-progress.tsx
│   │   └── api.ts
│   ├── replay/
│   │   ├── replay-view.tsx
│   │   └── api.ts
│   └── players/
│       ├── player-search.tsx
│       └── api.ts
├── components/
│   └── ui/              # shadcn/ui (auto-generated, linter-ignored)
├── lib/
│   └── utils.ts         # shadcn utilities (linter-ignored)
├── env.ts               # t3-env configuration
├── main.tsx             # Entry point, providers
├── index.css            # Tailwind v4 + shadcn theme
└── routeTree.gen.ts     # Auto-generated (linter-ignored)
```

## Stack

- React 19 + TypeScript
- Vite 7 with `@tailwindcss/vite` and `@tanstack/router-plugin`
- TanStack Router (file-based routing)
- TanStack Query
- Zustand (client state, theme persistence)
- Tailwind CSS v4 (`@import "tailwindcss"` syntax)
- shadcn/ui components
- t3-env for environment variables
- Ultracite (Biome) for linting/formatting

## Code Style

- No comments, no docstrings
- Self-documenting code through clear naming
- Kebab-case filenames (`auth-form.tsx`, not `AuthForm.tsx`)
- Use `@/` path alias for imports
- Arrow functions for components and handlers

```tsx
const LoginForm = () => {
  return <form>...</form>;
};

const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
};
```

## Feature Folders

Each feature is self-contained:

```
features/scrape/
├── url-extractor.tsx
├── api.ts               # TanStack Query functions
└── types.ts             # Feature-specific types (if needed)
```

Import from features:
```tsx
import { UrlExtractor } from "@/features/scrape/url-extractor";
import { useSubmitScrape } from "@/features/scrape/api";
```

## Linting

Ultracite (Biome) ignores in `biome.json`:
- `src/components/ui` - shadcn generated
- `src/lib` - shadcn utilities
- `src/routeTree.gen.ts` - router generated
- `src/hooks` - generated hooks

```bash
pnpm check    # Lint check
pnpm fix      # Auto-fix
```

## TanStack Router

File-based routing in `src/routes/`. Route files export `Route`:

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});
```

## TanStack Query

QueryClient in `main.tsx`. Use in features:

```tsx
// features/scrape/api.ts
export const useBatchStatus = (batchId: string) =>
  useQuery({
    queryKey: ["batch", batchId],
    queryFn: () => fetch(`/api/v1/scrape/${batchId}`).then((r) => r.json()),
    refetchInterval: 2000,
  });
```

## API Client

Vite proxies `/api/*` to `http://localhost:8000`. Use relative paths:

```tsx
fetch("/api/v1/scrape", { method: "POST", body: JSON.stringify(data) });
```

## Adding shadcn Components

```bash
pnpm dlx shadcn@latest add button card input
```

## Development

```bash
pnpm dev  # Starts at :3000, proxies /api/* to :8000
```

Backend must run at `:8000`:
```bash
cd ../backend && make dev
```
