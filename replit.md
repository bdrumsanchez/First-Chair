# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Note Trainer (`artifacts/note-trainer`)
A music note naming speed game. Frontend-only React+Vite app.
- Displays random notes on the grand staff (treble and/or bass clef)
- Two answer modes: note name buttons (A-G) or interactive piano keyboard
- Tracks speed, accuracy, streaks, and shows detailed results
- Keyboard shortcut support (press A-G keys)
- Includes reference chart from the provided image
- Components: GrandStaff (SVG), PianoKeyboard (SVG), NoteGame (game logic)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
