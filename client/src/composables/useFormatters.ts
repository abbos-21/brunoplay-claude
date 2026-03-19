/** Number & date formatting utilities */
export function useFormatters() {
  function formatCoins(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return Math.floor(value).toLocaleString();
  }

  function formatNumber(value: number): string {
    return value.toLocaleString();
  }

  function formatStars(value: number): string {
    return value.toLocaleString();
  }

  function formatTon(value: number, decimals = 4): string {
    return value.toFixed(decimals);
  }

  function formatRate(value: number): string {
    return `${value.toFixed(4)}/s`;
  }

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  function formatDateTime(date: string): string {
    return new Date(date).toLocaleString();
  }

  function formatTimeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return { formatCoins, formatNumber, formatStars, formatTon, formatRate, formatDate, formatDateTime, formatTimeAgo };
}
