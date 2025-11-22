# TigerSwipe Cursor Notes

## Structure
- `apps/server`: Express API that serves classified Gmail cards and proxies calendar additions via Google Calendar MCP.
- `apps/web`: Vite + React + Tailwind UI that powers the swipe deck, confirmation panel, and framer-motion polish.
- `data/mockEmails.json`: local seed emails used instead of Gmail until OAuth is wired up.

## Workflows
1. `pnpm dev:server` launches the API (port from `.env`).
2. `pnpm dev:web` starts the Vite dev server that calls the API via `VITE_API_BASE_URL`.
3. Swiping right opens `applyLink` and queues a confirmation panel; confirming hits `/api/cards/:id/apply` which, in turn, calls the MCP calendar endpoint.

## Notes
- `.env.example` documents all required environment variables.
- Tests: `pnpm --filter server test` and `pnpm --filter web test` (Vitest) cover classifiers, MCP client, and Tinder deck rendering.
- Future extension hooks can call the same `/api/cards` + `/apply` endpoints to automate submissions.
