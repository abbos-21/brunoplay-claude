import client from './client';
import type { Tournament, LeaderboardResponse } from '@/types';

export function getActiveTournament() {
  return client.get<{ tournament: Tournament | null }>('/tournaments/active').then((r) => r.data.tournament);
}

export function getLeaderboard(tournamentId: number, page = 1) {
  return client.get<LeaderboardResponse>(`/tournaments/${tournamentId}/leaderboard`, { params: { page } }).then((r) => r.data);
}
