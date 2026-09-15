import {
  format, eachDayOfInterval, startOfDay, endOfDay, isWithinInterval
} from "date-fns";
import { useMemo } from "react";

export default function useAlarmData(
  notifications = [],
  startDate,
  endDate
) {
  return useMemo(() => {
    const interval = eachDayOfInterval({
      start: startOfDay(startDate),
      end: endOfDay(endDate),
    });
    const counts = interval.reduce((acc, day) => {
      acc[format(day, "dd/MM/yyyy")] = 0;
      return acc;
    }, {});
      
    if (!notifications.length) {
      return Object.entries(counts).map(([day, alarms]) => ({ day, alarms }));
    }

    // filter to your date window
    const filtered = notifications.filter(n => {
      const ts = parseInt(n.details.firstOutOfRangeAt, 10) * 1000;
      return isWithinInterval(new Date(ts), {
        start: startOfDay(startDate),
        end: endOfDay(endDate),
      });
    });
    if (!filtered.length) return [];


    // tally alarms
    filtered.forEach(n => {
      const dayKey = format(
        new Date(parseInt(n.details.firstOutOfRangeAt, 10) * 1000),
        "dd/MM/yyyy"
      );
      counts[dayKey] = (counts[dayKey] || 0) + 1;
    });

    // map into recharts-friendly array
    return Object.entries(counts).map(([day, alarms]) => ({ day, alarms }));
  }, [notifications, startDate, endDate]);
}