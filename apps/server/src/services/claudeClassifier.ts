import crypto from 'node:crypto';
import type { NormalizedEmail, ClassificationResult, EventType, ClubType, Atmosphere } from '../email/types';

const EVENT_TYPES: EventType[] = ['workshop', 'speaker', 'practice', 'social', 'competition', 'meeting'];
const CLUB_TYPES: ClubType[] = ['academic', 'professional', 'sports', 'arts', 'cultural', 'volunteer', 'social', 'stem', 'entrepreneurship', 'media'];
const ATMOSPHERES: Atmosphere[] = ['chill', 'high-energy', 'tight-knit', 'large-social', 'skill-building', 'just-for-fun'];

const CLAUDE_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-3-5-sonnet-20241022';
const DEFAULT_CACHE_TTL = Number(process.env.CLAUDE_CACHE_TTL_MS ?? 15 * 60 * 1000);

interface CacheEntry {
  result: ClassificationResult;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

const sanitizeTags = (maybeTags: unknown, fallback: string[]): string[] => {
  if (!Array.isArray(maybeTags)) return fallback;
  const cleaned = maybeTags
    .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
    .filter(Boolean);
  return cleaned.length ? cleaned.slice(0, 6) : fallback;
};

const parseClassification = (text: string, fallback: ClassificationResult): ClassificationResult => {
  try {
    const parsed = JSON.parse(text);
    const type = parsed.type === 'club' ? 'club' : 'event';

    // Validate eventType
    let eventType: EventType | undefined;
    if (type === 'event' && typeof parsed.eventType === 'string' && EVENT_TYPES.includes(parsed.eventType as EventType)) {
      eventType = parsed.eventType as EventType;
    }

    // Validate clubType
    let clubType: ClubType | undefined;
    if (type === 'club' && typeof parsed.clubType === 'string' && CLUB_TYPES.includes(parsed.clubType as ClubType)) {
      clubType = parsed.clubType as ClubType;
    }

    // Validate atmosphere
    let atmosphere: Atmosphere | undefined;
    if (typeof parsed.atmosphere === 'string' && ATMOSPHERES.includes(parsed.atmosphere as Atmosphere)) {
      atmosphere = parsed.atmosphere as Atmosphere;
    }

    const result: ClassificationResult = {
      type,
      tags: sanitizeTags(parsed.tags, fallback.tags),
      eventType,
      clubType,
      atmosphere,
      eventDate: typeof parsed.eventDate === 'string' ? parsed.eventDate : fallback.eventDate,
      location: typeof parsed.location === 'string' ? parsed.location : fallback.location,
      summary: typeof parsed.summary === 'string' ? parsed.summary : fallback.summary,
      skip: typeof parsed.skip === 'boolean' ? parsed.skip : false,
      googleFormUrl:
        typeof parsed.googleFormUrl === 'string' && parsed.googleFormUrl !== 'null'
          ? parsed.googleFormUrl
          : fallback.googleFormUrl,
    };
    return result;
  } catch {
    return fallback;
  }
};

const buildPrompt = (email: NormalizedEmail) => `You are triaging inbox opportunities for Gen Z founders.
Classify the email strictly as JSON with this shape:
{
  "skip": true | false,
  "type": "event" | "club",
  "eventType": "workshop" | "speaker" | "practice" | "social" | "competition" | "meeting" | null,
  "clubType": "academic" | "professional" | "sports" | "arts" | "cultural" | "volunteer" | "social" | "stem" | "entrepreneurship" | "media" | null,
  "atmosphere": "chill" | "high-energy" | "tight-knit" | "large-social" | "skill-building" | "just-for-fun" | null,
  "eventDate": "<month day or date range>",
  "location": "City or virtual",
  "tags": ["keyword", ...],
  "summary": "short 1 sentence summary",
  "googleFormUrl": "<full Google Form URL if present, otherwise null>"
}

IMPORTANT RULES:
1. Set "skip" to true if the email is NOT about an event, club, fellowship, scholarship, hackathon, meetup, or similar opportunity. Examples of emails to skip:
   - Regular newsletters
   - Promotional emails
   - Personal correspondence
   - Transactional emails
   - Spam
2. Set "skip" to false ONLY if it's a real event or club opportunity
3. If skip is false, classify as "event" for one-time events or "club" for ongoing communities
4. For events, set "eventType" to the most appropriate category:
   - workshop: hands-on learning sessions
   - speaker: talks, panels, keynotes
   - practice: rehearsals, training sessions
   - social: casual gatherings, mixers, parties
   - competition: hackathons, contests, tournaments
   - meeting: general meetings, info sessions
5. For clubs, set "clubType" to the most appropriate category:
   - academic: study groups, honor societies
   - professional: career-focused, networking
   - sports: athletic clubs, fitness
   - arts: music, theater, visual arts
   - cultural: identity-based, international
   - volunteer: community service
   - social: casual interest groups
   - stem: science, tech, engineering, math
   - entrepreneurship: startups, business
   - media: publications, broadcasting
6. Set "atmosphere" based on the vibe:
   - chill: low-key, relaxed
   - high-energy: intense, exciting
   - tight-knit: small, close community
   - large-social: big events, lots of people
   - skill-building: learning-focused
   - just-for-fun: recreational
7. Look for Google Forms links (https://docs.google.com/forms/...) in the email body or links. Extract the complete URL if found.

Email metadata:
From: ${email.from}
Subject: ${email.subject}
Body:
${email.body}
Links found: ${email.links.join(', ')}`;

const buildCacheKey = (email: NormalizedEmail): string =>
  crypto.createHash('sha1').update(`${email.id}|${email.subject}|${email.body}`).digest('hex');

export const classifyWithClaude = async (
  email: NormalizedEmail,
  fallback: (email: NormalizedEmail) => ClassificationResult,
): Promise<ClassificationResult> => {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return fallback(email);
  }

  const cacheKey = buildCacheKey(email);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const fallbackResult = fallback(email);

  const body = {
    model: process.env.CLAUDE_MODEL ?? DEFAULT_MODEL,
    max_tokens: 400,
    temperature: 0.2,
    messages: [
      {
        role: 'user',
        content: buildPrompt(email),
      },
    ],
  };

  try {
    const response = await fetch(CLAUDE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text?: string }>;
    };

    const textBlock = data.content.find((block) => block.type === 'text');
    const parsed = textBlock?.text ? parseClassification(textBlock.text, fallbackResult) : fallbackResult;

    cache.set(cacheKey, {
      result: parsed,
      expiresAt: Date.now() + DEFAULT_CACHE_TTL,
    });

    return parsed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Claude classification failed, using fallback', error);
    return fallbackResult;
  }
};
