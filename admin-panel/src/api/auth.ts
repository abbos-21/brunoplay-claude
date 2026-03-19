import client from './client';
import type { Admin, LoginResponse } from '../types';

export const login = (username: string, password: string) =>
  client.post<LoginResponse>('/admin/auth/login', { username, password }).then((r) => r.data);

export const getMe = () =>
  client.get<{ admin: Admin }>('/admin/auth/me').then((r) => r.data.admin);

export const changePassword = (currentPassword: string, newPassword: string) =>
  client.put('/admin/auth/change-password', { currentPassword, newPassword }).then((r) => r.data);

export const registerAdmin = (username: string, password: string, role: string) =>
  client.post('/admin/auth/register', { username, password, role }).then((r) => r.data);
