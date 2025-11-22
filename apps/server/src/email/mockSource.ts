import fs from 'node:fs';
import path from 'node:path';
import { NormalizedEmail } from './types';

const DEFAULT_DATA_PATH = '../../data/mockEmails.json';
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

  let filePath: string;
  if (process.env.MOCK_EMAIL_PATH) {
    filePath = path.resolve(process.cwd(), process.env.MOCK_EMAIL_PATH);
  } else {
    // Resolve from server src directory: apps/server/src -> ../../../data/mockEmails.json
    filePath = path.resolve(__dirname, '../../../data/mockEmails.json');
  }

  // Check if file exists, if not return empty array
  if (!fs.existsSync(filePath)) {
    // eslint-disable-next-line no-console
    console.warn(`[Mock] Mock emails file not found at ${filePath}, returning empty array`);
    cachedEmails = [];
    return cachedEmails;
  }

  try {
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
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[Mock] Error loading mock emails from ${filePath}:`, error);
    cachedEmails = [];
    return cachedEmails;
  }
};
