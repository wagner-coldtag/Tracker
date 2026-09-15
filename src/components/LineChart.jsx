import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTheme , Box, Typography } from "@mui/material";
import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { tokens } from "../theme";

const Chart = ({ data, tempMin, tempMax }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Check if data is valid
  if (!data || !Array.isArray(data) || data.length < 2) {
    return <div>No data available for the chart.</div>; // Fallback if data is not valid
  }

  // Convert data to the format required by Recharts
  const transformedData = data[0]?.data.map((tempPoint) => {
    const time = tempPoint.x * 1000; // Keep `time` as a numeric timestamp in milliseconds
    const Temperatura = typeof tempPoint.y === "number" ? tempPoint.y.toFixed(1) : 0;
    return { time, Temperatura };
  }) || [];

  // Calculate min and max for the Y axis
  const TValues = transformedData.map((d) => d.Temperatura);
  const TMin = Math.floor(Math.min(...TValues)) - 3;
  const TMax = Math.floor(Math.max(...TValues)) + 3;

  const tempMinLine = tempMin ? transformedData.map((point) => ({ time: point.time, Mínimo: tempMin })) : [];
  const tempMaxLine = tempMax ? transformedData.map((point) => ({ time: point.time, Máximo: tempMax })) : [];

  if (transformedData.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="200px"
        border="1px dashed"
        borderColor={colors.grey[600]}
        borderRadius="10px"
        bgcolor={colors.primary[400]}
        mt={4} p={2}
      >
        <ErrorOutlineIcon sx={{ fontSize: 48, color: "rgb(255, 115, 115)", mb: 1 }} />
        <Typography variant="h6" color={colors.grey[100]} align="center">
          Este sensor não possui dados de temperatura no período informado.
        </Typography>
        <Typography variant="body2" color={colors.grey[300]} align="center" mt={1}>
          Verifique se o dispositivo está conectado ou ativo.
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={transformedData} margin={{ top: 40, right: 0, bottom: 50, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grey[600]} />
        <XAxis
          dataKey="time"
          type="number" // Use numeric values for the x-axis
          domain={["dataMin", "dataMax"]} // Optional: automatically adjust to the data range
          tickFormatter={(value) => new Date(value).toLocaleString()} // Format for readable labels
          stroke={colors.grey[100]}
          tick={{ fill: colors.grey[100] }}
          axisLine={{ stroke: colors.grey[600] }}
        />

        {/* Primary Y-Axis for Temperature */}
        <YAxis
          yAxisId="left"
          label={{ value: "Temperatura (°C)", angle: -90, fill: colors.grey[100], dx: -10 }}
          stroke={colors.grey[100]}
          tick={{ fill: colors.grey[100] }}
          axisLine={{ stroke: colors.grey[600] }}
          domain={[TMin, TMax]} // Ensure the domain includes the temperature range
        />

        <Tooltip
          content={({ payload, label }) => {
            if (!payload || payload.length === 0) return null;

            const temperatureData = payload.find(item => item.dataKey === "Temperatura");

            if (temperatureData) {
              const temperature = temperatureData.value;
              const formattedDate = new Date(label).toLocaleString();

              // Only return the temperature information in the tooltip
              return (
                <div
                  style={{
                    backgroundColor: colors.primary[500],
                    color: "white",
                    border: "1px solid white",
                    padding: "5px 8px", // Reduced vertical padding
                    borderRadius: "5px",
                    lineHeight: "1.2", // Reduced line-height for less vertical space
                    minWidth: "100px", // Optional: set a minimum width for consistency
                  }}
                >
                  <p style={{ margin: 2 }}>{formattedDate}</p>
                  <p style={{ margin: 0 }}>{`Temperatura: ${temperature} °C`}</p>
                </div>
              );
            }

            return null; // Return nothing if no temperature data found
          }}
        />


        <Legend
          wrapperStyle={{ color: colors.grey[100] }}
          itemStyle={{ color: colors.grey[100] }}
          iconSize={8}
        />

        {/* Line for Temperature */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="Temperatura"
          stroke={colors.greenAccent[500]}
          strokeWidth={2}
          dot={false} // Remove dots if desired
        />

        {/* Plot TempMin Line */}
        {tempMin && (
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Mínimo"
            stroke="blue" // Set the line color for TempMin
            strokeWidth={0.5}
            dot={false}
            data={tempMinLine} // Map to a constant y-value for TempMin
          />
        )}

        {/* Plot TempMax Line */}
        {tempMax && (
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Máximo"
            stroke="red" // Set the line color for TempMax
            strokeWidth={0.5}
            dot={false}
            data={tempMaxLine} // Map to a constant y-value for TempMax
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Chart;
