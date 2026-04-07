import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import type { CompletionLog, Points } from '../db/types';
import { formatDateKey } from '../db/types';
import { readJson } from '../web/storage';

export interface WeekDaySummary {
  key: string;
  label: string;
  date: string;
  completed: boolean;
  pointsEarned: number;
  completionsCount: number;
  isToday: boolean;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const COMPLETIONS_KEY = 'rewind_web_completions';
const POINTS_KEY = 'rewind_web_points';

const EMPTY_POINTS: Points = {
  id: 1,
  total_points: 0,
  current_streak: 0,
  best_streak: 0,
  last_active_date: null,
};

function getStartOfWeek(referenceDate: Date) {
  const start = new Date(referenceDate);
  const day = start.getDay();
  const distanceFromMonday = day === 0 ? 6 : day - 1;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - distanceFromMonday);
  return start;
}

function buildWeekSummary(completions: CompletionLog[], referenceDate: Date): WeekDaySummary[] {
  const weekStart = getStartOfWeek(referenceDate);
  const today = formatDateKey(referenceDate);

  return DAY_LABELS.map((label, index) => {
    const current = new Date(weekStart);
    current.setDate(weekStart.getDate() + index);
    const currentDate = formatDateKey(current);
    const dayCompletions = completions.filter(
      (completion) => completion.completed_at.slice(0, 10) === currentDate
    );

    return {
      key: `${currentDate}-${label}`,
      label,
      date: currentDate,
      completed: dayCompletions.length > 0,
      pointsEarned: dayCompletions.reduce((sum, completion) => sum + completion.points_earned, 0),
      completionsCount: dayCompletions.length,
      isToday: currentDate === today,
    };
  });
}

export function usePoints() {
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState<Points>(EMPTY_POINTS);
  const [weekSummary, setWeekSummary] = useState<WeekDaySummary[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const now = new Date();
      const weekStart = getStartOfWeek(now);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const completions = readJson<CompletionLog[]>(COMPLETIONS_KEY, []);
      const pointsSnapshot = readJson<Points>(POINTS_KEY, EMPTY_POINTS);
      const weekStartKey = formatDateKey(weekStart);
      const weekEndKey = formatDateKey(weekEnd);
      const weekCompletions = completions.filter((completion) => {
        const date = completion.completed_at.slice(0, 10);
        return date >= weekStartKey && date <= weekEndKey;
      });

      setPoints(pointsSnapshot);
      setWeekSummary(buildWeekSummary(weekCompletions, now));
    } catch (error) {
      console.error('Failed to load web points data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return {
    loading,
    points,
    refresh,
    weekSummary,
  };
}
