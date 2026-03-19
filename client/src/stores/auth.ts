import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';
import * as authApi from '@/api/auth';
import * as userApi from '@/api/user';
import { getTelegramInitData, getTelegramStartParam, initTelegram } from '@/composables/useTelegram';

export type AuthState = 'idle' | 'loading' | 'authenticated' | 'error';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const state = ref<AuthState>('idle');
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => state.value === 'authenticated');
  const isLoading = computed(() => state.value === 'loading');

  /**
   * Full initialization flow — call once at app startup.
   *
   * 1. Initialize Telegram WebApp SDK (ready + expand)
   * 2. If we have a stored token, try to validate it via GET /user/me
   * 3. If no token or validation fails, authenticate with Telegram initData
   * 4. If not inside Telegram, show an appropriate error
   */
  async function init(): Promise<void> {
    state.value = 'loading';
    error.value = null;

    // Step 1: Initialize Telegram WebApp
    initTelegram();

    // Step 2: If we have a stored token, try to restore the session
    if (token.value) {
      try {
        user.value = await userApi.getMe();
        state.value = 'authenticated';
        return;
      } catch {
        // Token is invalid/expired — clear it and fall through to re-auth
        token.value = null;
        user.value = null;
        localStorage.removeItem('token');
      }
    }

    // Step 3: Authenticate with Telegram initData
    const initData = getTelegramInitData();

    if (!initData) {
      state.value = 'error';
      error.value = 'Please open this app from Telegram.';
      return;
    }

    // Parse referral code from start_param (format: "ref_123" or plain number)
    const startParam = getTelegramStartParam();
    const refCode = startParam || undefined;

    try {
      const res = await authApi.authenticate(initData, refCode);
      token.value = res.token;
      user.value = res.user;
      localStorage.setItem('token', res.token);
      state.value = 'authenticated';
    } catch (e: any) {
      state.value = 'error';
      const msg = e.response?.data?.error?.message
        || e.response?.data?.message
        || e.message
        || 'Authentication failed';
      error.value = msg;
    }
  }

  /** Re-authenticate (e.g. after 401) */
  async function reAuth(): Promise<void> {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    await init();
  }

  /** Fetch fresh user data from the server */
  async function fetchUser(): Promise<void> {
    if (!token.value) return;
    try {
      user.value = await userApi.getMe();
    } catch {
      // If fetching user fails, don't wipe auth — the 401 interceptor handles that
    }
  }

  /** Merge partial updates into the user object */
  function updateUser(partial: Partial<User>): void {
    if (user.value) {
      Object.assign(user.value, partial);
    }
  }

  /** Full logout */
  function logout(): void {
    token.value = null;
    user.value = null;
    state.value = 'idle';
    error.value = null;
    localStorage.removeItem('token');
  }

  return {
    user,
    token,
    state,
    error,
    isAuthenticated,
    isLoading,
    init,
    reAuth,
    fetchUser,
    updateUser,
    logout,
  };
});
