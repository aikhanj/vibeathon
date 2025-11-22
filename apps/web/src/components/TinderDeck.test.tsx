import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TinderDeck } from './TinderDeck';
import type { EventCard } from '../types';

import type { ReactNode } from 'react';

vi.mock('react-tinder-card', () => ({
  default: ({ children, onSwipe }: { children: ReactNode; onSwipe: (direction: string) => void }) => (
    <div data-testid="mock-card" onClick={() => onSwipe('right')}>
      {children}
    </div>
  ),
}));

const cards: EventCard[] = [
  {
    id: 'card-1',
    subject: 'AI Fellowship',
    sender: 'AI Org',
    preview: 'Learn AI',
    type: 'event',
    applyLink: '#',
    tags: ['AI'],
    receivedAt: new Date().toISOString(),
  },
];

describe('TinderDeck', () => {
  it('renders cards and forwards swipe events', () => {
    const onSwipe = vi.fn();
    render(<TinderDeck cards={cards} onSwipe={onSwipe} scheduledIds={new Set()} />);
    const rendered = screen.getByTestId('mock-card');
    rendered.click();
    expect(onSwipe).toHaveBeenCalledWith('right', cards[0]);
  });
});
