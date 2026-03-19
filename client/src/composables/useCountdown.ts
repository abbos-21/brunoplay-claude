import { ref, onUnmounted, watch } from 'vue';

/** Countdown timer that ticks every second */
export function useCountdown(targetDate: () => string | null | undefined) {
  const remaining = ref(0);
  const formatted = ref('00:00:00');
  let timer: ReturnType<typeof setInterval> | null = null;

  function update() {
    const target = targetDate();
    if (!target) {
      remaining.value = 0;
      formatted.value = '00:00:00';
      return;
    }
    const diff = Math.max(0, new Date(target).getTime() - Date.now());
    remaining.value = diff;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    formatted.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function start() {
    stop();
    update();
    timer = setInterval(update, 1000);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  watch(targetDate, (val) => {
    if (val) start();
    else stop();
  }, { immediate: true });

  onUnmounted(stop);

  return { remaining, formatted, start, stop };
}
