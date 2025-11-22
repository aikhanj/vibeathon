# TigerSwipe

TigerSwipe delivers a Tinder-style queue of opportunities pulled from your inbox (mocked today) so you can swipe through clubs and events, open their application form instantly, and add accepted ones to Google Calendar through the MCP integration.

## Stack
- **pnpm** workspace (`apps/server`, `apps/web`)
- **Express + Zod** API with mocked Gmail ingestion, Claude-powered classification, and the MCP calendar client
- **Vite + React + Tailwind + Framer Motion** front-end with `react-tinder-card`

## Getting Started

### 1. Install dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

**Required for Authentication:**
```env
# Get from https://dashboard.clerk.com
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
# Publishable key is used by both frontend and backend
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
# Alternative: You can also set CLERK_PUBLISHABLE_KEY for server-only use
```

**Required for Email Classification:**
```env
# Get from https://console.anthropic.com/
CLAUDE_API_KEY=sk-ant-your_claude_api_key_here
```

**Optional (Server Configuration):**
```env
PORT=4000
VITE_API_BASE_URL=http://localhost:4000
VITE_APP_NAME=TigerSwipe
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_CACHE_TTL_MS=900000
CARD_CACHE_TTL_MS=300000
MOCK_EMAIL_PATH=../../data/mockEmails.json
```

**Optional (Gmail API - Server-side access):**
```env
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
GMAIL_USER_EMAIL=
GMAIL_MAX_RESULTS=50
```

**Optional (Calendar Integration):**
```env
MCP_CALENDAR_URL=
MCP_CALENDAR_API_KEY=
```

### 3. Configure Google OAuth (for Gmail access)

Follow the detailed instructions in `CLERK_GOOGLE_OAUTH_INSTRUCTIONS.md` to:
- Set up Google OAuth in Clerk Dashboard
- Add Gmail readonly scope
- Enable Gmail API in Google Cloud Console
- Configure OAuth consent screen

### 4. Run the dev servers

In separate terminals:
```bash
pnpm dev:server   # http://localhost:4000
pnpm dev:web      # http://localhost:5173
```

### Environment Variables Reference

| Variable | Description | Required |
| --- | --- | --- |
| `CLERK_SECRET_KEY` | Clerk secret key for backend auth | ✅ Yes |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key for frontend | ✅ Yes |
| `CLAUDE_API_KEY` | Anthropic API key for email classification | ✅ Yes |
| `PORT` | Express server port (default `4000`) | No |
| `VITE_API_BASE_URL` | Backend API URL (default `http://localhost:4000`) | No |
| `VITE_APP_NAME` | App display name (default `TigerSwipe`) | No |
| `CLAUDE_MODEL` | Anthropic model (default `claude-3-5-sonnet-20241022`) | No |
| `CLAUDE_CACHE_TTL_MS` | Claude response cache duration (default 15 min) | No |
| `CARD_CACHE_TTL_MS` | Card cache duration (default 5 min) | No |
| `MOCK_EMAIL_PATH` | Path to mock email JSON file | No |
| `GMAIL_CLIENT_ID` | Google OAuth client ID (server-side) | No |
| `GMAIL_CLIENT_SECRET` | Google OAuth client secret (server-side) | No |
| `GMAIL_REFRESH_TOKEN` | Google OAuth refresh token (server-side) | No |
| `GMAIL_USER_EMAIL` | Gmail account email (server-side) | No |
| `GMAIL_MAX_RESULTS` | Max emails to fetch (default 50) | No |
| `MCP_CALENDAR_URL` | Google Calendar MCP server URL | No |
| `MCP_CALENDAR_API_KEY` | MCP server API key | No |
| `VITE_FEATURE_AUTO_APPLY` | Enable auto-apply features (default `false`) | No |

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
- `CLERK_GOOGLE_OAUTH_INSTRUCTIONS.md` — detailed Google OAuth setup guide

## Gmail Integration

The app supports three modes for email data:

1. **Clerk-based OAuth** (Recommended): Users sign in with Google, and the backend accesses their Gmail
2. **Server-side Gmail**: Backend uses a refresh token to access a single Gmail account
3. **Mock Data** (Fallback): Uses sample data from `data/mockEmails.json`

Future steps include swapping the mock Gmail loader with real Gmail OAuth ingestion and persisting cards in storage so the swipe history survives refreshes. The current codebase is structured to make that upgrade straightforward.



To get started:
Install dependencies:
pnpm install
Copy .env.example to .env and set VITE_API_BASE_URL=http://localhost:4000
Start dev servers:
pnpm dev:server   # Terminal 1 - API on :4000
pnpm dev:web      # Terminal 2 - Frontend on :5173
