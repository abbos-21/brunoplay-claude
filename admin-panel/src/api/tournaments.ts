import client from './client';
import type { Tournament } from '../types';

export const listTournaments = () =>
  client.get<{ data: Tournament[] }>('/admin/tournaments').then((r) => r.data.data);

export const createTournament = (data: Partial<Tournament>) =>
  client.post('/admin/tournaments', data).then((r) => r.data);

export const updateTournament = (id: number, data: Partial<Tournament>) =>
  client.put(`/admin/tournaments/${id}`, data).then((r) => r.data);

export const deleteTournament = (id: number) =>
  client.delete(`/admin/tournaments/${id}`).then((r) => r.data);

export const finalizeTournament = (id: number) =>
  client.post(`/admin/tournaments/${id}/finalize`).then((r) => r.data);
