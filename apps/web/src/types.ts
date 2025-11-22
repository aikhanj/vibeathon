export type CardCategory = 'event' | 'club';
export type FilterOption = 'all' | CardCategory;

export interface EventCard {
  id: string;
  subject: string;
  sender: string;
  preview: string;
  type: CardCategory;
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

export type SwipeDirection = 'left' | 'right';
