import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCards, markApplied } from '../api/client';
import type { EventCard, FilterOption, SwipeDirection } from '../types';

export const useSwipeDeck = () => {
  const [cards, setCards] = useState<EventCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [pendingCard, setPendingCard] = useState<EventCard | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const loadCards = useCallback(async (selectedFilter: FilterOption = filter) => {
    setLoading(true);
    setError(undefined);
    try {
      const data = await fetchCards(selectedFilter);
      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadCards(filter);
  }, [filter, loadCards]);

  const swipe = useCallback((direction: SwipeDirection, card: EventCard) => {
    setCards((prev) => prev.filter((item) => item.id !== card.id));
    if (direction === 'right') {
      window.open(card.applyLink, '_blank', 'noopener');
      setPendingCard(card);
    }
  }, []);

  const dismissPending = useCallback(() => setPendingCard(null), []);

  const confirmApplied = useCallback(async () => {
    if (!pendingCard) return;
    try {
      setIsConfirming(true);
      await markApplied(pendingCard.id);
      setAppliedIds((prev) => new Set(prev).add(pendingCard.id));
      setPendingCard(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add to calendar');
    } finally {
      setIsConfirming(false);
    }
  }, [pendingCard]);

  const hasCards = useMemo(() => cards.length > 0, [cards]);

  return {
    cards,
    loading,
    error,
    filter,
    setFilter,
    swipe,
    reload: () => loadCards(filter),
    pendingCard,
    confirmApplied,
    dismissPending,
    appliedIds,
    isConfirming,
    hasCards,
  };
};
