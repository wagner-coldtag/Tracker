import React from 'react';
import { useTheme } from '@mui/material';
import { tokens } from '../theme';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Chart = ({ isCustomLineColors = false, isDashboard = false, data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Check if data is valid
  if (!data || !Array.isArray(data) || data.length < 2) {
    return <div>No data available for the chart.</div>; // Fallback if data is not valid
  }

  // Convert data to the format required by Recharts
  const transformedData = data[0]?.data.map((tempPoint, index) => {
    const time = new Date(tempPoint.x * 1000).toISOString(); // Convert to ISO string
    const temperature = typeof tempPoint.y === 'number' ? tempPoint.y : 0; // Ensure y is a number
    const N = data[1]?.data[index]?.y || 0; // Get corresponding N value

    return { time, temperature, N };
  }) || [];

  // Calculate min and max for N axis
  const nValues = transformedData.map(d => d.N);
  const nMin = Math.floor(Math.min(...nValues));
  const nMax = 10; // Fixed maximum value for N axis

  if (transformedData.length === 0) {
    return <div>No valid data available for the chart.</div>; // Fallback if no valid dates exist
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={transformedData} margin={{ top: 40, right: 0, bottom: 50, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grey[600]} />
        <XAxis 
          dataKey="time" 
          tickFormatter={(value) => new Date(value).toLocaleString()} 
          stroke={colors.grey[100]} 
          tick={{ fill: colors.grey[100] }} 
          axisLine={{ stroke: colors.grey[600] }}
        />
        
        {/* Primary Y-Axis for Temperature */}
        <YAxis 
          yAxisId="left" 
          label={{ value: 'Temperature (°C)', angle: -90, fill: colors.grey[100], dx: -10 }} // Added dx for spacing
          stroke={colors.grey[100]} 
          tick={{ fill: colors.grey[100] }} 
          axisLine={{ stroke: colors.grey[600] }}
        />
        
        {/* Secondary Y-Axis for N Values */}
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          label={{ value: 'Predicted N', angle: -90, fill: colors.grey[100], dx: 10 }} // Added dx for spacing
          stroke={colors.grey[100]} 
          tick={{ fill: colors.grey[100] }} 
          axisLine={{ stroke: colors.grey[600] }}
          domain={[nMin, nMax]} // Set domain dynamically
        />
        
        <Tooltip 
          contentStyle={{ backgroundColor: colors.primary[500], color: colors.grey[100] }} 
          labelStyle={{ color: colors.grey[100] }} 
          itemStyle={{ color: colors.grey[100] }}
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
          dataKey="temperature" 
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