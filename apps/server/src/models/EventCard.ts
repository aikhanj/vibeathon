import { CardCategory } from '../email/types';

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

export interface ApplyRecord {
  cardId: string;
  appliedAt: string;
  calendarEventId?: string;
}
