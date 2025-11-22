import { Link } from 'react-router-dom';

interface Props {
  onSwipeRight: () => void;
  disabled?: boolean;
}

const buttonBase =
  'flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition';

export const ActionButtons = ({ onSwipeRight, disabled }: Props) => (
  <div className="mt-8 flex w-full max-w-md items-center justify-center">
    <Link
      to="/apply"
      onClick={onSwipeRight}
      className={`${buttonBase} bg-brand-500 text-white shadow-lg shadow-brand-500/40 ${disabled ? 'pointer-events-none opacity-40' : ''}`}
    >
      Apply
    </Link>
  </div>
);
