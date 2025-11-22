import { classifyWithClaude } from '../services/claudeClassifier';
import { EventCard } from '../models/EventCard';
import { CardCategory, ClassificationResult, NormalizedEmail } from './types';

const EVENT_REGEXES = [/summit/i, /conference/i, /fellowship/i, /hackathon/i, /expo/i, /festival/i];
const CLUB_REGEXES = [/club/i, /collective/i, /chapter/i, /cohort/i, /meetup/i, /guild/i];
const DATE_REGEX = /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i;
const LOCATION_REGEX = /\b(?:in|at)\s+([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+)*|\b[A-Z]{2,}\b)/;
const GOOGLE_FORM_REGEX = /https:\/\/docs\.google\.com\/forms\/[^\s)]+/gi;

const scoreFor = (regexes: RegExp[], text: string): number =>
  regexes.reduce((score, regex) => (regex.test(text) ? score + 1 : score), 0);

const dedupe = (values: string[]): string[] => [...new Set(values.filter(Boolean))];

const detectCategory = (email: NormalizedEmail): CardCategory => {
  const haystack = `${email.subject} ${email.body}`;
  const eventScore = scoreFor(EVENT_REGEXES, haystack);
  const clubScore = scoreFor(CLUB_REGEXES, haystack);
  return eventScore >= clubScore ? 'event' : 'club';
};

const detectDate = (body: string): string | undefined => {
  const match = body.match(DATE_REGEX);
  return match ? match[0] : undefined;
};

const detectLocation = (body: string): string | undefined => {
  const match = body.match(LOCATION_REGEX);
  return match ? match[1] : undefined;
};

const extractGoogleForms = (text: string, links: string[]): string[] => {
  const allText = `${text} ${links.join(' ')}`;
  const matches = allText.match(GOOGLE_FORM_REGEX);
  return matches ? [...new Set(matches.map((link) => link.trim()))] : [];
};

const buildTags = (email: NormalizedEmail, category: CardCategory): string[] => {
  const tags: string[] = [];
  if (/ai/i.test(email.subject)) tags.push('AI');
  if (/design/i.test(email.subject)) tags.push('Design');
  if (/founder/i.test(email.body)) tags.push('Founder');
  tags.push(category === 'event' ? 'Event' : 'Club');
  return dedupe(tags);
};

const fallbackApplyLink = (email: NormalizedEmail): string => {
  const base = process.env.APPLICATION_REDIRECT_BASE ?? 'https://tigerswipe.local/apply';
  const params = new URLSearchParams({
    rid: email.id,
  });
  return `${base}?${params.toString()}`;
};

const fallbackClassify = (email: NormalizedEmail): ClassificationResult => {
  const type = detectCategory(email);
  const googleForms = extractGoogleForms(email.body, email.links);
  return {
    type,
    eventDate: detectDate(email.body),
    location: detectLocation(email.body),
    tags: buildTags(email, type),
    summary: email.body.slice(0, 180).trim(),
    googleFormUrl: googleForms[0],
  };
};

export const buildCardFromEmail = async (email: NormalizedEmail): Promise<EventCard | null> => {
  const meta = await classifyWithClaude(email, fallbackClassify);
  
  // If Claude says to skip this email, return null
  if (meta.skip) {
    return null;
  }
  
  // Prioritize Google Form URL from classification, then from extracted links, then fallback
  const googleForms = extractGoogleForms(email.body, email.links);
  const googleFormUrl = meta.googleFormUrl || googleForms[0];
  const applyLink = googleFormUrl || email.links[0] || fallbackApplyLink(email);
  
  return {
    id: email.id,
    subject: email.subject,
    sender: email.from,
    preview: meta.summary ?? email.body.slice(0, 180).trim(),
    type: meta.type,
    applyLink,
    eventDate: meta.eventDate,
    location: meta.location,
    tags: meta.tags,
    receivedAt: email.receivedAt,
  };
};

export { fallbackClassify };
