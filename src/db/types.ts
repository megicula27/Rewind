/**
 * Rewind — Database Entity Types
 * 
 * TypeScript interfaces for all SQLite tables.
 * Updated for Phase 2: added `description`, `weekly` frequency, `day_of_week`.
 */

// ── Reminder ───────────────────────────────────────
export type ReminderType = 'medicine' | 'food' | 'water' | 'custom';
export type ReminderFrequency = 'daily' | 'weekly' | 'monthly' | 'once';

export interface Reminder {
  id: number;
  name: string;
  description: string | null;
  type: ReminderType;
  icon: string;
  frequency: ReminderFrequency;
  time_hour: number;
  time_minute: number;
  day_of_week: number | null;   // 0=Sun, 1=Mon ... 6=Sat (for weekly)
  day_of_month: number | null;  // 1–31 (for monthly)
  once_date: string | null;
  sound_id: number | null;
  is_active: number;            // 0 | 1 (SQLite boolean)
  created_at: string;
  updated_at: string;
}

export interface CreateReminderInput {
  name: string;
  description?: string;
  type: ReminderType;
  icon: string;
  frequency: ReminderFrequency;
  time_hour: number;
  time_minute: number;
  day_of_week?: number;
  day_of_month?: number;
  once_date?: string;
  sound_id?: number;
}

// ── Completion Log ─────────────────────────────────
export interface CompletionLog {
  id: number;
  reminder_id: number;
  completed_at: string;
  dial_value: number;       // 0–10
  points_earned: number;
}

// ── Points ─────────────────────────────────────────
export interface Points {
  id: number;
  total_points: number;
  current_streak: number;
  best_streak: number;
  last_active_date: string | null;
}

// ── Sound ──────────────────────────────────────────
export type SoundType = 'default' | 'recorded' | 'file';

export interface Sound {
  id: number;
  name: string;
  type: SoundType;
  file_uri: string;
  duration_ms: number | null;
  created_at: string;
}

// ── Hydration ──────────────────────────────────────
export interface HydrationLog {
  id: number;
  logged_at: string;
  glasses: number;
}

// ── Enriched UI Types ──────────────────────────────
export interface ReminderWithStatus extends Reminder {
  todayCompletion: CompletionLog | null;
}

// ── Helper: format time for display ────────────────
export function formatReminderTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m} ${period}`;
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTimeKey(date: Date): string {
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  const seconds = `${date.getSeconds()}`.padStart(2, '0');
  return `${formatDateKey(date)} ${hours}:${minutes}:${seconds}`;
}

// ── Helper: get day label for weekly ───────────────
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getDayName(dayOfWeek: number, short = false): string {
  return short ? DAY_NAMES_SHORT[dayOfWeek] : DAY_NAMES[dayOfWeek];
}

export function formatReminderDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

// ── Helper: build time label for home screen ───────
export function buildTimeLabel(reminder: Reminder, completion: CompletionLog | null): string {
  const time = formatReminderTime(reminder.time_hour, reminder.time_minute);
  
  if (completion) {
    return `Completed at ${time}`;
  }

  if (reminder.frequency === 'once' && reminder.once_date) {
    return `Scheduled for ${time} · ${formatReminderDate(reminder.once_date)}`;
  }
  
  let freq = '';
  if (reminder.frequency === 'weekly' && reminder.day_of_week !== null) {
    freq = ` · Every ${getDayName(reminder.day_of_week, true)}`;
  } else if (reminder.frequency === 'monthly' && reminder.day_of_month !== null) {
    freq = ` · Day ${reminder.day_of_month}`;
  }
  
  return `Scheduled for ${time}${freq}`;
}
