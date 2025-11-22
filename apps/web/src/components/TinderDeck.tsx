import TinderCard from 'react-tinder-card';
import type { EventCard, SwipeDirection } from '../types';
import { EventCardView } from './EventCard';

interface Props {
  cards: EventCard[];
  onSwipe: (direction: SwipeDirection, card: EventCard) => void;
  scheduledIds?: Set<string>;
}

export const TinderDeck = ({ cards, onSwipe, scheduledIds }: Props) => {
  const stack = [...cards].reverse();
  return (
    <div className="relative flex h-[520px] w-full max-w-md items-center justify-center">
      {stack.map((card, index) => (
        <div key={card.id} className="absolute inset-0 flex items-center justify-center">
          <TinderCard
            className="h-full w-full"
            onSwipe={(direction) => onSwipe(direction as SwipeDirection, card)}
            preventSwipe={['up', 'down']}
          >
            <EventCardView card={card} index={index} scheduled={scheduledIds?.has(card.id)} />
          </TinderCard>
        </div>
      ))}
    </div>
  );
};
