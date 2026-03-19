import client from './client';
import type { User, AppInfo } from '@/types';

export function getMe() {
  return client.get<{ user: User }>('/user/me').then((r) => r.data.user);
}

export function updateSettings(data: { language?: string }) {
  return client.put('/user/settings', data).then((r) => r.data);
}

export function getAppInfo() {
  return client.get<AppInfo>('/user/app-info').then((r) => r.data);
}
