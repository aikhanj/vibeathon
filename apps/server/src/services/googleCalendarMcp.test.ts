import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GoogleCalendarPayload } from './googleCalendarMcp';
import { createCalendarEvent } from './googleCalendarMcp';

const payload: GoogleCalendarPayload = {
  title: 'Test Event',
  description: 'desc',
  start: new Date().toISOString(),
  end: new Date(Date.now() + 3600000).toISOString(),
};

describe('googleCalendarMcp', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    process.env = originalEnv;
  });

  it('returns mock event id when MCP url missing', async () => {
    delete process.env.MCP_CALENDAR_URL;
    const id = await createCalendarEvent(payload);
    expect(id).toMatch(/mock-event/);
  });

  it('invokes MCP endpoint when configured', async () => {
    process.env.MCP_CALENDAR_URL = 'https://mcp.test';
    process.env.MCP_CALENDAR_API_KEY = 'test-key';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'calendar-123' }),
      text: async () => 'ok',
    });

    vi.stubGlobal('fetch', mockFetch);

    const result = await createCalendarEvent(payload);
    expect(result).toBe('calendar-123');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://mcp.test/events',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-key' }),
      }),
    );
  });

  it('throws if MCP responds with error', async () => {
    process.env.MCP_CALENDAR_URL = 'https://mcp.test';
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'boom',
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(createCalendarEvent(payload)).rejects.toThrow('Failed to create calendar event');
  });
});
