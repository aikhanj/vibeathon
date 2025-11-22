import { Router } from 'express';
import { z } from 'zod';
import { buildCardFromEmail } from '../email/classifier';
import { loadMockEmails } from '../email/mockSource';
import { EventCard } from '../models/EventCard';
import { createCalendarEvent, GoogleCalendarPayload } from '../services/googleCalendarMcp';

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

const loadCards = async (): Promise<EventCard[]> => {
  const now = Date.now();
  if (cachedCards && cacheExpiresAt > now) {
    return cachedCards;
  }

  const emails = loadMockEmails();
  const cards = await Promise.all(emails.map((email) => buildCardFromEmail(email)));
  cards.sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
  );

  cachedCards = cards;
  cacheExpiresAt = now + CARD_CACHE_TTL_MS;
  return cards;
};

router.get('/', async (req, res, next) => {
  try {
    const { type } = req.query as { type?: string };
    const cards = await loadCards();
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

router.post('/:id/apply', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsedBody = ApplyBodySchema.parse(req.body);
    const cards = await loadCards();
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
