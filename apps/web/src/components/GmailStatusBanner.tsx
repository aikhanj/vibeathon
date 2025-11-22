import { useEffect, useState } from 'react';
import { checkGmailStatus, type GmailStatus } from '../api/client';
import { useAuth } from '@clerk/clerk-react';

export const GmailStatusBanner = () => {
  const { getToken } = useAuth();
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = await getToken();
        const gmailStatus = await checkGmailStatus(token);
        setStatus(gmailStatus);
        
        // Only show banner if using mock data
        if (gmailStatus.emailSource === 'mock') {
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Failed to check Gmail status:', error);
      }
    };

    fetchStatus();
  }, [getToken]);

  if (!isVisible || !status || status.emailSource === 'gmail') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
      <div className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-sm rounded-lg shadow-xl border border-amber-300/50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm mb-1">
              📝 Using Mock Data
            </h3>
            <p className="text-white/90 text-xs leading-relaxed mb-2">
              To see your real Gmail emails, you need to add the Gmail scope in Clerk Dashboard and sign in again.
            </p>
            <a
              href="https://dashboard.clerk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white underline hover:text-amber-100 transition-colors"
            >
              Open Clerk Dashboard →
            </a>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

