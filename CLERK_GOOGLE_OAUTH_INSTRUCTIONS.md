# Clerk Google OAuth Setup Instructions

## Step 1: Configure Google OAuth in Clerk Dashboard

### A. Access Clerk Dashboard

1. Go to https://dashboard.clerk.com
2. Select your application (or create one if you haven't)

### B. Add Google OAuth Provider

1. In the left sidebar, navigate to **User & Authentication** → **Social Connections**
2. Click **Add connection**
3. Select **Google** from the list of providers
4. You'll see two options:
   - **Use Clerk's shared credentials** (recommended for development)
   - **Use custom credentials** (required for production)

### C. Configure Gmail Readonly Scope (CRITICAL STEP)

1. In the Google OAuth provider settings, find the **Scopes** section
2. Click **Add scope** or **Edit scopes**
3. Add the following scope:
   ```
   https://www.googleapis.com/auth/gmail.readonly
   ```
4. Make sure the following default scopes are also present:
   - `openid`
   - `email`
   - `profile`
5. **Save** the configuration

### D. Enable the Google Provider

1. Toggle the switch to **Enable** the Google provider
2. Make sure it's set to appear on the sign-in page

## Step 2: Google Cloud Console Setup (If Using Custom Credentials)

### A. Create/Select Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Create a new project or select an existing one
3. Note the project ID

### B. Enable Gmail API

1. Navigate to **APIs & Services** → **Library**
2. Search for "Gmail API"
3. Click **Enable**

### C. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type (unless you have Google Workspace)
3. Fill in required fields:
   - **App name**: TigerSwipe (or your app name)
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue**

### D. Add Scopes

1. On the Scopes page, click **Add or Remove Scopes**
2. Add these scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
3. Click **Update** → **Save and Continue**

### E. Add Test Users (for Development)

1. On the Test users page, click **Add Users**
2. Add your Gmail address (the one you'll use for testing)
3. Click **Save and Continue**

### F. Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Add authorized redirect URIs:
   - Copy the redirect URI from Clerk Dashboard (shown in the Google provider settings)
   - Paste it into the authorized redirect URIs
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**
7. Go back to Clerk Dashboard and paste them into the custom credentials section

## Step 3: Verify Configuration

### A. Test the OAuth Flow

1. Go to your application running locally
2. Click "Sign in with Google"
3. You should see a consent screen asking for:
   - Basic profile information
   - Read-only access to Gmail
4. Grant the permissions
5. You should be signed in successfully

### B. Check Backend Logs

1. Open your server terminal
2. Look for logs indicating:
   - User authentication successful
   - Google OAuth token retrieval attempts
3. If you see errors, check the troubleshooting section below

## Troubleshooting

### "No Google external account found"

- User needs to sign in with Google through Clerk (not email/password)
- Sign out and sign in again with Google

### "Could not fetch external account details"

- Check that CLERK_SECRET_KEY is set correctly in .env
- Verify the key matches your Clerk application

### "Gmail API errors" or "401 Unauthorized"

- Verify Gmail API is enabled in Google Cloud Console
- Check that the gmail.readonly scope is added in Clerk
- Ensure test user email is added in Google Cloud Console (if in testing mode)

### "Scope not requested"

- The scope must be added in Clerk's Google OAuth provider settings
- Sign out, update scope in Clerk, then sign in again to re-authorize

## Next Steps

After completing this setup:

1. Restart your dev server to pick up any changes
2. Test signing in with Google
3. Check server logs to verify Gmail email fetching
4. Verify cards display with real email data in the UI
