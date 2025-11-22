import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '@clerk/express';
import { buildCardFromEmail } from '../email/classifier';
import { loadMockEmails } from '../email/mockSource';
import { loadGmailEmails, isGmailConfigured } from '../email/gmailSource';
import { EventCard } from '../models/EventCard';
import { createCalendarEvent, GoogleCalendarPayload } from '../services/googleCalendarMcp';
import { getGoogleOAuthToken, getClerkUserId } from '../services/clerkAuth';

const router = Router();
const applyStore = new Map<string, { record: EventCard; calendarEventId?: string }>();

const ApplyBodySchema = z.object({
  status: z.literal('applied'),
  calendar: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .optional(),
});

const CARD_CACHE_TTL_MS = Number(process.env.CARD_CACHE_TTL_MS ?? 5 * 60 * 1000);
let cachedCards: EventCard[] | null = null;
let cacheExpiresAt = 0;

const loadCards = async (accessToken?: string): Promise<EventCard[]> => {
  // Don't cache when using access tokens (user-specific data)
  const now = Date.now();
  if (!accessToken && cachedCards && cacheExpiresAt > now) {
    return cachedCards;
  }

  // Extract access token from Authorization header if provided
  let emails: Awaited<ReturnType<typeof loadMockEmails>>;
  if (accessToken) {
    // Use access token from frontend OAuth
    try {
      emails = await loadGmailEmails(Number(process.env.GMAIL_MAX_RESULTS ?? 50), accessToken);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Gmail API failed with access token, falling back to mock data:', error);
      emails = loadMockEmails();
    }
  } else if (isGmailConfigured()) {
    // Use server-side refresh token flow
    try {
      emails = await loadGmailEmails(Number(process.env.GMAIL_MAX_RESULTS ?? 50));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Gmail API failed with refresh token, falling back to mock data:', error);
      emails = loadMockEmails();
    }
  } else {
    // Fall back to mock data
    emails = loadMockEmails();
  }

  const cards = await Promise.all(emails.map((email) => buildCardFromEmail(email)));
  
  // Filter to only include cards with Google Forms
  const cardsWithGoogleForms = cards.filter((card) =>
    card.applyLink && card.applyLink.includes('docs.google.com/forms/'),
  );
  
  cardsWithGoogleForms.sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
  );

  // Only cache if not using access tokens
  if (!accessToken) {
    cachedCards = cardsWithGoogleForms;
    cacheExpiresAt = now + CARD_CACHE_TTL_MS;
  }
  return cardsWithGoogleForms;
};

// Optional auth middleware - only enforce if Clerk is configured
// If Clerk is not configured or auth fails, continue without auth (will use mock data)
const optionalAuth = process.env.CLERK_SECRET_KEY
  ? [
      // Wrap requireAuth to catch errors gracefully
      (req: any, res: any, next: any) => {
        const authHandler = requireAuth();
        authHandler(req, res, (err: any) => {
          if (err) {
            // Auth failed - log but continue (will fall back to mock data)
            // eslint-disable-next-line no-console
            console.warn('Clerk authentication failed, using fallback:', err.message || err);
            // Clear any auth data from request
            (req as any).auth = undefined;
          }
          next();
        });
      },
    ]
  : [];

router.get('/', ...optionalAuth, async (req, res, next) => {
  try {
    const { type } = req.query as { type?: string };
    
    // Get Google OAuth token from Clerk user's external account
    const userId = getClerkUserId(req);
    let accessToken: string | undefined = undefined;
    
    if (userId && process.env.CLERK_SECRET_KEY) {
      try {
        const googleToken = await getGoogleOAuthToken(userId);
        if (googleToken) {
          accessToken = googleToken;
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Failed to get Google OAuth token from Clerk:', err);
      }
    }
    
    // Fallback: try to get token from Authorization header (for backward compatibility)
    if (!accessToken) {
      const authHeader = req.headers.authorization;
      accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    }
    
    const cards = await loadCards(accessToken);
    const filtered = cards.filter((card) => (type ? card.type === type : true));
    res.json({ data: filtered });
  } catch (error) {
    next(error);
  }
});

const inferTimes = (card: EventCard) => {
  if (!card.eventDate) {
    return undefined;
  }
  const year = new Date(card.receivedAt).getFullYear();
  const parsed = Date.parse(`${card.eventDate} ${year}`);
  if (Number.isNaN(parsed)) {
    return undefined;
  }
  const start = new Date(parsed).toISOString();
  const end = new Date(parsed + 2 * 60 * 60 * 1000).toISOString();
  return { start, end };
};

router.post('/:id/apply', ...optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsedBody = ApplyBodySchema.parse(req.body);
    
    // Get Google OAuth token from Clerk user's external account
    const userId = getClerkUserId(req);
    let accessToken: string | undefined = undefined;
    
    if (userId && process.env.CLERK_SECRET_KEY) {
      try {
        const googleToken = await getGoogleOAuthToken(userId);
        if (googleToken) {
          accessToken = googleToken;
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Failed to get Google OAuth token from Clerk:', err);
      }
    }
    
    // Fallback: try to get token from Authorization header (for backward compatibility)
    if (!accessToken) {
      const authHeader = req.headers.authorization;
      accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    }
    
    const cards = await loadCards(accessToken);
    const card = cards.find((item) => item.id === id);

    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    const existing = applyStore.get(id);
    if (existing) {
      res.json({ status: 'ok', calendarEventId: existing.calendarEventId });
      return;
    }

    const timing = parsedBody.calendar ?? inferTimes(card);
    const payload: GoogleCalendarPayload = {
      title: card.subject,
      description: `${card.sender} • ${card.preview}`,
      start: timing?.start ?? new Date().toISOString(),
      end:
        timing?.end ?? new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
      location: card.location,
    };

    const calendarEventId = await createCalendarEvent(payload);

    applyStore.set(id, { record: card, calendarEventId });

    res.json({ status: 'ok', calendarEventId });
  } catch (error) {
    next(error);
  }
});

export default router;
