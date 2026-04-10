import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';

import { getCompletionsForWeek } from '../db/completions';
import { getPoints, updatePoints } from '../db/points';
import { formatDateKey, type CompletionLog, type Points } from '../db/types';

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

function formatDateOnly(date: Date) {
  return formatDateKey(date);
}

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
  const today = formatDateOnly(referenceDate);

  return DAY_LABELS.map((label, index) => {
    const current = new Date(weekStart);
    current.setDate(weekStart.getDate() + index);
    const currentDate = formatDateOnly(current);
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

const EMPTY_POINTS: Points = {
  id: 1,
  total_points: 0,
  current_streak: 0,
  best_streak: 0,
  last_active_date: null,
};

export function usePoints() {
  const db = useSQLiteContext();
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

      const [pointsSnapshot, weekCompletions] = await Promise.all([
        getPoints(db),
        getCompletionsForWeek(db, formatDateOnly(weekStart), formatDateOnly(weekEnd)),
      ]);

      setPoints(pointsSnapshot);
      setWeekSummary(buildWeekSummary(weekCompletions, now));
    } catch (error) {
      console.error('Failed to load points data:', error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  const spendPoints = useCallback(async (amount: number) => {
    const nextTotal = await updatePoints(db, -Math.abs(amount));
    await refresh();
    return nextTotal;
  }, [db, refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return {
    loading,
    points,
    refresh,
    spendPoints,
    weekSummary,
  };
}
