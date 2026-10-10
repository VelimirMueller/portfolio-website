const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

/** Human-readable byte sizes: 0 → "0 B", 1536 → "1.5 KB", 2621440000 → "2.4 GB". */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);
  const value = bytes / 1024 ** exp;
  const text = value
    .toFixed(exp === 0 ? 0 : decimals)
    .replace(/(\.\d*?)0+$/, '$1')
    .replace(/\.$/, '');
  return `${text} ${BYTE_UNITS[exp]}`;
}

const berlinClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Berlin',
  hour: '2-digit',
  minute: '2-digit',
});
const berlinDate = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Berlin',
  day: 'numeric',
  month: 'short',
});

/**
 * A timestamp for humans: relative ("3 hours ago") plus the Berlin clock time
 * ("14:32 Berlin") so the moment of the day is unambiguous. null → "never".
 */
export function formatBerlinTime(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return 'never';
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return 'never';
  const clock = `${berlinClock.format(then)} Berlin`;
  const seconds = Math.max(0, Math.round((now - then.getTime()) / 1000));
  if (seconds < 60) return `just now (${clock})`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago (${clock})`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago (${clock})`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days} day${days === 1 ? '' : 's'} ago (${clock})`;
  return `${berlinDate.format(then)}, ${clock}`;
}
