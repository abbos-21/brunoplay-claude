import client from './client';
import type { FriendsStats, ReferralInfo, RewardTier, PaginatedResponse } from '@/types';

export function getInviteLink() {
  return client.get<{ link: string }>('/friends/invite-link').then((r) => r.data.link);
}

export function getFriendsStats() {
  return client.get<FriendsStats>('/friends/stats').then((r) => r.data);
}

export function getFriendsList(page = 1) {
  return client.get<PaginatedResponse<ReferralInfo>>('/friends/list', { params: { page } }).then((r) => r.data);
}

export function getRewardDetails() {
  return client.get<{ rewards: RewardTier[] }>('/friends/reward-details').then((r) => r.data.rewards);
}
