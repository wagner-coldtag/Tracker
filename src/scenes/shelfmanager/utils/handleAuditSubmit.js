import axios from "axios";

export async function handleAuditSubmit(auditData, setAuditResult, setChartData, fetchTemperatureData) {
  try {
    let allData = [];
  
    // Fetch all temperature data from periods
    for (const period of auditData.periods) {
      const sensorTemperatureData = await fetchTemperatureData(period.location, period.from, period.to);
      allData = allData.concat(sensorTemperatureData);
    }
  
    // Group by hour
    const grouped = {};
    allData.forEach(entry => {
      const hourTimestamp = Math.floor(entry.timestamp / 3600) * 3600;
      if (!grouped[hourTimestamp]) grouped[hourTimestamp] = [];
      grouped[hourTimestamp].push(entry.temperature);
    });
  
    // Calculate average per hour
    let averagedData = Object.entries(grouped).map(([timestamp, temps]) => {
      const sum = temps.reduce((acc, t) => acc + t, 0);
      return {
        timestamp: Number(timestamp),
        averageTemperature: sum / temps.length,
      };
    });
  
    // Sort ascending
    averagedData.sort((a, b) => a.timestamp - b.timestamp);
  
    // Fill missing hours by interpolation
    const filledData = [];
    let createdCount = 0;
  
    for (let i = 0; i < averagedData.length; i++) {
      filledData.push(averagedData[i]);
      if (i === averagedData.length - 1) break;
  
      const current = averagedData[i];
      const next = averagedData[i + 1];
      const gap = (next.timestamp - current.timestamp) / 3600;
  
      if (gap > 1) {
        for (let h = 1; h < gap; h++) {
          const missingTimestamp = current.timestamp + h * 3600;
          const interpolatedTemp =
              current.averageTemperature +
              ((next.averageTemperature - current.averageTemperature) * h) / gap;
  
          filledData.push({
            timestamp: missingTimestamp,
            averageTemperature: interpolatedTemp,
            interpolated: true,
          });
  
          createdCount++;
        }
      }
    }
  
    filledData.sort((a, b) => a.timestamp - b.timestamp);
  
    const payloadData = filledData.map(({ timestamp, averageTemperature }) => ({
      timestamp: new Date(timestamp * 1000).toISOString(),
      temperature: averageTemperature,
    }));
    const body = {
      mode: "audit",
      data: payloadData, 
      microbialThreshold: auditData.microbialThreshold,

    };
      // Call backend API with axios
    const response = await axios.post(
      "https://9yv5fy40u1.execute-api.sa-east-1.amazonaws.com/dev/predict",
      body,
      { headers: { "Content-Type": "application/json" } }
    );
      // Assuming response.data has the prediction result, adapt if needed
    setAuditResult(`Prediction result: ${JSON.stringify(response.data)}`);
    const { timestamps, microbial_load, shelf_life_remaining, averageTemperature } = response.data;

    const chartData = timestamps.map((timestamp, index) => {
      const match = filledData.find(d => new Date(d.timestamp * 1000).toISOString() === timestamp);
      return {
        timestamp,
        microbial_load: microbial_load[index],
        shelf_life_remaining: shelf_life_remaining[index],
        averageTemperature: averageTemperature[index], // Add temperature here
      };
    });

    setChartData(chartData); 
  } catch (error) {
    console.error("Audit error:", error);
    setAuditResult("Error running audit");
  }
}
  
  