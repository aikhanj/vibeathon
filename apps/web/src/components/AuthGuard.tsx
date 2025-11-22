import { useAuth, SignInButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center text-white">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
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
            Sign in with Google to access your Gmail and discover opportunities.
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-8"
          >
            <SignInButton mode="modal">
              <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                Sign in with Google
              </button>
            </SignInButton>
          </motion.div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

