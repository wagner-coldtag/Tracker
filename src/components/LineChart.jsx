import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import { useTheme } from '@mui/material';
import { tokens } from '../theme';

const LineChart = ({ isCustomLineColors = false, isDashboard = false, data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Check if data is valid
  if (!data || !Array.isArray(data) || data.length < 2) {
    return <div>No data available for the chart.</div>; // Fallback if data is not valid
  }

  const temperatureData = {
    id: 'Temperature',
    color: colors.greenAccent[500],
    data: data[0]?.data.map(point => ({
      x: point.x, // assuming point.x is a timestamp
      y: typeof point.y === 'number' ? point.y : 0, // Ensure y is a number
    })) || [],
    yAxisId: 'y', // Assigning y-axis ID for temperature
  };

  const nData = {
    id: 'N',
    color: colors.blueAccent[500],
    data: data[1]?.data.map(point => ({
      x: point.x, // assuming point.x is a timestamp
      y: typeof point.y === 'number' ? point.y : 0, // Ensure y is a number
    })) || [],
    yAxisId: 'y1', // Assigning y-axis ID for N
  };
  
  // Get the x values (timestamps)
  const xValues = [
    ...temperatureData.data.map(point => point.x),
    ...nData.data.map(point => point.x),
  ].filter(x => x !== null); // Remove any null values

  if (xValues.length === 0) {
    return <div>No valid data available for the chart.</div>; // Fallback if no valid dates exist
  }

  const firstTimestamp = new Date(Math.min(...xValues.map(ts => new Date(ts)))).toISOString();
  const lastTimestamp = new Date(Math.max(...xValues.map(ts => new Date(ts)))).toISOString();
  return (
    <ResponsiveLine
      data={[temperatureData, nData]}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            color: colors.primary[500],
          },
        },
      }}
      colors={{ datum: "color" }}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }} // Ensure this matches the x data type
      yScale={{
        type: 'linear',
        min: 0,
        max: 30,
        stacked: false,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="catmullRom"
      axisTop={null}
      axisRight={{
        orient: 'right',
        tickSize: 3,
        tickPadding: 5,
        legend: 'N',
        legendOffset: 40,
        legendPosition: 'middle',
        scale: {
          type: 'linear',
          min: 0,
          max: 15,
        },
      }}
      axisBottom={{
        orient: "bottom",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "timestamp",
        legendOffset: 36,
        legendPosition: "middle",
        tickValues: [firstTimestamp, lastTimestamp],
        format: (value) => {
          const date = new Date(value);
          return date.toLocaleString(); // Adjust formatting as necessary
        },
      }}
      axisLeft={{
        orient: "left",
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Temperature",
        legendOffset: -40,
        legendPosition: "middle",
        scale: {
          type: 'linear',
          min: 0,
          max: 30,
        },
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={0}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

export default LineChart;
