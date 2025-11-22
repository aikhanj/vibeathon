import fs from 'node:fs';
import path from 'node:path';
import { NormalizedEmail } from './types';

const DEFAULT_DATA_PATH = 'data/mockEmails.json';
let cachedEmails: NormalizedEmail[] | null = null;

interface RawEmail {
  id?: string;
  from?: string;
  subject?: string;
  body?: string;
  receivedAt?: string;
}

const extractLinks = (body: string): string[] => {
  const matches = body.match(/https?:\/\/[^\s)]+/gi);
  return matches ? matches.map((link) => link.trim()) : [];
};

export const loadMockEmails = (): NormalizedEmail[] => {
  if (cachedEmails) {
    return cachedEmails;
  }

  const filePath = process.env.MOCK_EMAIL_PATH
    ? path.resolve(process.cwd(), process.env.MOCK_EMAIL_PATH)
    : path.resolve(process.cwd(), DEFAULT_DATA_PATH);

  const buffer = fs.readFileSync(filePath, 'utf-8');
  const rawItems = JSON.parse(buffer) as RawEmail[];

  cachedEmails = rawItems.map((item, index) => ({
    id: item.id ?? `mock-${index}`,
    from: item.from ?? 'Unknown Sender',
    subject: item.subject ?? 'Untitled',
    body: item.body ?? '',
    receivedAt: item.receivedAt ?? new Date().toISOString(),
    links: extractLinks(item.body ?? ''),
  }));

  return cachedEmails;
};
