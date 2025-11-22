declare module 'react-tinder-card' {
  import type { ComponentType, ReactNode } from 'react';

  export interface ReactTinderCardProps {
    onSwipe?: (direction: string) => void;
    onCardLeftScreen?: (direction: string) => void;
    preventSwipe?: Array<'up' | 'down' | 'left' | 'right'>;
    className?: string;
    children?: ReactNode;
  }

  const TinderCard: ComponentType<ReactTinderCardProps>;
  export default TinderCard;
}
