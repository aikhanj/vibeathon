import axios from 'axios';
import type { ApplyResponse, EventCard, FilterOption } from '../types';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'X-TigerSwipe-App': import.meta.env.VITE_APP_NAME ?? 'TigerSwipe',
  },
});

export const fetchCards = async (filter?: FilterOption): Promise<EventCard[]> => {
  const params = filter && filter !== 'all' ? { type: filter } : undefined;
  const { data } = await apiClient.get<{ data: EventCard[] }>('/api/cards', { params });
  return data.data;
};

export const markApplied = async (id: string): Promise<ApplyResponse> => {
  const { data } = await apiClient.post<ApplyResponse>(`/api/cards/${id}/apply`, {
    status: 'applied',
  });
  return data;
};
