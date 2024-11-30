import React from "react";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Chart = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Check if data is valid
  if (!data || !Array.isArray(data) || data.length < 2) {
    return <div>No data available for the chart.</div>; // Fallback if data is not valid
  }

  // Convert data to the format required by Recharts
  const transformedData = data[0]?.data.map((tempPoint, index) => {
    const time = tempPoint.x * 1000; // Keep `time` as a numeric timestamp in milliseconds
    const temperatura = typeof tempPoint.y === "number" ? tempPoint.y.toFixed(1) : 0;
    const N = data[1]?.data[index]?.y.toFixed(1) || 0;
    return { time, temperatura, N };
  }) || [];

  // Calculate min and max for N axis
  const nValues = transformedData.map(d => d.N);
  const TValues = transformedData.map(d => d.temperatura);

  const nMin = Math.floor(Math.min(...nValues));
  const nMax = 10; // Fixed maximum value for N axis
  const TMin = Math.floor(Math.min(...TValues))-3;
  const TMax = Math.floor(Math.max(...TValues))+3;

  if (transformedData.length === 0) {
    return <div>No valid data available for the chart.</div>; // Fallback if no valid dates exist
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
          label={{ value: "Temperatura (°C)", angle: -90, fill: colors.grey[100], dx: -10 }} // Added dx for spacing
          stroke={colors.grey[100]}
          tick={{ fill: colors.grey[100] }}
          axisLine={{ stroke: colors.grey[600] }}
          domain={[TMin, TMax]} // Set domain dynamically

        />

        {/* Secondary Y-Axis for N Values */}
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: "Predicted N", angle: -90, fill: colors.grey[100], dx: 10 }} // Added dx for spacing
          stroke={colors.grey[100]}
          tick={{ fill: colors.grey[100] }}
          axisLine={{ stroke: colors.grey[600] }}
          domain={[nMin, nMax]} // Set domain dynamically
        />

        <Tooltip
          contentStyle={{ backgroundColor: colors.primary[500], color: colors.grey[300] }}
          labelStyle={{ color: "white"  }}
          itemStyle={{ color: "white"  }}
          labelFormatter={(label) => {
            const date = new Date(label).toLocaleDateString();
            const time = new Date(label).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return `${date}, ${time}`; // Combine date and time
          }}
        />
        <Legend
          wrapperStyle={{ color: colors.grey[100] }}
          itemStyle={{ color: colors.grey[100] }}
          iconSize={12}
        />

        {/* Line for Temperature */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="temperatura"
          stroke={colors.greenAccent[500]}
          strokeWidth={2}
          dot={false} // Remove dots if desired
        />

        {/* Line for N Values */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="N"
          stroke={colors.blueAccent[500]}
          strokeWidth={2}
          dot={false} // Disable dots on the line
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Chart;
