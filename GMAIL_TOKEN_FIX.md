# 🔧 Fix Gmail OAuth Issues

## The Problem

Your server logs show two authentication issues:

1. **Invalid/Corrupted Refresh Token**: The `GMAIL_REFRESH_TOKEN` in your `.env` file is malformed (has extra URL parameters attached to it)
2. **Clerk OAuth Token Extraction Failing**: Clerk can't provide Google OAuth tokens automatically

## Solution 1: Generate a Clean Refresh Token

### Step 1: Check Your Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Select your project
3. Enable Gmail API (if not already enabled):
   - APIs & Services → Library
   - Search for "Gmail API"
   - Click Enable

4. Configure OAuth consent screen:
   - APIs & Services → OAuth consent screen
   - Add your email as a test user
   - Add scope: `https://www.googleapis.com/auth/gmail.readonly`

5. Check OAuth 2.0 Client credentials:
   - APIs & Services → Credentials
   - Find your OAuth 2.0 Client ID
   - Add this to Authorized redirect URIs: `http://localhost:4000/oauth/callback`
   - Copy Client ID and Client Secret

### Step 2: Update Your .env File

Make sure you have these in `apps/server/.env`:

```env
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_USER_EMAIL=your@email.com
```

**DO NOT** add `GMAIL_REFRESH_TOKEN` yet - we'll generate a fresh one.

### Step 3: Generate Fresh Refresh Token

```bash
# Install dependencies if needed
cd apps/server
pnpm install

# Run the token generator script
node scripts/generate-refresh-token.js
```

Follow the instructions:
1. Open the URL in your browser
2. Sign in with your Google account
3. Grant permissions
4. Copy the code from the URL after authorization
5. Paste it into the terminal

The script will output a clean refresh token. Copy it to your `.env` file:

```env
GMAIL_REFRESH_TOKEN=1//your-clean-refresh-token-here
```

⚠️ **Important**: Make sure there are NO spaces, quotes, or extra characters around the token!

### Step 4: Restart Your Server

```bash
# Stop the server (Ctrl+C)
# Start it again
pnpm dev:server
```

## Solution 2: Alternative - Use Mock Data for Testing

If you don't need real Gmail data right now, you can test with mock data:

### Create Mock Email Data

Create `apps/server/data/mockEmails.json`:

```json
[
  {
    "id": "mock-1",
    "from": "hackathon@princeton.edu",
    "subject": "Princeton Hackathon 2024 - Register Now!",
    "body": "Join us for Princeton's biggest hackathon! Apply here: https://docs.google.com/forms/d/e/example123",
    "receivedAt": "2024-11-22T10:00:00Z",
    "links": ["https://docs.google.com/forms/d/e/example123"]
  },
  {
    "id": "mock-2",
    "from": "opportunities@startup.com",
    "subject": "Summer Internship Opportunity",
    "body": "We're looking for talented developers! Apply: https://docs.google.com/forms/d/e/example456",
    "receivedAt": "2024-11-22T09:00:00Z",
    "links": ["https://docs.google.com/forms/d/e/example456"]
  }
]
```

The server will automatically fall back to this data if Gmail fails!

## Solution 3: Fix Clerk OAuth Integration (Advanced)

This is more complex and optional. The system works fine without it.

### Option A: Add Gmail Scope in Clerk Dashboard

1. Go to https://dashboard.clerk.com/
2. Navigate to: User & Authentication → Social Connections
3. Find Google OAuth provider
4. Add custom scope: `https://www.googleapis.com/auth/gmail.readonly`
5. Save changes

⚠️ **Users must sign out and sign in again** after adding this scope!

### Option B: Use Clerk's Token Exchange API

This requires a paid Clerk plan and is documented here:
https://clerk.com/docs/users/sync-data#retrieve-the-oauth-access-token-of-an-external-account

For now, using server-side refresh tokens (Solution 1) or mock data (Solution 2) is simpler!

## Understanding the Error Messages

### Error 1: "invalid_grant" (Line 28)
```
Error fetching Gmail emails: GaxiosError: invalid_grant
```

**What it means**: Your refresh token is expired, revoked, or malformed.

**Why it happens**:
- Token has extra characters (like `&scope=...`)
- User revoked access at https://myaccount.google.com/permissions
- Token is too old (Google expires them after 6 months of inactivity)

**Fix**: Generate a fresh token using the script above.

### Error 2: "Request had invalid authentication credentials" (Line 143)
```
Error fetching Gmail emails: GaxiosError: Request had invalid authentication credentials
```

**What it means**: Clerk couldn't provide a valid access token.

**Why it happens**:
- Gmail scope not added to Clerk's Google OAuth configuration
- User hasn't authorized with the Gmail scope
- Clerk's token extraction API not accessible

**Fix**: This is expected! The system automatically falls back to server-side auth or mock data.

## Verification Steps

After applying the fixes:

1. **Check environment variables**:
   ```bash
   # In apps/server directory
   cat .env | grep GMAIL
   ```
   Should show clean values (no extra characters)

2. **Restart server and watch logs**:
   ```bash
   pnpm dev:server
   ```

3. **Look for success messages**:
   - ✅ "TigerSwipe server listening on port 4000"
   - ✅ No "invalid_grant" errors
   - ✅ No 401 errors from Gmail API

4. **Test the API**:
   ```bash
   curl http://localhost:4000/api/cards
   ```
   Should return cards (from Gmail or mock data)

## Quick Troubleshooting

| Symptom | Cause | Solution |
|---------|-------|----------|
| "invalid_grant" | Bad refresh token | Generate new token |
| "401 Unauthorized" | Missing Gmail scope | Add scope in Google Cloud Console |
| "Mock emails file not found" | No fallback data | Create mockEmails.json |
| Empty cards array | No Google Forms in emails | Add test emails with forms |
| Server crashes | Missing dependencies | Run `pnpm install` |

## Need Help?

Check these files for more details:
- `GMAIL_OAUTH_INTEGRATION_SUMMARY.md` - Overview of the integration
- `CLERK_GOOGLE_OAUTH_INSTRUCTIONS.md` - Clerk setup guide
- `README.md` - General setup instructions

Happy coding! 🚀

