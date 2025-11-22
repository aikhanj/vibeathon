import { google } from 'googleapis';
import { NormalizedEmail } from './types';

let gmailClient: ReturnType<typeof google.gmail> | null = null;

/**
 * Initialize Gmail API client using OAuth2 credentials
 * Requires GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, and GMAIL_USER_EMAIL env vars
 */
const initGmailClient = () => {
  if (gmailClient) {
    return gmailClient;
  }

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const userEmail = process.env.GMAIL_USER_EMAIL;

  if (!clientId || !clientSecret || !refreshToken || !userEmail) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });
  return gmailClient;
};

/**
 * Extract links from email body text
 */
const extractLinks = (text: string): string[] => {
  const matches = text.match(/https?:\/\/[^\s)]+/gi);
  return matches ? matches.map((link) => link.trim()) : [];
};

/**
 * Decode base64url encoded email body
 */
const decodeBody = (data: string): string => {
  try {
    // Gmail API returns base64url encoded data
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch {
    return '';
  }
};

/**
 * Parse email message parts to extract text content
 */
const extractEmailContent = (parts: any[]): { text: string; html: string } => {
  let text = '';
  let html = '';

  for (const part of parts) {
    if (part.parts) {
      const nested = extractEmailContent(part.parts);
      text += nested.text;
      html += nested.html;
    } else {
      const body = part.body?.data || '';
      const decoded = decodeBody(body);
      if (part.mimeType === 'text/plain') {
        text += decoded;
      } else if (part.mimeType === 'text/html') {
        html += decoded;
      }
    }
  }

  return { text, html };
};

/**
 * Convert HTML to plain text (simple version)
 */
const htmlToText = (html: string): string => {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
};

/**
 * Create Gmail client from access token
 */
const createGmailClientFromToken = (accessToken: string) => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth: oauth2Client });
};

/**
 * Fetch emails from Gmail API
 * Returns normalized emails matching the expected format
 * @param maxResults Maximum number of emails to fetch
 * @param accessToken Optional access token from OAuth flow (takes precedence over refresh token)
 */
export const loadGmailEmails = async (
  maxResults: number = 50,
  accessToken?: string,
): Promise<NormalizedEmail[]> => {
  let client: ReturnType<typeof google.gmail> | null = null;

  // If access token is provided, use it (from frontend OAuth)
  if (accessToken) {
    client = createGmailClientFromToken(accessToken);
  } else {
    // Otherwise, try to use refresh token flow (server-side auth)
    client = initGmailClient();
    if (!client) {
      throw new Error(
        'Gmail API not configured. Provide an access token or set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, and GMAIL_USER_EMAIL environment variables.',
      );
    }
  }

  try {
    // Fetch message list
    const listResponse = await client.users.messages.list({
      userId: 'me',
      maxResults,
      q: 'is:unread OR in:inbox', // You can customize this query
    });

    const messages = listResponse.data.messages || [];
    if (messages.length === 0) {
      return [];
    }

    // Fetch full message details
    const emailPromises = messages.map(async (message) => {
      const msgResponse = await client.users.messages.get({
        userId: 'me',
        id: message.id!,
        format: 'full',
      });

      const msg = msgResponse.data;
      const headers = msg.payload?.headers || [];
      const fromHeader = headers.find((h) => h.name?.toLowerCase() === 'from');
      const subjectHeader = headers.find((h) => h.name?.toLowerCase() === 'subject');
      const dateHeader = headers.find((h) => h.name?.toLowerCase() === 'date');

      const from = fromHeader?.value || 'Unknown Sender';
      const subject = subjectHeader?.value || 'Untitled';
      const receivedAt = dateHeader?.value
        ? new Date(dateHeader.value).toISOString()
        : new Date().toISOString();

      // Extract body content
      let body = '';
      if (msg.payload?.body?.data) {
        body = decodeBody(msg.payload.body.data);
      } else if (msg.payload?.parts) {
        const content = extractEmailContent(msg.payload.parts);
        body = content.text || htmlToText(content.html);
      }

      return {
        id: msg.id || `gmail-${Date.now()}-${Math.random()}`,
        from,
        subject,
        body,
        receivedAt,
        links: extractLinks(body),
      } as NormalizedEmail;
    });

    const emails = await Promise.all(emailPromises);
    return emails.filter((email) => email.body.length > 0); // Filter out empty emails
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching Gmail emails:', error);
    throw new Error(`Failed to fetch Gmail emails: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Check if Gmail API is configured
 */
export const isGmailConfigured = (): boolean => {
  return !!(
    process.env.GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN &&
    process.env.GMAIL_USER_EMAIL
  );
};

