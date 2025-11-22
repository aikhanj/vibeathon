import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ActionButtons } from './components/ActionButtons';
import { PendingApplyPanel } from './components/PendingApplyPanel';
import { Sidebar } from './components/Sidebar';
import { TinderDeck } from './components/TinderDeck';
import { useSwipeDeck } from './hooks/useSwipeDeck';
import type { AtmosphereFilter, ClubTypeFilter, EventTypeFilter, FilterOption } from './types';

const FILTERS: Array<{ label: string; value: FilterOption }> = [
  { label: 'All', value: 'all' },
  { label: 'Events', value: 'event' },
  { label: 'Clubs', value: 'club' },
];

const EVENT_TYPE_FILTERS: Array<{ label: string; value: EventTypeFilter }> = [
  { label: 'Workshops', value: 'workshop' },
  { label: 'Speaker Events', value: 'speaker' },
  { label: 'Practices & Rehearsals', value: 'practice' },
  { label: 'Social Gatherings', value: 'social' },
  { label: 'Competitions', value: 'competition' },
  { label: 'Meetings', value: 'meeting' },
];

const CLUB_TYPE_FILTERS: Array<{ label: string; value: ClubTypeFilter }> = [
  { label: 'Academic / Educational', value: 'academic' },
  { label: 'Professional & Career', value: 'professional' },
  { label: 'Sports & Fitness', value: 'sports' },
  { label: 'Arts & Performance', value: 'arts' },
  { label: 'Cultural & Identity-Based', value: 'cultural' },
  { label: 'Volunteer & Community Service', value: 'volunteer' },
  { label: 'Social & Casual', value: 'social' },
  { label: 'STEM', value: 'stem' },
  { label: 'Entrepreneurship & Startups', value: 'entrepreneurship' },
  { label: 'Media & Publications', value: 'media' },
];

const ATMOSPHERE_FILTERS: Array<{ label: string; value: AtmosphereFilter }> = [
  { label: 'Chill & Low-Stress', value: 'chill' },
  { label: 'High Energy', value: 'high-energy' },
  { label: 'Tight-Knit', value: 'tight-knit' },
  { label: 'Large & Social', value: 'large-social' },
  { label: 'Skill-Building', value: 'skill-building' },
  { label: 'Just for Fun', value: 'just-for-fun' },
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
    reload,
    appliedIds,
    swipedLists,
  } = useSwipeDeck();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [eventTypeFilters, setEventTypeFilters] = useState<Set<EventTypeFilter>>(new Set());
  const [clubTypeFilters, setClubTypeFilters] = useState<Set<ClubTypeFilter>>(new Set());
  const [atmosphereFilters, setAtmosphereFilters] = useState<Set<AtmosphereFilter>>(new Set());
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const toggleEventTypeFilter = (value: EventTypeFilter) => {
    setEventTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const toggleClubTypeFilter = (value: ClubTypeFilter) => {
    setClubTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const toggleAtmosphereFilter = (value: AtmosphereFilter) => {
    setAtmosphereFilters((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const filteredCards = useMemo(() => {
    let result = cards;
    if (filter === 'event' && eventTypeFilters.size > 0) {
      result = result.filter((card) => card.eventType && eventTypeFilters.has(card.eventType));
    }
    if (filter === 'club' && clubTypeFilters.size > 0) {
      result = result.filter((card) => card.clubType && clubTypeFilters.has(card.clubType));
    }
    if (filter === 'all' && atmosphereFilters.size > 0) {
      result = result.filter((card) => card.atmosphere && atmosphereFilters.has(card.atmosphere));
    }
    return result;
  }, [cards, filter, eventTypeFilters, clubTypeFilters, atmosphereFilters]);

  const activeFiltersCount = filter === 'event' ? eventTypeFilters.size : filter === 'club' ? clubTypeFilters.size : filter === 'all' ? atmosphereFilters.size : 0;

  const activeCard = filteredCards[filteredCards.length - 1];

  return (
    <div className="min-h-screen w-full bg-transparent px-4 py-10 text-white">
      <Sidebar
        swipedLists={swipedLists}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            to="/"
            className="text-sm uppercase tracking-[0.4em] text-white/60 hover:text-white/80 transition"
          >
            TigerSwipe
          </Link>
        </motion.div>
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

        <div className="fixed right-6 top-10 z-20">
          <div className="relative">
            <button
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                activeFiltersCount > 0
                  ? 'bg-white text-slate-900'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
            >
              Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
            {filterDropdownOpen && (
              <div className="absolute right-0 z-10 mt-2 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-lg">
                {filter === 'all' && ATMOSPHERE_FILTERS.map(({ label, value }) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm hover:bg-white/10"
                  >
                    <input
                      type="checkbox"
                      checked={atmosphereFilters.has(value)}
                      onChange={() => toggleAtmosphereFilter(value)}
                      className="rounded"
                    />
                    {label}
                  </label>
                ))}
                {filter === 'event' && EVENT_TYPE_FILTERS.map(({ label, value }) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm hover:bg-white/10"
                  >
                    <input
                      type="checkbox"
                      checked={eventTypeFilters.has(value)}
                      onChange={() => toggleEventTypeFilter(value)}
                      className="rounded"
                    />
                    {label}
                  </label>
                ))}
                {filter === 'club' && CLUB_TYPE_FILTERS.map(({ label, value }) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm hover:bg-white/10"
                  >
                    <input
                      type="checkbox"
                      checked={clubTypeFilters.has(value)}
                      onChange={() => toggleClubTypeFilter(value)}
                      className="rounded"
                    />
                    {label}
                  </label>
                ))}
                {activeFiltersCount > 0 && (
                  <button
                    className="mt-2 w-full rounded-lg bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20"
                    onClick={() => {
                      if (filter === 'all') setAtmosphereFilters(new Set());
                      if (filter === 'event') setEventTypeFilters(new Set());
                      if (filter === 'club') setClubTypeFilters(new Set());
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>
            )}
          </div>
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
          ) : filteredCards.length > 0 ? (
            <>
              <TinderDeck cards={filteredCards} onSwipe={swipe} scheduledIds={appliedIds} />
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
  );
};

export default App;
