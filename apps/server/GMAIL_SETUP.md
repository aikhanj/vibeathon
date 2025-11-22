# Gmail API Setup Guide

To replace mock email data with real Gmail emails, you need to set up OAuth2 credentials with Google.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the **Gmail API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

## Step 2: Create OAuth2 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" (unless you have a Google Workspace)
   - Fill in required fields (app name, support email, etc.)
   - Add scopes: `https://www.googleapis.com/auth/gmail.readonly`
   - Add test users (your Gmail address) if in testing mode
4. Create OAuth client ID:
   - Application type: "Web application"
   - Name: "TigerSwipe Server"
   - Authorized redirect URIs: `http://localhost:4000/oauth2callback` (or your callback URL)
5. Save the **Client ID** and **Client Secret**

## Step 3: Get Refresh Token

### Option A: Use the Automated Script (Recommended)

1. Make sure `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET` are in your `.env` file
2. Run the script:
   ```bash
   cd apps/server
   pnpm ts-node scripts/get-refresh-token.ts
   ```
3. Follow the instructions:
   - Visit the URL printed in the console
   - Sign in with your Google account
   - Grant permission for Gmail read-only access
   - Copy the authorization code from the redirect URL
   - Paste it when prompted
   - Copy the refresh token to your `.env` file

### Option B: Use OAuth 2.0 Playground (Alternative)

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon (⚙️) and check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. Select "Gmail API v1" > "https://www.googleapis.com/auth/gmail.readonly"
5. Click "Authorize APIs" and sign in
6. Click "Exchange authorization code for tokens"
7. Copy the **Refresh token**

## Step 4: Configure Environment Variables

Add these to your `.env` file:

```env
# Gmail API Configuration
GMAIL_CLIENT_ID=your_client_id_here
GMAIL_CLIENT_SECRET=your_client_secret_here
GMAIL_REFRESH_TOKEN=your_refresh_token_here
GMAIL_USER_EMAIL=your_email@gmail.com
GMAIL_MAX_RESULTS=50  # Optional: max number of emails to fetch (default: 50)
```

## Step 5: Test It Out

1. Restart your server
2. The system will automatically use Gmail API if all credentials are set
3. If credentials are missing, it will fall back to mock data

## Troubleshooting

- **"Gmail API not configured" error**: Check that all four environment variables are set
- **"Invalid credentials" error**: Verify your Client ID, Client Secret, and Refresh Token are correct
- **"Access denied" error**: Make sure you've added your email as a test user in the OAuth consent screen (if in testing mode)
- **No emails returned**: Check your Gmail query in `gmailSource.ts` - it currently fetches unread or inbox emails

## Fallback to Mock Data

If you don't set up Gmail credentials, the system will automatically use mock data from `data/mockEmails.json`. This allows you to develop and test without Gmail setup.
