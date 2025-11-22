# Gmail Integration Quick Start Guide

## 🎯 Goal

Get your TigerSwipe app to pull **real emails** from Gmail instead of mock data.

## ✅ What's Already Done

Your app is **completely ready** to use Gmail! The code is already there. You just need to configure Clerk properly.

## 🚀 Step-by-Step Setup (5 minutes)

### Step 1: Add Gmail Scope to Clerk

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com
2. Navigate to: **User & Authentication** → **Social Connections**
3. Click on **Google** (or add it if not there)
4. In the **Scopes** section, add this scope:
   ```
   https://www.googleapis.com/auth/gmail.readonly
   ```
5. Make sure these default scopes are also present:
   - `openid`
   - `email`
   - `profile`
6. **Save** the configuration

### Step 2: Set Up Google Cloud Console (if using custom credentials)

**Note**: If you're using Clerk's shared credentials (recommended for development), you can skip this step.

If you need custom credentials:

1. Go to https://console.cloud.google.com/
2. Enable **Gmail API**
3. Configure **OAuth consent screen** with the Gmail scope
4. Create **OAuth 2.0 Client ID** credentials
5. Copy the credentials to Clerk Dashboard

Full details: See `CLERK_GOOGLE_OAUTH_INSTRUCTIONS.md`

### Step 3: Re-authenticate Users

**Important**: After adding the Gmail scope, users must sign out and sign back in to grant the new permission.

1. Click "Sign Out" in your app
2. Click "Sign in with Google"
3. You should see a consent screen asking for Gmail read access
4. Grant the permission

### Step 4: Verify It's Working

#### Method 1: Check Server Logs

Look at your server terminal. You should see:

```
✅ Using Gmail emails via Clerk OAuth token
📧 Fetching emails from Gmail using OAuth access token...
✅ Successfully fetched X emails from Gmail
```

Instead of:

```
⚠️  Using MOCK emails (no Gmail access token available)
```

#### Method 2: Check the API Response

Open your browser's developer console and look at the network tab when loading cards. The response should include:

```json
{
  "data": [...],
  "_meta": {
    "emailSource": "gmail-clerk",
    "totalCards": 25
  }
}
```

#### Method 3: Use the Diagnostic Endpoint

Visit: `http://localhost:4000/api/cards/gmail-status`

You should see:

```json
{
  "isAuthenticated": true,
  "userId": "user_...",
  "clerkConfigured": true,
  "gmailServerConfigured": false,
  "hasAccessToken": true,
  "emailSource": "gmail"
}
```

## 🐛 Troubleshooting

### "Using MOCK emails" in logs

**Cause**: Gmail scope not properly configured or user hasn't reauthorized.

**Solution**:

1. Double-check the scope in Clerk Dashboard
2. Sign out and sign back in
3. Make sure you grant Gmail permissions when prompted

### "No Google external account found"

**Cause**: User signed in with email/password instead of Google.

**Solution**:

1. Sign out
2. Use "Sign in with Google" button (not email/password)

### "Gmail scope not found in approved scopes"

**Cause**: The scope wasn't added in Clerk Dashboard, or user hasn't reauthorized.

**Solution**:

1. Add `https://www.googleapis.com/auth/gmail.readonly` in Clerk Dashboard
2. Sign out and sign back in to reauthorize

### API returning 401 Unauthorized

**Cause**: Gmail API not enabled in Google Cloud Console.

**Solution**:

1. Go to Google Cloud Console
2. Navigate to APIs & Services → Library
3. Search for "Gmail API"
4. Click Enable

## 📊 What Happens Next

Once configured:

- Your app will pull up to 50 emails from the user's Gmail (configurable via `GMAIL_MAX_RESULTS` env var)
- It searches for emails that are unread OR in the inbox
- Claude AI classifies each email to extract event information
- Only relevant event emails are shown as cards
- Mock emails are used as a fallback only if Gmail fails

## 🔒 Privacy & Security

- Your app only requests **read-only** access to Gmail (`gmail.readonly` scope)
- No emails are stored on your server (they're fetched in real-time)
- Users can revoke access at any time from their Google Account settings
- OAuth tokens are managed securely by Clerk

## 🎉 That's It!

Your app should now be pulling real emails from Gmail. If you're still seeing mock emails after following these steps, check the troubleshooting section or reach out for help.

---

**Related Documentation**:

- Full setup guide: `CLERK_GOOGLE_OAUTH_INSTRUCTIONS.md`
- Gmail OAuth summary: `GMAIL_OAUTH_INTEGRATION_SUMMARY.md`
