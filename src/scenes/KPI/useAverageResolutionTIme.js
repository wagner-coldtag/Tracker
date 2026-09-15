import {
  format, eachDayOfInterval,
  startOfDay, endOfDay,
} from "date-fns";
import { useMemo } from "react";

export default function useAverageResolutionTime(
  notifications = [],
  startDate,
  endDate
) {
  return useMemo(() => {
    if (!startDate || !endDate) return [];

    const interval = eachDayOfInterval({
      start: startOfDay(startDate),
      end: endOfDay(endDate),
    });

    // Build base structure with empty arrays for collecting durations
    const dayBuckets = interval.reduce((acc, day) => {
      const key = format(day, "dd/MM/yyyy");
      acc[key] = [];
      return acc;
    }, {});

    notifications.forEach(n => {
      const { firstOutOfRangeAt, solvedAt } = n.details || {};
      if (!firstOutOfRangeAt || !solvedAt) return;

      const start = parseInt(firstOutOfRangeAt, 10) * 1000;
      const end = parseInt(solvedAt, 10) * 1000;
      const duration = end - start;
      if (duration <= 0) return;

      const dayKey = format(new Date(start), "dd/MM/yyyy");
      if (dayBuckets[dayKey]) {
        dayBuckets[dayKey].push(duration);
      }
    });

    // Convert to recharts format: average duration in minutes
    return Object.entries(dayBuckets).map(([day, durations]) => {
      const avgMs = durations.length
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : 0;
      const avgMinutes = avgMs / (1000 * 60);
      return { day, avgMinutes: parseFloat(avgMinutes.toFixed(2)) };
    });
  }, [notifications, startDate, endDate]);
}
