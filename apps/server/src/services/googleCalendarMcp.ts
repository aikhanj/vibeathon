export interface GoogleCalendarPayload {
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
}

export const createCalendarEvent = async (
  payload: GoogleCalendarPayload,
): Promise<string> => {
  const baseUrl = process.env.MCP_CALENDAR_URL;
  if (!baseUrl) {
    // eslint-disable-next-line no-console
    console.warn('MCP_CALENDAR_URL not set; returning mock event id');
    return `mock-event-${Date.now()}`;
  }

  const url = `${baseUrl.replace(/\/$/, '')}/events`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (process.env.MCP_CALENDAR_API_KEY) {
    headers.Authorization = `Bearer ${process.env.MCP_CALENDAR_API_KEY}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to create calendar event: ${response.status} ${message}`);
  }

  const json = (await response.json()) as { id?: string; eventId?: string };
  return json.id ?? json.eventId ?? 'mock-event';
};
