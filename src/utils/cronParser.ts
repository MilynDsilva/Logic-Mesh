/**
 * Utility to parse standard 5-part cron syntax or human-readable schedule expressions
 * into interval duration in milliseconds.
 */
export function parseCronIntervalMs(expression: string | undefined): number {
  if (!expression || typeof expression !== 'string') return 60000;

  const clean = expression.trim().toLowerCase();

  // 1. Check for explicit 1-minute / every minute human & cron patterns
  if (
    clean === 'every minute' ||
    clean === 'every 1 minute' ||
    clean === 'every 1 min' ||
    clean === '1m' ||
    clean === '1 min' ||
    clean === '1minute' ||
    clean === '* * * * *' ||
    clean === '*/1 * * * *'
  ) {
    return 60 * 1000;
  }

  // Check "every N min / mins / minutes / m"
  const minMatch = clean.match(/every\s+(\d+)\s*(?:m|min|mins|minute|minutes)?/i) || clean.match(/^(\d+)\s*(?:m|min|mins|minute|minutes)$/i);
  if (minMatch) {
    const mins = parseInt(minMatch[1], 10);
    if (!isNaN(mins) && mins > 0) return mins * 60 * 1000;
  }

  // Check "every N sec / secs / seconds / s"
  const secMatch = clean.match(/every\s+(\d+)\s*(?:s|sec|secs|second|seconds)/i) || clean.match(/^(\d+)\s*(?:s|sec|secs|second|seconds)$/i);
  if (secMatch) {
    const secs = parseInt(secMatch[1], 10);
    if (!isNaN(secs) && secs > 0) return Math.max(secs * 1000, 5000);
  }

  // 2. Standard 5-part cron expression: "minute hour day-of-month month day-of-week"
  const parts = clean.split(/\s+/);
  if (parts.length >= 5) {
    const minPart = parts[0];

    // "* * * * *" -> every 1 min
    if (minPart === '*') {
      return 60 * 1000;
    }

    // "*/N * * * *" -> every N mins
    if (minPart.startsWith('*/')) {
      const mins = parseInt(minPart.replace('*/', ''), 10);
      if (!isNaN(mins) && mins > 0) {
        return mins * 60 * 1000;
      }
    }

    // "0 * * * *" -> every 60 mins
    if (minPart === '0') {
      return 60 * 60 * 1000;
    }

    const numMin = parseInt(minPart, 10);
    if (!isNaN(numMin) && numMin >= 0) {
      return 60 * 1000;
    }
  }

  // Default fallback if unparseable: 60 seconds (1 minute)
  return 60 * 1000;
}
