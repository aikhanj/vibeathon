import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ClubApplicationPage = () => {
  return (
    <div className="min-h-screen w-full bg-transparent px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/app"
            className="text-sm text-white/60 hover:text-white/80 transition flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to TigerSwipe
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-8"
        >
          <h1 className="text-2xl font-bold mb-2">Club Application</h1>
          <p className="text-slate-400 mb-8">Complete the form below to apply for membership.</p>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="your.email@princeton.edu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Class Year
              </label>
              <select className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="" className="bg-slate-900">Select your class year</option>
                <option value="2025" className="bg-slate-900">2025</option>
                <option value="2026" className="bg-slate-900">2026</option>
                <option value="2027" className="bg-slate-900">2027</option>
                <option value="2028" className="bg-slate-900">2028</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Why do you want to join this club?
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                placeholder="Tell us about your interest in this club..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Relevant Experience (Optional)
              </label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                placeholder="Any relevant experience or skills..."
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/40 transition hover:bg-brand-600"
              >
                Submit Application
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ClubApplicationPage;
