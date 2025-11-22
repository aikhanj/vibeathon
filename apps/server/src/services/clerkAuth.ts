import { clerkClient } from '@clerk/express';
import type { Request } from 'express';

/**
 * Get Google OAuth access token from Clerk using token exchange API
 * @param userId Clerk user ID
 * @returns Google OAuth access token or null if not found
 */
export const getGoogleOAuthToken = async (userId: string): Promise<string | null> => {
  // Check if Clerk is configured
  if (!process.env.CLERK_SECRET_KEY) {
    // eslint-disable-next-line no-console
    console.warn('CLERK_SECRET_KEY not set, cannot retrieve Google OAuth token');
    return null;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    
    // eslint-disable-next-line no-console
    console.log(`[Clerk] Fetching Google OAuth token for user ${userId}`);
    
    // Find Google external account
    const googleAccount = user.externalAccounts?.find(
      (account) => account.provider === 'oauth_google' || account.provider === 'google',
    );

    if (!googleAccount) {
      // eslint-disable-next-line no-console
      console.warn(`[Clerk] No Google external account found for user ${userId}`);
      // eslint-disable-next-line no-console
      console.warn(`[Clerk] Available providers: ${user.externalAccounts?.map(a => a.provider).join(', ') || 'none'}`);
      return null;
    }

    // eslint-disable-next-line no-console
    console.log(`[Clerk] Found Google account: ${googleAccount.id} (${googleAccount.emailAddress})`);
    
    // Check approved scopes
    const approvedScopes = googleAccount.approvedScopes || '';
    if (!approvedScopes.includes('gmail.readonly') && !approvedScopes.includes('https://www.googleapis.com/auth/gmail.readonly')) {
      // eslint-disable-next-line no-console
      console.warn(`[Clerk] Gmail scope not found in approved scopes: ${approvedScopes}`);
      // eslint-disable-next-line no-console
      console.warn('[Clerk] User needs to reauthorize with Gmail scope. Add https://www.googleapis.com/auth/gmail.readonly in Clerk Dashboard');
      return null;
    }

    // Try to get token using Clerk's OAuth Access Token API
    // This requires Clerk Backend API v1
    try {
      const externalAccountId = googleAccount.id;
      
      // Use Clerk's Backend API to get OAuth access token
      // Note: This requires the external account to have been authorized with the Gmail scope
      const response = await fetch(
        `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/oauth_google`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json() as { token?: string; access_token?: string };
        const token = data.token || data.access_token;
        if (token) {
          // eslint-disable-next-line no-console
          console.log(`[Clerk] Successfully retrieved Google OAuth token via API`);
          return token;
        }
      } else if (response.status === 404) {
        // eslint-disable-next-line no-console
        console.warn('[Clerk] OAuth access token API endpoint not available. This may require Clerk Backend API v1 or a different approach.');
      }
    } catch (apiError) {
      // eslint-disable-next-line no-console
      console.warn('[Clerk] Failed to fetch token via API:', apiError);
    }

    // Fallback: Try to extract from external account object (may not work)
    const tokenData = 
      (googleAccount as any).publicMetadata?.accessToken ||
      (googleAccount as any).verification?.externalVerificationRedirectURL?.token ||
      (googleAccount as any).verification?.accessToken || 
      (googleAccount as any).token || 
      (googleAccount as any).accessToken ||
      (googleAccount as any).oauthAccessToken;
    
    if (tokenData && typeof tokenData === 'string') {
      // eslint-disable-next-line no-console
      console.log(`[Clerk] Successfully retrieved Google OAuth token from external account`);
      return tokenData;
    }

    // eslint-disable-next-line no-console
    console.warn('[Clerk] Unable to extract Google OAuth token');
    // eslint-disable-next-line no-console
    console.warn('[Clerk] Solutions:');
    // eslint-disable-next-line no-console
    console.warn('  1. Add Gmail scope (https://www.googleapis.com/auth/gmail.readonly) in Clerk Dashboard');
    // eslint-disable-next-line no-console
    console.warn('  2. User must reauthorize with Google after adding scope');
    // eslint-disable-next-line no-console
    console.warn('  3. Consider using server-side Google OAuth with refresh tokens as fallback');
    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Clerk] Error getting Google OAuth token:', error);
    return null;
  }
};

/**
 * Extract Clerk user ID from request (after Clerk middleware)
 */
export const getClerkUserId = (req: Request): string | null => {
  // Clerk middleware attaches auth object to request
  const auth = (req as any).auth;
  const userId = auth?.userId || null;
  
  if (userId) {
    // eslint-disable-next-line no-console
    console.log(`[Clerk] Authenticated user: ${userId}`);
  }
  
  return userId;
};
