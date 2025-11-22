# Claude Email Classification & Filtering

## What Changed

I've updated the system so that Claude now intelligently filters your emails to only show **events** and **clubs**, automatically ignoring everything else.

### How It Works

1. **Claude Classification** - For each email, Claude AI now:
   - Determines if it's an **event**, **club**, or **neither**
   - If it's neither (like newsletters, promotions, spam), it sets `skip: true`
   - If it's an event or club, it extracts:
     - Event date and location
     - Relevant tags
     - Summary
     - Google Form links (if any)

2. **Automatic Filtering** - The system now:
   - ✅ Shows emails that are events or clubs
   - ❌ Skips emails that aren't opportunities (newsletters, spam, etc.)
   - ❌ No longer requires Google Forms links (removed that filter)

3. **Tab Organization** - The UI already has tabs:
   - **All** - Shows both events and clubs
   - **Events** - Shows only one-time events (hackathons, summits, conferences)
   - **Clubs** - Shows only ongoing communities (meetups, collectives, cohorts)

## What Claude Looks For

### ✅ Events (shown):
- Hackathons
- Conferences & Summits
- Fellowships & Scholarships
- Workshops & Expos
- Founder events

### ✅ Clubs (shown):
- Student organizations
- Meetup groups
- Collectives & Communities
- Cohorts & Guilds
- Chapter meetings

### ❌ Ignored:
- Regular newsletters
- Promotional emails
- Personal correspondence
- Transactional emails (receipts, confirmations)
- Spam

## Configuration

Make sure you have this in your `.env` file:

```env
CLAUDE_API_KEY=sk-ant-your_claude_api_key_here
```

Get your API key from: https://console.anthropic.com/

## Testing

To test the new filtering:

1. Make sure your server is running:
   ```bash
   pnpm dev:server
   ```

2. The system will now:
   - Fetch emails (from Gmail if configured, otherwise mock data)
   - Send each email to Claude for classification
   - Only show emails that Claude identifies as events or clubs
   - Filter out everything else automatically

3. Use the tabs in the UI to switch between "All", "Events", and "Clubs"

## Technical Details

### Files Modified:

1. **`apps/server/src/email/types.ts`**
   - Added `skip?: boolean` to `ClassificationResult`

2. **`apps/server/src/services/claudeClassifier.ts`**
   - Updated Claude prompt to include skip logic
   - Updated parser to handle the `skip` field

3. **`apps/server/src/email/classifier.ts`**
   - Modified `buildCardFromEmail` to return `null` for skipped emails
   - Returns `EventCard | null` instead of `EventCard`

4. **`apps/server/src/routes/cards.ts`**
   - Removed Google Forms filter
   - Added filter to remove skipped emails (`null` values)
   - Now shows all events and clubs, not just ones with forms

### Classification Cache

- Classifications are cached for 15 minutes by default
- If Claude API fails, falls back to regex-based classification
- Cache key based on email ID, subject, and body

## Fallback Behavior

If `CLAUDE_API_KEY` is not set, the system falls back to regex-based classification that:
- Still categorizes as event or club
- Won't skip any emails (shows everything)
- Less accurate than Claude

For best results, always use Claude!

