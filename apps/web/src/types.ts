export type CardCategory = 'event' | 'club';
export type FilterOption = 'all' | CardCategory;

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

export type EventTypeFilter = EventType | 'all';
export type ClubTypeFilter = ClubType | 'all';
export type AtmosphereFilter = Atmosphere | 'all';

export interface EventCard {
  id: string;
  subject: string;
  sender: string;
  preview: string;
  type: CardCategory;
  eventType?: EventType;
  clubType?: ClubType;
  atmosphere?: Atmosphere;
  applyLink: string;
  eventDate?: string;
  location?: string;
  tags: string[];
  receivedAt: string;
}

export interface ApplyResponse {
  status: 'ok';
  calendarEventId?: string;
}

export type SwipeDirection = 'left' | 'right' | 'up';

export interface SwipedLists {
  interested: EventCard[];
  notInterested: EventCard[];
  reviewLater: EventCard[];
}
