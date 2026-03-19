import { onMounted, onUnmounted } from 'vue';

/** Poll a function at a given interval */
export function usePolling(fn: () => void | Promise<void>, intervalMs = 5000) {
  let timer: ReturnType<typeof setInterval> | null = null;

  function start() {
    stop();
    fn();
    timer = setInterval(fn, intervalMs);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  onMounted(start);
  onUnmounted(stop);

  return { start, stop };
}
