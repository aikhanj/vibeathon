import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import path from 'node:path';
import dotenv from 'dotenv';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import cardsRouter from './routes/cards';

// Load environment variables from both the repository root and the server folder
// Order matters: root .env first, then apps/server/.env to allow overrides
const repoRootEnv = path.resolve(__dirname, '../../../.env'); // CWD: apps/server/src → ../../../ → project root
dotenv.config({ path: repoRootEnv });
const serverEnv = path.resolve(__dirname, '../.env'); // apps/server/.env
dotenv.config({ path: serverEnv });

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize Clerk middleware
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY;
if (clerkSecretKey && clerkPublishableKey) {
  app.use(
    clerkMiddleware({
      secretKey: clerkSecretKey,
      publishableKey: clerkPublishableKey,
      // Don't require auth on all routes - let routes handle it individually
      onError: (err) => {
        // eslint-disable-next-line no-console
        console.error('Clerk middleware error:', err);
      },
    }),
  );
} else {
  // eslint-disable-next-line no-console
  console.warn('CLERK_SECRET_KEY or CLERK_PUBLISHABLE_KEY not set - authentication will be disabled');
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Sign out endpoint - clears any server-side session data
app.post('/api/auth/signout', ...(process.env.CLERK_SECRET_KEY ? [requireAuth()] : []), (_req, res) => {
  // Clerk handles sign out on the client side, but we can clear any server-side cache here
  // In a real app, you might want to invalidate tokens, clear sessions, etc.
  res.json({ status: 'ok', message: 'Signed out successfully' });
});

app.use('/api/cards', cardsRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: err.message });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`TigerSwipe server listening on port ${port}`);
});
