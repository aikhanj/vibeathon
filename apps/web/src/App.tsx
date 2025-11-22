import { motion } from 'framer-motion';
import { ActionButtons } from './components/ActionButtons';
import { AuthGuard } from './components/AuthGuard';
import { PendingApplyPanel } from './components/PendingApplyPanel';
import { TinderDeck } from './components/TinderDeck';
import { useSwipeDeck } from './hooks/useSwipeDeck';
import type { FilterOption } from './types';

const FILTERS: Array<{ label: string; value: FilterOption }> = [
  { label: 'All', value: 'all' },
  { label: 'Events', value: 'event' },
  { label: 'Clubs', value: 'club' },
];

const buttonStyles = (active: boolean) =>
  `rounded-full px-4 py-2 text-xs font-semibold transition ${
    active ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'
  }`;

const App = () => {
  const {
    cards,
    loading,
    error,
    filter,
    setFilter,
    swipe,
    pendingCard,
    confirmApplied,
    dismissPending,
    isConfirming,
    hasCards,
    reload,
    appliedIds,
  } = useSwipeDeck();

  const activeCard = cards[cards.length - 1];

  return (
    <AuthGuard>
      <div className="min-h-screen w-full bg-transparent px-4 py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm uppercase tracking-[0.4em] text-white/60"
        >
          TigerSwipe
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-2 max-w-2xl font-display text-4xl text-white sm:text-5xl"
        >
          Tinder-style swiping for scholarships, clubs, and founder events.
        </motion.h1>
        <p className="mt-4 max-w-2xl text-base text-slate-300">
          Pulls from your inbox (mocked for now), surfaces real opportunities, and tracks the ones you applied to by shipping them straight into Google Calendar.
        </p>
        <div className="mt-6 flex items-center gap-2 rounded-full bg-white/5 p-1">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              className={buttonStyles(filter === value)}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <motion.div
          className="mt-10 flex w-full flex-col items-center"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex h-[520px] w-full items-center justify-center text-slate-400">
              Loading cards…
            </div>
          ) : hasCards ? (
            <>
              <TinderDeck cards={cards} onSwipe={swipe} scheduledIds={appliedIds} />
              <ActionButtons
                disabled={!activeCard}
                onSwipeLeft={() => activeCard && swipe('left', activeCard)}
                onSwipeRight={() => activeCard && swipe('right', activeCard)}
              />
            </>
          ) : (
            <div className="flex h-[380px] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/5 text-slate-300">
              <p>No more cards. Adjust your filter or refresh.</p>
              <button
                type="button"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
                onClick={reload}
              >
                Reload Cards
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <PendingApplyPanel
        card={pendingCard}
        onConfirm={confirmApplied}
        onDismiss={dismissPending}
        isSubmitting={isConfirming}
      />
      </div>
    </AuthGuard>
  );
};

export default App;
