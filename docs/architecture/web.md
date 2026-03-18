---
title: "Web"
description: "Frontend architecture: routing, feature modules, state management, and component patterns"
created: 2026-03-18
---

# Web

React SPA for DuelingBook replay analysis with card grids and YDK export.

## Table of Contents

- [Web](#web)
  - [Table of Contents](#table-of-contents)
  - [Key Decisions](#key-decisions)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Routes](#routes)
  - [Component Patterns](#component-patterns)
  - [References](#references)

## Key Decisions

| Decision                               | Rationale                                                                                |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| File-based routing (TanStack Router)   | Route structure mirrors URL hierarchy, colocation of loaders/params                      |
| Feature-based modules over layer-based | Each feature owns its API hooks, components, and types — avoids cross-cutting imports    |
| Zustand for UI state only              | Auth and sidebar state persist across sessions; all server state lives in TanStack Query |
| Password auth via header               | Simple `X-Auth-Password` header — no tokens, no sessions, no refresh logic               |
| Client-side polling for batch status   | TanStack Query polls every 2s until batch completes — avoids WebSocket complexity        |
| YDK export on client                   | Card aggregation and file generation happen in-browser — no backend endpoint needed      |

## Tech Stack

| Category     | Technology                   |
| ------------ | ---------------------------- |
| Framework    | React 19 + TypeScript        |
| Build        | Vite 7                       |
| Routing      | TanStack Router (file-based) |
| Server State | TanStack Query               |
| Client State | Zustand (persisted)          |
| Styling      | Tailwind CSS v4 + shadcn/ui  |
| Linting      | Ultracite (Biome)            |

## Project Structure

```
src/
├── routes/           # File-based routes (TanStack Router)
├── features/         # Feature modules: api hooks + components
│   └── {feature}/    # api.ts (query hooks), components
├── components/       # Shared components (data-table, ui/)
├── lib/              # Utilities (fetch wrapper, cn)
└── main.tsx          # Entry point with providers
```

Feature modules: `auth`, `batch`, `replay`, `players`, `scrape`, `search`, `layout`. Each owns its TanStack Query hooks in `api.ts` and colocated components.

## Routes

| Route                 | Description                         |
| --------------------- | ----------------------------------- |
| `/`                   | Getting started guide               |
| `/batch`              | Sortable/filterable batch table     |
| `/batch/$batch-id`    | Batch detail + inline replay viewer |
| `/players`            | Sortable/filterable player table    |
| `/players/$player-id` | Player detail + replay history      |

Both detail routes support deep-linking via search params: `?replay=<id>&pov=<player>&format=<format>`.

## Component Patterns

**ReplayView** is the core display component with two context modes — batch context (player1/player2/both filtering) and player context (player/opponent/both filtering). Both modes share a format filter and prev/next navigation within the filtered set.

**CardGrid** renders a responsive image grid sorted by card type (Monster, Spell, Trap) then alphabetically. Images load from DuelingBook's CDN.[^1] Column count adapts: 6 (mobile) / 9 (tablet) / 12 (desktop).

**DataTable** wraps TanStack React Table with column sorting, per-column filtering, and pagination. Used by both batch and player list pages.

**YDK Export** aggregates cards across all games for a player, caps at 3 copies per card, and generates a downloadable `.ydk` deck file.

## References

| Resource                                      | Description                      |
| --------------------------------------------- | -------------------------------- |
| [Development guide](../guides/development.md) | Local setup, dev server commands |
| [API architecture](./api.md)                  | Backend endpoints and schemas    |

[^1]: `https://images.duelingbook.com/low-res/{cardId}.jpg`
