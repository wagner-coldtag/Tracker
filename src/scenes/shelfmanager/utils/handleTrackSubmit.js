import axios from "axios";

export const handleTrackSubmit = async({
  trackData,
  setTrackResult,
  setPredictions,
  devices,
  fetchTemperatureData,
  alarmTime,
  microbialThreshold
}) => {
  try {
    const { location, entryDate } = trackData;
    if (!location || !entryDate) {
      setTrackResult("Por favor, selecione o local e a data de entrada.");
      return;
    }
  
    const now = new Date();
    const start = new Date(entryDate);
    const end = new Date((now.getTime() / 3600000) * 3600000);
  
    const rawData = await fetchTemperatureData(location, start, now);
  
    if (!rawData.length) {
      setTrackResult("Nenhum dado de temperatura encontrado.");
      return;
    }
  
    const grouped = {};
    rawData.forEach(({ timestamp, temperature }) => {
      const hour = Math.ceil(timestamp / 3600) * 3600;
      if (!grouped[hour]) grouped[hour] = [];
      grouped[hour].push(temperature);
    });
  
    const averagedData = Object.entries(grouped).map(([ts, temps]) => ({
      timestamp: Number(ts),
      averageTemperature: temps.reduce((a, b) => a + b, 0) / temps.length,
    }));
  
    const filledData = [];
    for (let i = 0; i < averagedData.length; i++) {
      filledData.push(averagedData[i]);
      if (i === averagedData.length - 1) break;
  
      const curr = averagedData[i];
      const next = averagedData[i + 1];
      const gapHours = (next.timestamp - curr.timestamp) / 3600;
  
      if (gapHours > 1) {
        for (let h = 1; h < gapHours; h++) {
          const interpolatedTimestamp = curr.timestamp + h * 3600;
          const interpolatedTemp =
              curr.averageTemperature + ((next.averageTemperature - curr.averageTemperature) * h) / gapHours;
          filledData.push({
            timestamp: interpolatedTimestamp,
            averageTemperature: interpolatedTemp,
            interpolated: true,
          });
        }
      }
    }
  
    filledData.sort((a, b) => a.timestamp - b.timestamp);
  
    const dataToPredict = filledData.filter(d => d.timestamp <= end.getTime() / 1000);
    const leftoverTemps = filledData.filter(d => d.timestamp > end.getTime() / 1000);
  
    if (!dataToPredict.length) {
      setTrackResult("Dados insuficientes para predição.");
      return;
    }
  
    const payload = dataToPredict.map(({ timestamp, averageTemperature }) => ({
      timestamp: new Date(timestamp * 1000).toISOString(),
      temperature: averageTemperature,
    }));
  
    const body = {
      mode: "audit",
      data: payload,
    };
  
    const response = await axios.post(
      "https://9yv5fy40u1.execute-api.sa-east-1.amazonaws.com/dev/predict",
      body,
      { headers: { "Content-Type": "application/json" } }
    );
  
    const { microbial_load, timestamps, shelf_life_remaining } = response.data;
  
    const lastPredictionTimestamp = timestamps.at(-1);
    const lastMicrobialLoad = microbial_load.at(-1);
    const lastShelfLife = shelf_life_remaining.at(-1);
  
    const matchingDevice = devices.find((d) => d.device_id === location);
  
    setTrackResult(
      `Última predição até ${new Date(lastPredictionTimestamp).toLocaleString("pt-BR")}\n` +
        `Carga microbiana estimada: ${lastMicrobialLoad.toFixed(2)}\n` +
        `Temperaturas futuras disponíveis: ${leftoverTemps.length}`
    );
  
    const updatedPredictions = {
      lastPredictionTimestamp,
      leftoverTemps,
      lastMicrobialLoad,
      lastShelfLife,
      alarmTime,
      microbialThreshold,
    };
  
    await fetch(
      "https://afuud4nek9.execute-api.sa-east-1.amazonaws.com/dev/sensors",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: matchingDevice?.device_id,
          type: matchingDevice?.type,
          predictions: updatedPredictions,
        }),
      }
    );
  
    setPredictions(updatedPredictions);
  
  } catch (err) {
    console.error("Erro no rastreamento:", err);
    setTrackResult("Erro durante a predição.");
  }
};
  