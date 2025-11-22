export type CardCategory = 'event' | 'club';

export type EventType =
  | 'workshop'
  | 'speaker'
  | 'practice'
  | 'social'
  | 'competition'
  | 'meeting';

export type ClubType =
  | 'academic'
  | 'professional'
  | 'sports'
  | 'arts'
  | 'cultural'
  | 'volunteer'
  | 'social'
  | 'stem'
  | 'entrepreneurship'
  | 'media';

export type Atmosphere =
  | 'chill'
  | 'high-energy'
  | 'tight-knit'
  | 'large-social'
  | 'skill-building'
  | 'just-for-fun';

export interface NormalizedEmail {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  links: string[];
}

export interface ClassificationResult {
  type: CardCategory;
  tags: string[];
  eventType?: EventType;
  clubType?: ClubType;
  atmosphere?: Atmosphere;
  eventDate?: string;
  location?: string;
  summary?: string;
  skip?: boolean; // If true, this email should be ignored (not an event or club)
  googleFormUrl?: string;
}
