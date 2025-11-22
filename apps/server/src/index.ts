import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import path from 'node:path';
import dotenv from 'dotenv';
import cardsRouter from './routes/cards';

// Load .env from project root (two levels up from apps/server/src)
// This works regardless of where the process is started from
const rootEnv = path.resolve(__dirname, '../../.env');
dotenv.config({ path: rootEnv });

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
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
