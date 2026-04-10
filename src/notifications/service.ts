import { Platform } from 'react-native';

import type { Reminder, ReminderType, Sound } from '../db/types';
import { AquaticSerenity, CherryBlossom, GoldenSun, JungleDeep, type ThemeName } from '../theme/colors';
import {
  DEFAULT_HYDRATION_SOUND_FILE,
  DEFAULT_NOTIFICATION_SOUND_FILE,
  getNotificationSoundFile,
} from '../sounds/catalog';
import {
  AndroidAudioContentType,
  AndroidAudioUsage,
  AndroidImportance,
  AndroidNotificationPriority,
  SchedulableTriggerInputTypes,
  cancelScheduledNotificationAsync,
  getAllScheduledNotificationsAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  scheduleNotificationAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
} from './expoNotifications';

type NotificationTheme = {
  channelId: string;
  channelName: string;
  accentColor: string;
  subtitle: string;
  defaultSoundFile: string;
};

type NotificationContext = {
  userName: string | null;
  themeName: string;
};

type MessageTokens = {
  task: string;
  category: string;
};

const REMINDER_PREFIX = 'rewind-reminder';
const HYDRATION_PREFIX = 'rewind-hydration';
const ANDROID_CHANNEL_VERSION = 'v3';

const NOTIFICATION_THEMES: Record<ThemeName, NotificationTheme> = {
  cherry_blossom: {
    channelId: 'rewind-sakura',
    channelName: 'Rewind Sakura Reminders',
    accentColor: CherryBlossom.primary,
    subtitle: 'Sakura reminder',
    defaultSoundFile: DEFAULT_NOTIFICATION_SOUND_FILE,
  },
  aquatic_serenity: {
    channelId: 'rewind-aquatic',
    channelName: 'Rewind Aquatic Reminders',
    accentColor: AquaticSerenity.primary,
    subtitle: 'Aquatic reminder',
    defaultSoundFile: DEFAULT_NOTIFICATION_SOUND_FILE,
  },
  jungle_deep: {
    channelId: 'rewind-jungle',
    channelName: 'Rewind Jungle Reminders',
    accentColor: JungleDeep.primary,
    subtitle: 'Jungle reminder',
    defaultSoundFile: DEFAULT_NOTIFICATION_SOUND_FILE,
  },
  golden_sun: {
    channelId: 'rewind-golden',
    channelName: 'Rewind Golden Reminders',
    accentColor: GoldenSun.primary,
    subtitle: 'Golden reminder',
    defaultSoundFile: DEFAULT_NOTIFICATION_SOUND_FILE,
  },
};

const MEDICINE_MESSAGES = [
  'Pill yeah, {task} is due.',
  '{category} is calling. Time to dose and dash.',
  'Stay on the mend with {task}.',
  'Your daily dose of remembering has arrived: {task}.',
  'Good habits are the best medicine, and {task} is first up.',
  'No prescription for procrastination today. {task} is waiting.',
  'Keep the cure-rent going with {task}.',
  '{task} is on the clock, and your routine is in good hands.',
  'One small tablet for you, one giant step for consistency.',
  '{category} just bumped itself to the top of the chart.',
  'Time to capsule the moment with {task}.',
  'Your health plot twist is simple: remember {task}.',
  '{task} is ready when you are. Let the healing arc continue.',
];

const FOOD_MESSAGES = [
  'Lettuce make time for {task}.',
  'Your plate date with {category} is here.',
  '{task} is served. Forks up.',
  'Time to taco this reminder seriously: {task}.',
  '{category} is the main course right now.',
  'Do not go bacon my heart, make time for {task}.',
  'A well-fed plan starts with {task}.',
  'This is your sign to keep {category} on the menu.',
  '{task} is simmering nicely on today’s schedule.',
  'You bring the appetite, {category} brings the energy.',
  'Snack to basics: {task}.',
  'Your future self ordered one thing: {category}.',
  'Meal-ody of the day: {task}.',
];

const EXERCISE_MESSAGES = [
  'No ifs, ands, or butts, {task} is up.',
  'Time to put the move in movement with {task}.',
  '{category} is flexing for your attention.',
  'Rep to it: {task}.',
  'Your routine is stretching the truth if {task} gets skipped.',
  'Sweat now, smug later. {task} is waiting.',
  'Today called, it wants {category}.',
  'Keep the momentum muscle strong with {task}.',
  'This is your cue to make a move on {task}.',
  'You are one step away from checking off {category}.',
  'Your schedule just did a warm-up for {task}.',
  'Move over excuses, {task} is taking the floor.',
];

const HYDRATION_MESSAGES = [
  'Sip happens. Time for water.',
  'Water you waiting for? Your next glass is ready.',
  'Pour decisions can wait, but water should not.',
  'Take a sip and let the day flow better.',
  'Current objective: refill and refresh.',
  'This reminder comes with a splash of good sense.',
  'Your glass would love a little attention.',
  'Hydration station is now boarding.',
  'Make waves with a quick sip.',
  'The tea is this: water still wins.',
  'One glass closer to feeling better.',
  'Drip by drip, the good habits stick.',
];

const GENERIC_MESSAGES = [
  '{task} is waiting for a quick check-in.',
  'A gentle nudge for {task}.',
  'Time to circle back to {task}.',
  '{task} is ready when you are.',
  'Consistency looks a lot like {task}.',
  'Small step, big win: {task}.',
];

let hasConfiguredNotifications = false;

function isNotificationPlatform() {
  return Platform.OS !== 'web';
}

function getNotificationTheme(themeName: string): NotificationTheme {
  return NOTIFICATION_THEMES[(themeName as ThemeName) ?? 'cherry_blossom'] ?? NOTIFICATION_THEMES.cherry_blossom;
}

function hashSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function pickMessage(pool: string[], seed: string, tokens: MessageTokens) {
  const template = pool[hashSeed(seed) % pool.length] ?? pool[0];
  return template
    .replaceAll('{task}', tokens.task)
    .replaceAll('{category}', tokens.category);
}

function reminderTaskLabel(reminder: Reminder) {
  return reminder.name.trim() || reminder.icon || 'your reminder';
}

function reminderCategoryLabel(reminder: Reminder) {
  switch (reminder.type) {
    case 'medicine':
      return 'your medicines';
    case 'food':
      return 'your meal';
    case 'water':
      return 'your workout';
    default:
      return reminderTaskLabel(reminder);
  }
}

function reminderMessagePool(type: ReminderType) {
  switch (type) {
    case 'medicine':
      return MEDICINE_MESSAGES;
    case 'food':
      return FOOD_MESSAGES;
    case 'water':
      return EXERCISE_MESSAGES;
    default:
      return GENERIC_MESSAGES;
  }
}

function fallbackReminderTitle(reminder: Reminder) {
  switch (reminder.type) {
    case 'medicine':
      return 'Pill check';
    case 'food':
      return 'Plate date';
    case 'water':
      return 'Move break';
    default:
      return 'Gentle reminder';
  }
}

function resolveReminderTitle(reminder: Reminder) {
  return reminder.name.trim() || fallbackReminderTitle(reminder);
}

function resolveReminderBody(reminder: Reminder, deliveryDate: Date) {
  const customDescription = reminder.description?.trim();
  if (customDescription) {
    return customDescription;
  }

  return pickMessage(reminderMessagePool(reminder.type), `${reminder.id}:${deliveryDate.getTime()}:${reminder.updated_at}`, {
    task: reminderTaskLabel(reminder),
    category: reminderCategoryLabel(reminder),
  });
}

function buildReminderContent(
  reminder: Reminder,
  deliveryDate: Date,
  sound: Sound | null,
  context: NotificationContext
) {
  const theme = getNotificationTheme(context.themeName);
  const soundFile = getNotificationSoundFile(sound);

  return {
    title: resolveReminderTitle(reminder),
    subtitle: theme.subtitle,
    body: resolveReminderBody(reminder, deliveryDate),
    sound: soundFile,
    color: theme.accentColor,
    priority: AndroidNotificationPriority.HIGH,
    data: {
      kind: 'reminder',
      reminderId: reminder.id,
      reminderType: reminder.type,
      themeName: context.themeName,
      soundFile,
    },
  };
}

function buildHydrationContent(seconds: number, context: NotificationContext, soundFile: string) {
  const theme = getNotificationTheme(context.themeName);

  return {
    title: 'Water break',
    subtitle: theme.subtitle,
    body: pickMessage(HYDRATION_MESSAGES, `hydration:${seconds}:${Date.now()}`, {
      task: 'your glass of water',
      category: 'your water break',
    }),
    sound: soundFile,
    color: theme.accentColor,
    priority: AndroidNotificationPriority.HIGH,
    data: {
      kind: 'hydration',
      themeName: context.themeName,
      soundFile,
    },
  };
}

function buildNotificationDate(date: Date, hour: number, minute: number) {
  const nextDate = new Date(date);
  nextDate.setHours(hour, minute, 0, 0);
  return nextDate;
}

function parseDateString(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function lastDayOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function buildUpcomingReminderDates(reminder: Reminder, now = new Date(), limit?: number) {
  let resolvedLimit = limit ?? 12;
  if (reminder.frequency === 'daily') {
    resolvedLimit = 90;
  } else if (reminder.frequency === 'weekly') {
    resolvedLimit = 52;
  } else if (reminder.frequency === 'monthly') {
    resolvedLimit = 24;
  } else if (reminder.frequency === 'custom_interval' && reminder.interval_unit === 'day') {
    resolvedLimit = 90;
  } else if (reminder.frequency === 'custom_interval' && reminder.interval_unit === 'month') {
    resolvedLimit = 24;
  }

  if (reminder.is_active !== 1) {
    return [];
  }

  if (reminder.frequency === 'once') {
    if (!reminder.once_date) {
      return [];
    }

    const onceDate = buildNotificationDate(
      parseDateString(reminder.once_date),
      reminder.time_hour,
      reminder.time_minute
    );
    return onceDate.getTime() > now.getTime() ? [onceDate] : [];
  }

  if (reminder.frequency === 'monthly') {
    if (reminder.day_of_month == null) {
      return [];
    }

    const dates: Date[] = [];
    let year = now.getFullYear();
    let monthIndex = now.getMonth();

    while (dates.length < resolvedLimit) {
      const day = Math.min(reminder.day_of_month, lastDayOfMonth(year, monthIndex));
      const candidate = new Date(year, monthIndex, day, reminder.time_hour, reminder.time_minute, 0, 0);
      if (candidate.getTime() > now.getTime()) {
        dates.push(candidate);
      }

      monthIndex += 1;
      if (monthIndex > 11) {
        monthIndex = 0;
        year += 1;
      }
    }

    return dates;
  }

  if (reminder.frequency === 'custom_interval') {
    if (!reminder.interval_value || !reminder.interval_unit) {
      return [];
    }

    const start = new Date(reminder.created_at.replace(' ', 'T'));

    if (reminder.interval_unit === 'day') {
      const dates: Date[] = [];
      const cursor = new Date(start);
      cursor.setHours(reminder.time_hour, reminder.time_minute, 0, 0);

      while (dates.length < resolvedLimit) {
        if (cursor.getTime() > now.getTime()) {
          dates.push(new Date(cursor));
        }

        cursor.setDate(cursor.getDate() + reminder.interval_value);
      }

      return dates;
    }

    const intervalDay = reminder.day_of_month ?? start.getDate();
    const dates: Date[] = [];
    let year = start.getFullYear();
    let monthIndex = start.getMonth();

    while (dates.length < resolvedLimit) {
      const day = Math.min(intervalDay, lastDayOfMonth(year, monthIndex));
      const candidate = new Date(year, monthIndex, day, reminder.time_hour, reminder.time_minute, 0, 0);
      if (candidate.getTime() > now.getTime()) {
        dates.push(candidate);
      }

      monthIndex += reminder.interval_value;
      while (monthIndex > 11) {
        monthIndex -= 12;
        year += 1;
      }
    }

    return dates;
  }

  if (reminder.frequency === 'weekly' && reminder.day_of_week == null) {
    return [];
  }

  const dates: Date[] = [];
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  while (dates.length < resolvedLimit) {
    const candidate = buildNotificationDate(cursor, reminder.time_hour, reminder.time_minute);
    const dueToday =
      reminder.frequency === 'daily' ||
      (reminder.frequency === 'weekly' && reminder.day_of_week === cursor.getDay());

    if (dueToday && candidate.getTime() > now.getTime()) {
      dates.push(candidate);
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

async function cancelNotificationsWithPrefix(prefix: string) {
  if (!isNotificationPlatform()) {
    return;
  }

  const scheduled = await getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((request) => request.identifier.startsWith(prefix))
      .map((request) => cancelScheduledNotificationAsync(request.identifier))
  );
}

function buildChannelId(themeName: string, soundFile: string) {
  const theme = getNotificationTheme(themeName);
  return `${theme.channelId}-${ANDROID_CHANNEL_VERSION}-${soundFile
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()}`;
}

function buildChannelName(themeName: string, soundFile: string) {
  const theme = getNotificationTheme(themeName);
  const label = soundFile
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
  return `${theme.channelName} · ${label}`;
}

async function configureNotificationChannelsAsync(
  themeName: string,
  sounds: Sound[] = [],
  extraSoundFiles: string[] = []
) {
  if (Platform.OS !== 'android') {
    return;
  }

  const theme = getNotificationTheme(themeName);
  const soundFiles = new Set<string>([theme.defaultSoundFile, DEFAULT_HYDRATION_SOUND_FILE]);

  for (const sound of sounds) {
    soundFiles.add(getNotificationSoundFile(sound));
  }

  for (const soundFile of extraSoundFiles) {
    soundFiles.add(soundFile);
  }

  await Promise.all(
    Array.from(soundFiles).map((soundFile) =>
      setNotificationChannelAsync(buildChannelId(themeName, soundFile), {
        name: buildChannelName(themeName, soundFile),
        importance: AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 200, 250],
        lightColor: theme.accentColor,
        sound: soundFile,
        audioAttributes: {
          usage: AndroidAudioUsage.NOTIFICATION,
          contentType: AndroidAudioContentType.SONIFICATION,
        },
      })
    )
  );
}

export async function initializeNotificationsAsync(
  themeName: string,
  sounds: Sound[] = [],
  extraSoundFiles: string[] = []
) {
  if (!isNotificationPlatform()) {
    return false;
  }

  if (!hasConfiguredNotifications) {
    setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    hasConfiguredNotifications = true;
  }

  await configureNotificationChannelsAsync(themeName, sounds, extraSoundFiles);

  const permissions = await getPermissionsAsync();
  if (permissions.granted) {
    return true;
  }

  const requested = await requestPermissionsAsync();
  return requested.granted;
}

export async function syncReminderNotificationsAsync(
  reminders: Reminder[],
  sounds: Sound[],
  context: NotificationContext
) {
  if (!isNotificationPlatform()) {
    return;
  }

  const soundMap = new Map(sounds.map((sound) => [sound.id, sound]));
  const hasPermission = await initializeNotificationsAsync(context.themeName, sounds);
  if (!hasPermission) {
    return;
  }

  await cancelNotificationsWithPrefix(REMINDER_PREFIX);

  for (const reminder of reminders) {
    const reminderSound = reminder.sound_id ? soundMap.get(reminder.sound_id) ?? null : null;
    const soundFile = getNotificationSoundFile(reminderSound);
    const upcomingDates = buildUpcomingReminderDates(reminder);

    for (const deliveryDate of upcomingDates) {
      await scheduleNotificationAsync({
        identifier: `${REMINDER_PREFIX}:${reminder.id}:${deliveryDate.getTime()}`,
        content: buildReminderContent(reminder, deliveryDate, reminderSound, context),
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: deliveryDate,
          channelId: buildChannelId(context.themeName, soundFile),
        },
      });
    }
  }
}

export async function cancelReminderNotificationsAsync() {
  await cancelNotificationsWithPrefix(REMINDER_PREFIX);
}

export async function scheduleHydrationNotificationAsync(
  seconds: number,
  context: NotificationContext,
  repeats = true,
  soundFileOverride?: string
) {
  if (!isNotificationPlatform()) {
    return;
  }

  const theme = getNotificationTheme(context.themeName);
  const soundFile = soundFileOverride || DEFAULT_HYDRATION_SOUND_FILE || theme.defaultSoundFile;
  const canRepeat = !(Platform.OS === 'ios' && seconds < 60) && repeats;
  const hasPermission = await initializeNotificationsAsync(context.themeName, [], [soundFile]);
  if (!hasPermission) {
    return;
  }

  await cancelNotificationsWithPrefix(HYDRATION_PREFIX);

  await scheduleNotificationAsync({
    identifier: `${HYDRATION_PREFIX}:active`,
    content: buildHydrationContent(seconds, context, soundFile),
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: canRepeat,
      channelId: buildChannelId(context.themeName, soundFile),
    },
  });
}

export async function cancelHydrationNotificationsAsync() {
  await cancelNotificationsWithPrefix(HYDRATION_PREFIX);
}
