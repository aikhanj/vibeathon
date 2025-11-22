import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full bg-transparent text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
            TigerSwipe
          </span>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden text-lg font-medium text-white sm:block"
          >
            Tinder-style swiping for scholarships, clubs, and founder events
          </motion.p>
          <a
            href="/swipe"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white/90"
          >
            Start Swiping
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-6 py-20">
        {/* Mobile hero text */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 text-center text-3xl font-medium text-white sm:hidden"
        >
          Tinder-style swiping for scholarships, clubs, and founder events
        </motion.h1>

        {/* Swiping Breakdown */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-20"
        >
          <h2 className="mb-8 text-3xl font-semibold text-white">Swiping Breakdown</h2>

          <div className="space-y-6">
            <div>
              <p className="text-lg text-white">
                <strong>Right = "Interested"</strong>
              </p>
              <p className="mt-1 text-slate-400">Opens application in a new tab</p>
            </div>

            <div>
              <p className="text-lg text-white">
                <strong>Left = "Not Interested"</strong>
              </p>
              <p className="mt-1 text-slate-400">Moves on to the next club</p>
            </div>

            <div>
              <p className="text-lg text-white">
                <strong>Up = "Review Later"</strong>
              </p>
              <p className="mt-1 text-slate-400">
                Moves the application to another folder and automatically displays after all other swipes
              </p>
            </div>

            <div>
              <p className="text-lg text-white">
                <strong>Undo</strong>
              </p>
              <p className="mt-1 text-slate-400">
                Appears after swiping left in case the user makes an error
              </p>
            </div>
          </div>
        </motion.section>

        {/* Email Breakdown */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <h2 className="mb-8 text-3xl font-semibold text-white">Email Breakdown</h2>

          <p className="mb-8 text-lg leading-relaxed text-slate-300">
            Takes recent emails, with the user being able to set the timeframe, and Claude runs through all of them.
            Claude classifies them as club or event related and extracts key dates such as event date or club application deadline.
          </p>

          <h3 className="mb-4 text-xl font-semibold text-white">Sidebar Organization</h3>

          <p className="mb-4 text-slate-300">
            You can see all the clubs/events you are interested in the sidebar, which is split up into <strong className="text-white">Events</strong> and <strong className="text-white">Clubs</strong>.
          </p>

          <p className="mb-4 text-slate-300">
            Inside each section, you have tabs to see the lists of:
          </p>

          <ul className="space-y-2 text-slate-300">
            <li>"Interested" clubs/events</li>
            <li>"Not Interested" clubs/events</li>
            <li>"Review Later" clubs/events</li>
          </ul>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <a
            href="/swipe"
            className="inline-block rounded-full bg-white px-8 py-3 text-lg font-semibold text-slate-900 transition hover:bg-white/90"
          >
            Start Swiping
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
