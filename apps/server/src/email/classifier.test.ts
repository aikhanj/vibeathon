import { describe, expect, it } from 'vitest';
import { buildCardFromEmail } from './classifier';
import type { NormalizedEmail } from './types';

const baseEmail: NormalizedEmail = {
  id: 'test-1',
  from: 'Test Org <team@test.org>',
  subject: 'Future Founders Summit invite',
  body: 'Join us for the Founders Summit on March 20 in Miami. Apply at https://test.org/apply',
  receivedAt: '2025-01-02T12:00:00.000Z',
  links: ['https://test.org/apply'],
};

describe('buildCardFromEmail', () => {
  it('classifies events with metadata', async () => {
    const card = await buildCardFromEmail(baseEmail);
    expect(card.type).toBe('event');
    expect(card.eventDate).toContain('March');
    expect(card.location).toBe('Miami');
    expect(card.applyLink).toContain('test.org');
  });

  it('falls back to redirect when link missing', async () => {
    const withoutLink: NormalizedEmail = { ...baseEmail, id: 'test-2', links: [], body: 'Club meetup each week' };
    const card = await buildCardFromEmail(withoutLink);
    expect(card.applyLink).toContain('tigerswipe');
  });
});
