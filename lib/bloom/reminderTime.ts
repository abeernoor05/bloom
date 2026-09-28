export interface ParsedReminderTime {
  hour: number;
  minute: number;
  label: string;
}

const TWELVE_HOUR_TIME = /^\s*(\d{1,2}):(\d{2})\s*([AaPp][Mm])\s*$/;

export function parseReminderTime(value: string): ParsedReminderTime | undefined {
  const match = TWELVE_HOUR_TIME.exec(value);
  if (!match) return undefined;

  const hour12 = Number(match[1]);
  const minute = Number(match[2]);
  if (hour12 < 1 || hour12 > 12 || minute < 0 || minute > 59) return undefined;

  const period = match[3].toUpperCase();
  const hour = (hour12 % 12) + (period === 'PM' ? 12 : 0);
  return {
    hour,
    minute,
    label: `${hour12}:${String(minute).padStart(2, '0')} ${period}`,
  };
}

export function normalizeReminderTime(value: string): string | undefined {
  return parseReminderTime(value)?.label;
}
