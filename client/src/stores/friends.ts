import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { FriendsStats, ReferralInfo, RewardTier } from '@/types';
import * as friendsApi from '@/api/friends';

export const useFriendsStore = defineStore('friends', () => {
  const inviteLink = ref('');
  const stats = ref<FriendsStats | null>(null);
  const friends = ref<ReferralInfo[]>([]);
  const rewardTiers = ref<RewardTier[]>([]);
  const friendsPage = ref(1);
  const friendsTotalPages = ref(1);

  async function fetchInviteLink() {
    inviteLink.value = await friendsApi.getInviteLink();
  }

  async function fetchStats() {
    stats.value = await friendsApi.getFriendsStats();
  }

  async function fetchFriends(page = 1) {
    const data = await friendsApi.getFriendsList(page);
    friends.value = data.data;
    friendsPage.value = data.page;
    friendsTotalPages.value = data.totalPages;
  }

  async function fetchRewardTiers() {
    rewardTiers.value = await friendsApi.getRewardDetails();
  }

  async function init() {
    await Promise.all([fetchInviteLink(), fetchStats(), fetchFriends(), fetchRewardTiers()]);
  }

  return { inviteLink, stats, friends, rewardTiers, friendsPage, friendsTotalPages, fetchInviteLink, fetchStats, fetchFriends, fetchRewardTiers, init };
});
