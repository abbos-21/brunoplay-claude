import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Task } from '@/types';
import * as tasksApi from '@/api/tasks';
import { useAuthStore } from './auth';

export const useTasksStore = defineStore('tasks', () => {
  const mainTasks = ref<Task[]>([]);
  const otherTasks = ref<Task[]>([]);
  const isLoading = ref(false);

  async function fetchTasks() {
    const data = await tasksApi.getTasks();
    mainTasks.value = data.main;
    otherTasks.value = data.other;
  }

  async function checkTask(taskId: number) {
    isLoading.value = true;
    try {
      const result = await tasksApi.checkTask(taskId);
      if (result.completed) {
        const auth = useAuthStore();
        await auth.fetchUser();
      }
      await fetchTasks();
      return result;
    } finally {
      isLoading.value = false;
    }
  }

  return { mainTasks, otherTasks, isLoading, fetchTasks, checkTask };
});
