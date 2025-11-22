import axios from 'axios';
import type { ApplyResponse, EventCard, FilterOption } from '../types';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'X-TigerSwipe-App': import.meta.env.VITE_APP_NAME ?? 'TigerSwipe',
  },
});

export const fetchCards = async (filter?: FilterOption, token?: string | null): Promise<EventCard[]> => {
  const params = filter && filter !== 'all' ? { type: filter } : undefined;
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const { data } = await apiClient.get<{ data: EventCard[] }>('/api/cards', { params, headers });
  return data.data;
};

export const markApplied = async (id: string, token?: string | null): Promise<ApplyResponse> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const { data } = await apiClient.post<ApplyResponse>(
    `/api/cards/${id}/apply`,
    {
      status: 'applied',
    },
    { headers },
  );
  return data;
};
