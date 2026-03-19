import client from './client';
import type { AuthResponse } from '@/types';

export function authenticate(initData: string, ref?: string) {
  return client.post<AuthResponse>('/auth', { initData, ref }).then((r) => r.data);
}
