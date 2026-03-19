// Minimal Telegram WebApp type declarations
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    start_param?: string;
    user?: { id: number; username?: string; first_name?: string };
  };
  ready(): void;
  expand(): void;
  close(): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  openTelegramLink(url: string): void;
  openLink(url: string): void;
  HapticFeedback: {
    impactOccurred(style: string): void;
    notificationOccurred(type: string): void;
    selectionChanged(): void;
  };
}

/**
 * Synchronous access to the Telegram WebApp global object.
 * Returns null when not running inside Telegram.
 */
export function getTelegram(): TelegramWebApp | null {
  return ((window as any).Telegram?.WebApp as TelegramWebApp) ?? null;
}

/**
 * Initialize Telegram WebApp: signal readiness, expand the viewport,
 * apply theme colors. Call once at app startup.
 */
export function initTelegram(): TelegramWebApp | null {
  const tg = getTelegram();
  if (!tg) return null;

  tg.ready();
  tg.expand();

  return tg;
}

/**
 * Get the raw initData string Telegram passes to the Mini App.
 * Empty string if not inside Telegram.
 */
export function getTelegramInitData(): string {
  return getTelegram()?.initData ?? '';
}

/**
 * Get the start_param from the bot link (e.g. ref code).
 * Telegram encodes it as ?startapp=<value> → available as start_param.
 */
export function getTelegramStartParam(): string {
  return getTelegram()?.initDataUnsafe?.start_param ?? '';
}

/** Vue composable for in-component Telegram utilities */
export function useTelegram() {
  const tg = getTelegram();

  function haptic(type: 'impact' | 'notification' | 'selection' = 'impact') {
    const hf = tg?.HapticFeedback;
    if (!hf) return;
    if (type === 'impact') hf.impactOccurred('medium');
    else if (type === 'notification') hf.notificationOccurred('success');
    else hf.selectionChanged();
  }

  function close() {
    tg?.close();
  }

  function shareUrl(url: string, text?: string) {
    tg?.openTelegramLink(
      `https://t.me/share/url?url=${encodeURIComponent(url)}${text ? '&text=' + encodeURIComponent(text) : ''}`,
    );
  }

  function openLink(url: string) {
    tg?.openLink(url);
  }

  return { webApp: tg, haptic, close, shareUrl, openLink };
}
