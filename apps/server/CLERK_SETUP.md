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

Clerk stores OAuth tokens securely. The updated implementation in `apps/server/src/services/clerkAuth.ts` includes:

1. **Enhanced token extraction** - Checks multiple possible token locations
2. **Detailed logging** - Shows exactly where the system is looking for tokens
3. **Debug output** - Logs the structure of Clerk's external account object to help identify where tokens are stored

### If tokens aren't accessible via API:

Clerk may require one of the following approaches:

1. **JWT Templates**: Configure a custom JWT template in Clerk Dashboard that includes the OAuth token
2. **Token Exchange**: Use Clerk's token exchange API to get provider tokens
3. **User Impersonation**: Use Clerk's user impersonation features
4. **Backend API**: Use Clerk's Backend API with proper scopes

Check Clerk's latest documentation for the recommended approach:

- https://clerk.com/docs/backend-requests/resources/users
- https://clerk.com/docs/integrations/oauth

### Debugging Token Extraction

When you sign in with Google, check your server logs for:

```
[Clerk] Fetching Google OAuth token for user user_xxx
[Clerk] Found Google account: eac_xxx (your@email.com)
[Clerk] External account object keys: [id, provider, emailAddress, ...]
```

If the token isn't found, the logs will show the full structure of the external account object, which you can use to update the token extraction logic in `clerkAuth.ts`.
