import client from './client';
import type { Task } from '../types';

export const listTasks = () =>
  client.get<{ data: Task[] }>('/admin/tasks').then((r) => r.data.data);

export const createTask = (data: Partial<Task>) =>
  client.post('/admin/tasks', data).then((r) => r.data);

export const updateTask = (taskId: number, data: Partial<Task>) =>
  client.put(`/admin/tasks/${taskId}`, data).then((r) => r.data);

export const deleteTask = (taskId: number) =>
  client.delete(`/admin/tasks/${taskId}`).then((r) => r.data);
