import { useEffect, useRef, useState } from 'react';
import TinderCard from 'react-tinder-card';
import type { EventCard, SwipeDirection } from '../types';
import { EventCardView } from './EventCard';

type TinderCardApi = {
  swipe: (dir?: SwipeDirection) => Promise<void>;
  restoreCard: () => Promise<void>;
};

interface Props {
  cards: EventCard[];
  onSwipe: (direction: SwipeDirection, card: EventCard) => void;
  scheduledIds?: Set<string>;
}

export const TinderDeck = ({ cards, onSwipe, scheduledIds }: Props) => {
  const stack = [...cards].reverse();
  const topCard = cards[0];
  const [activeDirection, setActiveDirection] = useState<SwipeDirection | null>(null);

  const cardRefs = useRef<Record<string, TinderCardApi | null>>({});

  // Store ref callback for each card
  const setCardRef = (id: string) => (api: TinderCardApi | null) => {
    cardRefs.current[id] = api;
  };

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!topCard) return;

      const topCardApi = cardRefs.current[topCard.id];
      if (!topCardApi) return;

      let direction: SwipeDirection | null = null;
      switch (e.key) {
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        case 'ArrowUp':
          e.preventDefault();
          direction = 'up';
          break;
      }

      if (direction) {
        setActiveDirection(direction);
        await topCardApi.swipe(direction);
        setActiveDirection(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [topCard]);

  return (
    <div className="relative flex h-[520px] w-full max-w-md items-center justify-center">
      {stack.map((card, index) => (
        <div key={card.id} className="absolute inset-0 flex items-center justify-center select-none">
          <TinderCard
            // @ts-expect-error react-tinder-card types incorrectly use React.FC
            ref={setCardRef(card.id)}
            className="h-full w-full"
            onSwipe={(direction) => onSwipe(direction as SwipeDirection, card)}
            preventSwipe={['down']}
          >
            <EventCardView card={card} index={index} scheduled={scheduledIds?.has(card.id)} />
          </TinderCard>
        </div>
      ))}

      {/* Direction indicators */}
      <div
        className={`pointer-events-none absolute -left-16 top-1/2 -translate-y-1/2 text-6xl text-red-500 transition-opacity duration-200 ${
          activeDirection === 'left' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        ←
      </div>
      <div
        className={`pointer-events-none absolute -right-16 top-1/2 -translate-y-1/2 text-6xl text-green-500 transition-opacity duration-200 ${
          activeDirection === 'right' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        →
      </div>
      <div
        className={`pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 text-6xl text-yellow-500 transition-opacity duration-200 ${
          activeDirection === 'up' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        ↑
      </div>
    </div>
  );
};
