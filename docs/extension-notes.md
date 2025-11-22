# TigerSwipe Extension Notes

## Concept
A future browser extension can read Gmail in the browser, classify candidate events locally, and call the TigerSwipe server API to keep data in sync. Once an opportunity is accepted, the extension can auto-fill the external application and trigger the `/api/cards/:id/apply` endpoint to add the event to Calendar via MCP.

## Hooks
- `GET /api/cards?type=events|clubs` returns Tinder-ready cards.
- `POST /api/cards/:id/apply` registers the application and schedules Google Calendar entries.
- Local storage token (e.g., `X-TigerSwipe-Key`) can be added to both endpoints to authorize extension calls.

## Next steps
1. Replace `mockSource` with the Gmail API (read-only scope) and persist cards in a real store.
2. Move shared DTOs to a dedicated package so the extension and server stay aligned.
3. Add automation toggles (auto-confirm after form submission) via the `VITE_FEATURE_AUTO_APPLY` flag in the web UI.
