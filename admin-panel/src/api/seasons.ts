import client from './client';
import type { Season } from '../types';

export const listSeasons = () =>
  client.get<{ data: Season[] }>('/admin/seasons').then((r) => r.data.data);

export const createSeason = (data: Partial<Season>) =>
  client.post('/admin/seasons', data).then((r) => r.data);

export const updateSeason = (id: number, data: Partial<Season>) =>
  client.put(`/admin/seasons/${id}`, data).then((r) => r.data);

export const deleteSeason = (id: number) =>
  client.delete(`/admin/seasons/${id}`).then((r) => r.data);
