/**
 * Format milliseconds into a human-readable duration string.
 * e.g., 1234 -> "1.2s", 56789 -> "56.8s", 500 -> "0.5s"
 */
export function formatDuration(ms) {
  if (ms == null) return null;
  const seconds = ms / 1000;
  if (seconds < 10) return `${seconds.toFixed(1)}s`;
  return `${Math.round(seconds)}s`;
}
