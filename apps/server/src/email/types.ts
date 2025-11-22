export type CardCategory = 'event' | 'club';

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
  eventDate?: string;
  location?: string;
  summary?: string;
  googleFormUrl?: string;
}
