import client from './client';
import type { PaginatedResponse, User, UserAction } from '../types';

interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  isBlocked?: boolean;
  level?: number;
}

export const listUsers = (params: ListUsersParams) =>
  client.get<PaginatedResponse<User>>('/admin/users', { params }).then((r) => r.data);

export const getUser = (userId: number) =>
  client.get<{ user: User }>(`/admin/users/${userId}`).then((r) => r.data.user);

export const blockUser = (userId: number) =>
  client.post(`/admin/users/${userId}/block`).then((r) => r.data);

export const unblockUser = (userId: number) =>
  client.post(`/admin/users/${userId}/unblock`).then((r) => r.data);

export const adjustCoins = (userId: number, amount: number, reason: string) =>
  client.post(`/admin/users/${userId}/adjust-coins`, { amount, reason }).then((r) => r.data);

export const adjustStars = (userId: number, amount: number, reason: string) =>
  client.post(`/admin/users/${userId}/adjust-stars`, { amount, reason }).then((r) => r.data);

export const resetStreak = (userId: number) =>
  client.post(`/admin/users/${userId}/reset-streak`).then((r) => r.data);

export const getUserActions = (userId: number, params?: { page?: number; limit?: number }) =>
  client.get<PaginatedResponse<UserAction>>(`/admin/users/${userId}/actions`, { params }).then((r) => r.data);
