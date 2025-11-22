import { clerkClient } from '@clerk/express';
import type { Request } from 'express';

/**
 * Get Google OAuth access token from Clerk user's external account
 * @param userId Clerk user ID
 * @returns Google OAuth access token or null if not found
 */
export const getGoogleOAuthToken = async (userId: string): Promise<string | null> => {
  try {
    const user = await clerkClient.users.getUser(userId);
    
    // Find Google external account
    const googleAccount = user.externalAccounts?.find(
      (account) => account.provider === 'oauth_google' || account.provider === 'google',
    );

    if (!googleAccount) {
      // eslint-disable-next-line no-console
      console.warn(`No Google external account found for user ${userId}`);
      return null;
    }

    // Clerk stores OAuth tokens securely. We need to get the external account details
    // The access token is typically stored in the account's verification or token data
    // Note: This might require additional Clerk API calls or configuration
    // For now, we'll try to get it from the account metadata
    
    // Try to get the external account with full details
    try {
      const externalAccount = await clerkClient.users.getExternalAccount({
        userId,
        externalAccountId: googleAccount.id,
      });

      // The token structure may vary - check common locations
      const tokenData = (externalAccount as any).verification?.accessToken || 
                       (externalAccount as any).token || 
                       (externalAccount as any).accessToken;
      
      if (tokenData && typeof tokenData === 'string') {
        return tokenData;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Could not fetch external account details:', err);
    }

    // If we can't get the token directly, return null
    // The user may need to reauthorize or we need to use a different approach
    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting Google OAuth token from Clerk:', error);
    return null;
  }
};

/**
 * Extract Clerk user ID from request (after Clerk middleware)
 */
export const getClerkUserId = (req: Request): string | null => {
  // Clerk middleware attaches auth object to request
  const auth = (req as any).auth;
  return auth?.userId || null;
};

