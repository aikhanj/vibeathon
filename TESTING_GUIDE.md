# Testing Guide: Google OAuth Gmail Integration

This guide will help you test the end-to-end flow of Gmail integration with Claude classification.

## Prerequisites

Before testing, ensure you have:

1. ✅ Configured Google OAuth in Clerk Dashboard with Gmail scope (see `CLERK_GOOGLE_OAUTH_INSTRUCTIONS.md`)
2. ✅ Set up environment variables (see README.md)
3. ✅ Both servers running:
   - Backend: `pnpm dev:server` (http://localhost:4000)
   - Frontend: `pnpm dev:web` (http://localhost:5173)

## Testing Steps

### Step 1: Sign In with Google

1. Open http://localhost:5173 in your browser
2. You should see the Clerk sign-in interface
3. Click "Sign in with Google"
4. Google OAuth consent screen will appear
5. **IMPORTANT**: Check that it requests permission for:
   - Basic profile information (email, name)
   - **Read-only access to Gmail**
6. Grant the permissions
7. You should be redirected back to the app and signed in

### Step 2: Monitor Server Logs

Open your terminal running `pnpm dev:server` and look for these log messages:

#### Expected Flow (Success):
```
[Clerk] Authenticated user: user_xxxxx
GET /api/cards 200
```

#### With Token Extraction Attempts:
```
[Clerk] Authenticated user: user_xxxxx
[Clerk] Fetching Google OAuth token for user user_xxxxx
[Clerk] Found Google account: eac_xxxxx (your@email.com)
[Clerk] External account keys: [id, provider, emailAddress, ...]
```

#### If Token Found:
```
[Clerk] Successfully retrieved Google OAuth token (length: XXX)
[Gmail] Fetching emails...
```

#### If Token Not Found (Falls Back to Mock Data):
```
[Clerk] Could not find OAuth token in expected locations
[Clerk] Unable to extract Google OAuth token
Gmail API failed with access token, falling back to mock data
```

### Step 3: Verify Email Data

1. Check the cards displayed in the UI
2. If Gmail integration is working:
   - You should see cards from your actual Gmail inbox
   - Cards will be filtered to only show those with Google Forms
   - Look for familiar email subjects/senders
3. If falling back to mock data:
   - You'll see generic test events (hackathons, club meetings, etc.)
   - Check server logs to see why Gmail failed

### Step 4: Test Claude Classification

Watch for these logs indicating Claude is processing emails:

```
Claude classification failed, using fallback
```
or
```
[Classification successful - no explicit log, but cards should have proper tags/summaries]
```

Verify cards have:
- ✅ Subject line
- ✅ Sender name
- ✅ Tags (AI, Design, Event, Club, etc.)
- ✅ Summary text
- ✅ Event date (if applicable)
- ✅ Location (if applicable)

### Step 5: Test Swipe Functionality

1. Swipe right on a card
2. The card should:
   - Open the Google Form in a new tab
   - Show a confirmation panel asking if you applied
3. Swipe left to dismiss a card

### Step 6: Test Card Filtering

Use the filter buttons (if present) to filter by:
- All
- Events only
- Clubs only

## Troubleshooting

### Issue: "No cards available"

**Check:**
1. Server logs for errors
2. Gmail API status (if using Gmail)
3. Mock data file exists at correct path

**Fix:**
- Ensure `data/mockEmails.json` exists
- Check file path in `.env`: `MOCK_EMAIL_PATH=../../data/mockEmails.json`

### Issue: Gmail API errors (401 Unauthorized)

**Check:**
1. Gmail scope is added in Clerk Dashboard
2. User signed in with Google (not email/password)
3. Gmail API is enabled in Google Cloud Console
4. Test user is added (if in testing mode)

**Fix:**
- Re-add the scope in Clerk: `https://www.googleapis.com/auth/gmail.readonly`
- Sign out and sign in again to reauthorize

### Issue: No Google external account found

**Check:**
- User must sign in with Google, not email/password
- Google OAuth provider is enabled in Clerk

**Fix:**
- Sign out completely
- Sign in again using "Continue with Google" button

### Issue: OAuth token not accessible

**This is expected for now!** Clerk may not expose OAuth tokens via the standard API.

**Workarounds:**
1. System will fall back to mock data (already working)
2. Consider using Clerk's JWT templates to include tokens
3. Use server-side Gmail refresh token instead
4. Contact Clerk support for token access guidance

### Issue: Claude classification not working

**Check:**
1. `CLAUDE_API_KEY` is set in `.env`
2. API key is valid and has credits
3. Server logs for Claude API errors

**Fix:**
- Verify API key from https://console.anthropic.com/
- Check API usage/billing status
- System will fall back to regex-based classification

### Issue: Cards have no Google Forms

**Check:**
- Your Gmail has emails with Google Forms links
- Filter logic in `cards.ts` line 51-53

**Fix:**
- Test with mock data first (has Google Forms)
- Check that emails contain `docs.google.com/forms/` URLs

## Expected Results

### ✅ Successful Gmail Integration
- Cards from your actual Gmail inbox
- Each card has a Google Form link
- Claude-powered classification with tags
- Smooth swipe interactions

### ✅ Graceful Fallback (Mock Data)
- Cards from `data/mockEmails.json`
- Still classified by Claude
- All functionality works the same

### ✅ Complete Fallback (Mock + Regex)
- Cards from mock data
- Classified by regex patterns
- Basic but functional

## Next Steps After Testing

If Gmail integration isn't working:

1. **Check Debug Logs**: The enhanced logging will show exactly where the token extraction is failing
2. **Consult Clerk Docs**: Look for latest guidance on accessing OAuth provider tokens
3. **Use Server-Side Gmail**: Configure Gmail API with refresh token (see `apps/server/GMAIL_SETUP.md`)
4. **Stick with Mock Data**: The system works perfectly well with curated mock data for development

## Reporting Issues

When reporting issues, include:
- [ ] Full server log output from sign-in to card display
- [ ] Browser console errors (if any)
- [ ] Clerk configuration (provider enabled, scopes added)
- [ ] Environment variables set (don't share actual keys!)
- [ ] Steps to reproduce

---

**Remember**: The system is designed to gracefully fall back through multiple data sources. Even if Gmail integration doesn't work immediately, you should still be able to test all other functionality with mock data!

