import { useAuth, SignInButton, SignOutButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isSignedIn, isLoaded } = useAuth();

  // Generate stars once and memoize them
  const stars = useMemo(() => 
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 5,
    })), []
  );

  const particles = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      startY: 100 + Math.random() * 20,
      endY: -20 - Math.random() * 20,
      duration: 10 + Math.random() * 10,
      delay: Math.random() * 8,
      size: 3 + Math.random() * 5,
      horizontal: (Math.random() - 0.5) * 80,
    })), []
  );

  const shootingStars = useMemo(() =>
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 40,
      delay: Math.random() * 6 + 3,
    })), []
  );

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center text-white">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen w-full bg-transparent px-4 py-10 text-white relative overflow-hidden h-screen">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-purple-600/30 blur-[120px]"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-orange-600/25 blur-[100px]"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-[30%] left-[20%] w-[600px] h-[600px] rounded-full bg-pink-600/20 blur-[90px]"
            animate={{
              x: [0, 50, 0],
              y: [0, -80, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Animated Stars */}
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute rounded-full bg-white shadow-lg shadow-white/50"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Floating Particles */}
          {particles.map((particle) => (
            <motion.div
              key={`particle-${particle.id}`}
              className="absolute rounded-full bg-gradient-to-br from-purple-400/60 to-pink-400/60 blur-sm"
              style={{
                left: `${particle.x}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
              animate={{
                y: [`${particle.startY}vh`, `${particle.endY}vh`],
                x: [0, particle.horizontal, 0],
                opacity: [0, 0.9, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "linear",
              }}
            />
          ))}

          {/* Shooting Stars */}
          {shootingStars.map((star) => (
            <motion.div
              key={`shooting-${star.id}`}
              className="absolute h-[3px] w-[80px] bg-gradient-to-r from-transparent via-white to-transparent shadow-lg shadow-white/50"
              style={{
                left: `${star.startX}%`,
                top: `${star.startY}%`,
                transform: 'rotate(-45deg)',
              }}
              animate={{
                x: [0, -400],
                y: [0, 400],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: star.delay,
                repeatDelay: 10,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        <div className="mx-auto flex h-full max-w-5xl flex-col items-center justify-center text-center px-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8"
          >
            <img
              src="/vibeathon_tigerswipe_logo.png"
              alt="TigerSwipe Logo"
              className="h-28 w-28 sm:h-36 sm:w-36 object-contain drop-shadow-2xl"
            />
          </motion.div>

          {/* Brand Name */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm uppercase tracking-[0.5em] text-white/70 font-semibold mb-6"
          >
            TigerSwipe
          </motion.p>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight max-w-4xl mb-8"
            style={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Tinder-style swiping for scholarships, clubs, and founder events.
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl text-slate-300/90 max-w-2xl mb-12 leading-relaxed"
          >
            One swipe is better than 10 spam emails.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SignInButton mode="modal">
              <button className="group relative rounded-full bg-white px-8 py-4 text-base font-bold text-slate-900 shadow-2xl shadow-white/20 transition-all duration-300 hover:shadow-white/30 hover:bg-slate-50 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/20 to-purple-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </SignInButton>
          </motion.div>

          {/* Optional: Feature hints */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-white/50"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Smart Gmail integration
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              AI-powered matching
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Never miss an opportunity
            </span>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <SignOutButton>
        <button className="fixed top-4 right-4 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
          Sign Out
        </button>
      </SignOutButton>
    </>
  );
};

