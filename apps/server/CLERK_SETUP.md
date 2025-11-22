# Clerk Setup Guide for Google OAuth with Gmail

This guide explains how to configure Clerk to enable Google OAuth with Gmail read-only access.

## 1. Create Clerk Application

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Note your **Publishable Key** and **Secret Key**

## 2. Configure Environment Variables

Add these to your `.env` file:

```env
# Frontend (apps/web)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Backend (apps/server)
CLERK_SECRET_KEY=sk_test_...
```

## 3. Configure Google OAuth Provider in Clerk

1. In Clerk Dashboard, go to **User & Authentication** > **Social Connections**
2. Click **Add connection** and select **Google**
3. For development, you can use Clerk's shared credentials
4. For production, enable **Use custom credentials** and provide:
   - Your Google OAuth Client ID
   - Your Google OAuth Client Secret
   - Authorized Redirect URI (provided by Clerk)

## 4. Add Gmail Read-Only Scope

**IMPORTANT**: You need to add the Gmail readonly scope to the Google OAuth provider:

1. In the Google OAuth provider settings, find the **Scopes** field
2. Add the following scope:
   ```
   https://www.googleapis.com/auth/gmail.readonly
   ```
3. Save the configuration

## 5. Configure Google Cloud Console (for Production)

If using custom credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing one
3. Enable **Gmail API**:
   - Navigate to **APIs & Services** > **Library**
   - Search for "Gmail API"
   - Click **Enable**
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Application type: **Web application**
   - Add authorized redirect URI from Clerk
   - Save Client ID and Client Secret

## 6. OAuth Consent Screen

1. In Google Cloud Console, go to **APIs & Services** > **OAuth consent screen**
2. Configure the consent screen:
   - User Type: **External** (unless you have Google Workspace)
   - Fill in required fields
   - Add scopes: `https://www.googleapis.com/auth/gmail.readonly`
   - Add test users (your email) if in testing mode
3. Submit for verification (required for production)

## How It Works

1. User signs in with Google through Clerk
2. Clerk requests Gmail readonly scope during OAuth flow
3. Frontend sends Clerk session token to backend
4. Backend verifies token and retrieves Google OAuth token from Clerk
5. Backend uses Google OAuth token to fetch Gmail emails

## Troubleshooting

- **"No Google external account found"**: User needs to sign in with Google through Clerk
- **"Could not fetch external account details"**: Check that CLERK_SECRET_KEY is set correctly
- **Gmail API errors**: Verify that Gmail API is enabled in Google Cloud Console
- **Scope not requested**: Make sure the scope is added in Clerk's Google OAuth provider settings

## Note on OAuth Token Access

Clerk stores OAuth tokens securely. The current implementation attempts to retrieve the Google OAuth token from the user's external account. If this doesn't work, you may need to:

1. Use Clerk's backend API to access tokens (check Clerk documentation)
2. Or configure a JWT template that includes the OAuth token
3. Or use Clerk's token exchange features

Check Clerk's latest documentation for the recommended approach to access OAuth provider tokens.

