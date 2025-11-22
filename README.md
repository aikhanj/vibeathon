# TigerSwipe

TigerSwipe delivers a Tinder-style queue of opportunities pulled from your inbox (mocked today) so you can swipe through clubs and events, open their application form instantly, and add accepted ones to Google Calendar through the MCP integration.

## Stack
- **pnpm** workspace (`apps/server`, `apps/web`)
- **Express + Zod** API with mocked Gmail ingestion, Claude-powered classification, and the MCP calendar client
- **Vite + React + Tailwind + Framer Motion** front-end with `react-tinder-card`

## Getting Started
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Copy `.env.example` to `.env` (and to `apps/server/.env`, `apps/web/.env` if you prefer per-app files) then update the values.
3. Run the dev servers in separate terminals:
   ```bash
   pnpm dev:server   # http://localhost:4000
   pnpm dev:web      # http://localhost:5173
   ```

### Environment variables
`./.env.example` documents every key; highlights:

| Variable | Description |
| --- | --- |
| `PORT` | Express server port (default `4000`) |
| `MCP_CALENDAR_URL` | Base URL for the Google Calendar MCP server |
| `MCP_CALENDAR_API_KEY` | Bearer token or API key passed to the MCP endpoint |
| `MOCK_EMAIL_PATH` | Path to the Gmail-like JSON seed file |
| `CLAUDE_API_KEY` | API token used to call Anthropic for classifying each email |
| `CLAUDE_MODEL` | Anthropic model name (defaults to `claude-3-5-sonnet-20241022`) |
| `CARD_CACHE_TTL_MS` | Cache duration for classified cards (default 5 minutes) |
| `VITE_API_BASE_URL` | The API origin used by the Vite client |
| `VITE_FEATURE_AUTO_APPLY` | Flag for upcoming automation features |

### API surface
- `GET /api/cards?type=events|clubs` — returns classified cards ready for the deck UI
- `POST /api/cards/:id/apply` — records a successful application and triggers the MCP calendar insert

### Testing & linting
```bash
pnpm --filter server test   # classifier + MCP client
pnpm --filter web test      # Tinder deck smoke test
pnpm -r lint                # Runs ESLint in every workspace
```

## Docs
- `docs/cursor/overview.md` — quick tour for future Cursor sessions
- `docs/extension-notes.md` — outlines the browser-extension automation concept

Future steps include swapping the mock Gmail loader with real Gmail OAuth ingestion and persisting cards in storage so the swipe history survives refreshes. The current codebase is structured to make that upgrade straightforward.
