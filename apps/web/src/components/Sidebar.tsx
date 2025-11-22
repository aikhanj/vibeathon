import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SwipedLists, EventCard } from '../types';

interface Props {
  swipedLists: SwipedLists;
  isOpen: boolean;
  onToggle: () => void;
}

type TabKey = 'interested' | 'notInterested' | 'reviewLater';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'interested', label: 'Interested' },
  { key: 'notInterested', label: 'Not Interested' },
  { key: 'reviewLater', label: 'Review Later' },
];

const CardItem = ({ card }: { card: EventCard }) => (
  <a
    href={card.applyLink}
    target="_blank"
    rel="noopener noreferrer"
    className="block rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
  >
    <p className="text-sm font-medium text-white truncate">{card.subject}</p>
    <p className="mt-1 text-xs text-slate-400 truncate">{card.sender}</p>
    <span className="mt-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300 capitalize">
      {card.type}
    </span>
  </a>
);

export const Sidebar = ({ swipedLists, isOpen, onToggle }: Props) => {
  const [activeTab, setActiveTab] = useState<TabKey>('interested');

  const currentList = swipedLists[activeTab];

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          )}
        </svg>
      </button>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-40 h-full w-80 border-r border-white/10 bg-slate-900/95 backdrop-blur-sm"
          >
            <div className="flex h-full flex-col p-4">
              <h2 className="mb-4 text-lg font-semibold text-white">Swiped Clubs</h2>

              {/* Tabs */}
              <div className="mb-4 flex gap-1 rounded-lg bg-white/5 p-1">
                {TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
                      activeTab === key
                        ? 'bg-white text-slate-900'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {label}
                    <span className="ml-1 text-xs opacity-60">
                      ({swipedLists[key].length})
                    </span>
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {currentList.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No clubs yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {currentList.map((card) => (
                      <CardItem key={card.id} card={card} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
