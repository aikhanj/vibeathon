import { motion } from 'framer-motion';
import type { ComponentProps, ReactNode } from 'react';

interface Props {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  disabled?: boolean;
}

const buttonBase =
  'flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40';

const MotionButton = ({
  children,
  ...rest
}: { children: ReactNode } & ComponentProps<typeof motion.button>) => (
  <motion.button whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.03 }} {...rest}>
    {children}
  </motion.button>
);

export const ActionButtons = ({ onSwipeLeft, onSwipeRight, disabled }: Props) => (
  <div className="mt-8 flex w-full max-w-md items-center justify-between gap-4">
    <MotionButton
      aria-label="Skip card"
      className={`${buttonBase} bg-slate-800 text-slate-100`}
      onClick={onSwipeLeft}
      disabled={disabled}
    >
      Skip
    </MotionButton>
    <MotionButton
      aria-label="Open application"
      className={`${buttonBase} bg-brand-500 text-white shadow-lg shadow-brand-500/40`}
      onClick={onSwipeRight}
      disabled={disabled}
    >
      Apply
    </MotionButton>
  </div>
);
