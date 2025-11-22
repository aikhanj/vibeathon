import crypto from 'node:crypto';
import type { NormalizedEmail, ClassificationResult } from '../email/types';

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
    const result: ClassificationResult = {
      type: parsed.type === 'club' ? 'club' : 'event',
      tags: sanitizeTags(parsed.tags, fallback.tags),
      eventDate: typeof parsed.eventDate === 'string' ? parsed.eventDate : fallback.eventDate,
      location: typeof parsed.location === 'string' ? parsed.location : fallback.location,
      summary: typeof parsed.summary === 'string' ? parsed.summary : fallback.summary,
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
  "type": "event" | "club",
  "eventDate": "<month day or date range>",
  "location": "City or virtual",
  "tags": ["keyword", ...],
  "summary": "short 1 sentence summary",
  "googleFormUrl": "<full Google Form URL if present, otherwise null>"
}
IMPORTANT: Look for Google Forms links (https://docs.google.com/forms/...) in the email body or links. Extract the complete URL if found.
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
