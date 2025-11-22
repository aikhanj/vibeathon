import { AnimatePresence, motion } from 'framer-motion';
import type { EventCard } from '../types';

interface Props {
  card: EventCard | null;
  onConfirm: () => void;
  onDismiss: () => void;
  isSubmitting: boolean;
}

export const PendingApplyPanel = ({ card, onConfirm, onDismiss, isSubmitting }: Props) => (
  <AnimatePresence>
    {card ? (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-2xl rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-white shadow-2xl backdrop-blur"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold">Added {card.subject} to your queue.</p>
            <p className="text-slate-300">Tap confirm once you finish the external form and we will add it to your calendar.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white"
              onClick={onDismiss}
              disabled={isSubmitting}
            >
              Dismiss
            </button>
            <button
              type="button"
              className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-slate-900"
              onClick={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding…' : 'Confirm & add to calendar'}
            </button>
          </div>
        </div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);
