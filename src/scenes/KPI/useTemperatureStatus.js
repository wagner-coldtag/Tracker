// useTemperatureStatus.js
import { differenceInMilliseconds, startOfDay, endOfDay } from "date-fns";
import { useMemo } from "react";

function useTemperatureStatusData(notifications = [], startDate, endDate) {
  return useMemo(() => {

    if (!startDate || !endDate) return [];

    if (!notifications.length) {
      return [
        { name: "Alta", value: 0 },
        { name: "Baixa", value: 0 },
        { name: "Conforme", value: 100 },

      ];
    }

    let highDuration = 0;
    let lowDuration = 0;

    notifications.forEach((n) => {
      const { type, details } = n;

      const start = details?.firstOutOfRangeAt ? parseInt(details.firstOutOfRangeAt, 10) * 1000 : null;
      const end = details?.solvedAt ? parseInt(details.solvedAt, 10) * 1000 : null;

      if (!start || !end || end <= start) return;

      const duration = end - start;

      if (type === "TemperatureTooHigh") highDuration += duration;
      if (type === "TemperatureTooLow") lowDuration += duration;
    });

    const totalIntervalMs = differenceInMilliseconds(endOfDay(endDate), startOfDay(startDate));
    const highPercent = (highDuration / totalIntervalMs) * 100;
    const lowPercent = (lowDuration / totalIntervalMs) * 100;
    const okPercent = Math.max(0, 100 - highPercent - lowPercent);

    return [
      { name: "Alta", value: parseFloat(highPercent.toFixed(2)) },
      { name: "Baixa", value: parseFloat(lowPercent.toFixed(2)) },
      { name: "Conforme", value: parseFloat(okPercent.toFixed(2)) },
    ];
  }, [notifications, startDate, endDate]);
}

export default useTemperatureStatusData;
