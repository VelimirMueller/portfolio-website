import { formatBerlinTime, formatBytes } from '../format';

describe('formatBytes', () => {
  it('formats through the byte units', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(2_621_440_000)).toBe('2.4 GB');
    expect(formatBytes(5_000_000_000)).toBe('4.7 GB');
    expect(formatBytes(1024 ** 5)).toBe('1 PB');
  });

  it('keeps several decimals on request', () => {
    expect(formatBytes(1_500_000, 2)).toBe('1.43 MB');
  });

  it('caps at the largest unit', () => {
    expect(formatBytes(3 * 1024 ** 5)).toBe('3 PB');
  });

  it('returns 0 B for nothing measurable', () => {
    expect(formatBytes(-1)).toBe('0 B');
    expect(formatBytes(Number.NaN)).toBe('0 B');
  });
});

describe('formatBerlinTime', () => {
  // 12:00 UTC in October is 14:00 in Berlin (CEST).
  const iso = '2026-10-10T12:00:00Z';
  const at = (hoursLater: number) => Date.parse(iso) + hoursLater * 3_600_000;

  it('says never for a missing or unparsable timestamp', () => {
    expect(formatBerlinTime(null)).toBe('never');
    expect(formatBerlinTime(undefined)).toBe('never');
    expect(formatBerlinTime('not a date')).toBe('never');
  });

  it('is relative with the Berlin clock time', () => {
    expect(formatBerlinTime(iso, at(0))).toBe('just now (14:00 Berlin)');
    expect(formatBerlinTime(iso, at(1))).toBe('1 hour ago (14:00 Berlin)');
    expect(formatBerlinTime(iso, at(3))).toBe('3 hours ago (14:00 Berlin)');
    expect(formatBerlinTime(iso, at(48))).toBe('2 days ago (14:00 Berlin)');
  });

  it('shows minutes', () => {
    expect(formatBerlinTime(iso, at(0.5))).toBe('30 minutes ago (14:00 Berlin)');
  });

  it('falls back to the date beyond two weeks', () => {
    expect(formatBerlinTime(iso, at(24 * 30))).toBe('10 Oct, 14:00 Berlin');
  });
});
