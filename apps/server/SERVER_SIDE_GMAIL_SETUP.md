# Server-Side Gmail OAuth Setup Guide

This guide will help you set up server-side Google OAuth as a fallback when Clerk doesn't provide OAuth tokens directly.

## Why Server-Side OAuth?

Clerk handles user authentication, but doesn't always expose OAuth provider tokens (like Google access tokens) directly. Setting up server-side OAuth gives you a reliable fallback that works independently of Clerk.

## Step-by-Step Setup

### Step 1: Google Cloud Console Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click the project dropdown at the top
   - Create a new project or select an existing one
   - Note: You can reuse the same project you used for Clerk

3. **Enable Gmail API**
   - Navigate to **APIs & Services** > **Library**
   - Search for "Gmail API"
   - Click **Enable**

4. **Configure OAuth Consent Screen**
   - Go to **APIs & Services** > **OAuth consent screen**
   - Choose **External** (unless you have Google Workspace)
   - Fill in required fields:
     - **App name**: TigerSwipe (or your app name)
     - **User support email**: Your email
     - **Developer contact information**: Your email
   - Click **Save and Continue**
   - On the **Scopes** page, click **Add or Remove Scopes**
   - Add: `https://www.googleapis.com/auth/gmail.readonly`
   - Click **Update** → **Save and Continue**
   - On the **Test users** page, add your Gmail address
   - Click **Save and Continue**

5. **Create OAuth Credentials**
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Select **Web application**
   - Name: "TigerSwipe Server"
   - **Authorized redirect URIs**: Add `http://localhost:4000/oauth2callback`
   - Click **Create**
   - **IMPORTANT**: Copy the **Client ID** and **Client Secret** immediately (you won't see the secret again!)

### Step 2: Add Credentials to .env

Add these to your `.env` file in the project root:

```env
# Server-side Gmail OAuth (fallback)
GMAIL_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret_here
GMAIL_USER_EMAIL=your_email@gmail.com
```

**Note**: Don't add `GMAIL_REFRESH_TOKEN` yet - we'll get that in the next step!

### Step 3: Get Refresh Token

#### Option A: Using the Automated Script (Easiest)

1. Make sure you've added `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET` to your `.env` file
2. Run the script:
   ```bash
   cd apps/server
   pnpm get-refresh-token
   ```
   Or from the project root:
   ```bash
   pnpm --filter server get-refresh-token
   ```

3. Follow the prompts:
   - The script will print a URL - **copy and visit it in your browser**
   - Sign in with your Google account
   - Grant permission for Gmail read-only access
   - You'll be redirected to a URL like: `http://localhost:4000/oauth2callback?code=4/0A...`
   - **Copy everything after `code=`** (the long string)
   - Paste it into the terminal when prompted
   - The script will display your refresh token

4. **Add the refresh token to your `.env` file**:
   ```env
   GMAIL_REFRESH_TOKEN=your_refresh_token_here
   ```

#### Option B: Using OAuth 2.0 Playground (Alternative)

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the **gear icon (⚙️)** in the top right
3. Check **"Use your own OAuth credentials"**
4. Enter your **Client ID** and **Client Secret**
5. In the left panel, find **"Gmail API v1"**
6. Select **`https://www.googleapis.com/auth/gmail.readonly`**
7. Click **"Authorize APIs"**
8. Sign in and grant permission
9. Click **"Exchange authorization code for tokens"**
10. Copy the **Refresh token** (not the access token - that expires!)

### Step 4: Verify Setup

1. **Restart your server**:
   ```bash
   pnpm dev:server
   ```

2. **Check the logs** - you should see:
   - No "Gmail API not configured" errors
   - Gmail emails being fetched (if you have any)

3. **Test the API**:
   - Make a request to `/api/cards`
   - The server will try Clerk first, then fall back to server-side OAuth

## How It Works

The system uses a **fallback chain**:

1. **First**: Try to get Google OAuth token from Clerk (if user is authenticated)
2. **If that fails**: Use server-side refresh token to get a new access token
3. **If that fails**: Fall back to mock data

This means:
- ✅ Authenticated users get their own Gmail data (via Clerk)
- ✅ Server can fetch Gmail even without user authentication (via refresh token)
- ✅ Development works with mock data if neither is configured

## Troubleshooting

### "Gmail API not configured" error
- Check that all four variables are set: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GMAIL_USER_EMAIL`

### "Invalid credentials" error
- Verify your Client ID and Client Secret are correct
- Make sure there are no extra spaces in your `.env` file
- Try regenerating the refresh token

### "Access denied" error
- Make sure you added your email as a test user in OAuth consent screen
- If your app is in "Testing" mode, only test users can authorize

### "No refresh token received"
- This happens if you've already authorized the app before
- Revoke access at: https://myaccount.google.com/permissions
- Then run the script again

### Redirect URI mismatch
- Make sure the redirect URI in Google Cloud Console matches exactly: `http://localhost:4000/oauth2callback`
- No trailing slashes!

## Security Notes

- ⚠️ **Never commit your `.env` file to git** - it contains secrets!
- ⚠️ **Refresh tokens are permanent** - treat them like passwords
- ⚠️ **Rotate tokens** if they're ever exposed
- ✅ The refresh token allows read-only access to Gmail (safe for server use)

## Next Steps

Once set up, your server will automatically:
- Use Clerk tokens when available (user-specific)
- Fall back to server-side OAuth (shared account)
- Use mock data if neither works

You're all set! 🎉

