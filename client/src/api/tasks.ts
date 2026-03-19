import client from './client';
import type { Task, TaskCheckResult } from '@/types';

export function getTasks() {
  return client.get<{ main: Task[]; other: Task[] }>('/tasks').then((r) => r.data);
}

export function checkTask(taskId: number) {
  return client.post<TaskCheckResult>(`/tasks/${taskId}/check`).then((r) => r.data);
}
