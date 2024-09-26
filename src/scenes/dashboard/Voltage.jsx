import React, { useState, useEffect } from 'react';
import { Box, Button, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';
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
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const Voltage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 1);  // Subtract one month
    return currentDate;
  });
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://vygk3womq2.execute-api.sa-east-1.amazonaws.com/prod/temperatures?company=DumbCompany');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        console.log(jsonData);
  
        const fetchedData = JSON.parse(jsonData.body);
        const sortedData = fetchedData.sort((a, b) => a.timestamp - b.timestamp);
        const uniqueDevices = [...new Set(sortedData.map(item => item.device_id))];
        setDevices(uniqueDevices);
  
        if (uniqueDevices.length > 0 && selectedDevice === null) {
          setSelectedDevice(uniqueDevices[0]);
        }
  
        const formatData = (deviceData) => {
          return [
            {
              id: "Tensão",
              color: "hsl(45, 70%, 50%)",
              data: deviceData
                .filter(item => item.timestamp && !isNaN(item.timestamp))
                .filter(item => {
                  // Filter by start and end date
                  const itemDate = new Date(item.timestamp * 1000);
                  return itemDate >= startDate && itemDate <= endDate;
                })
                .map(item => {
                  return {
                    x: item.timestamp,
                    y: item.voltage,
                    formattedX: formatTimestamp(item.timestamp),
                  };
                })
            }
          ];
        };
  
        setData(formatData(sortedData.filter(item => item.device_id === selectedDevice)));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
    const intervalId = setInterval(fetchData, 60000);
    return () => clearInterval(intervalId);
  }, [selectedDevice, startDate, endDate]); 

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const lastVoltage = data.length > 0 && data[0]?.data.length > 0
    ? data[0].data[data[0].data.length - 1]?.y?.toFixed(1)
    : 0;

  const handleButtonClick = (device) => {
    setSelectedDevice(device);
  };

  const transformedData = data[0]?.data.map((tempPoint) => {
    const time = new Date(tempPoint.x * 1000).toISOString();
    const Voltage = typeof tempPoint.y === 'number' ? tempPoint.y : 0;

    return { time, Voltage };
  }) || [];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box m="20px">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title="ANÁLISE DE TENSÃO" subtitle="Panorama geral da tensão" />
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <DateTimePicker
            label="Início"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => <Box component="span" sx={{ ml: 2 }}>{params.input}</Box>}
          />
          <DateTimePicker
            label="Fim"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => <Box component="span" sx={{ ml: 2 }}>{params.input}</Box>}
          />
        </Box>

        <Box  mt="20px">
          {devices.map((device) => (
            <Button
              key={device}
              variant={device === selectedDevice ? "contained" : "outlined"}
              onClick={() => handleButtonClick(device)}
              sx={{
                mr: "10px",
                color: device === selectedDevice ? colors.primary[500] : colors.grey[100],
                backgroundColor: device === selectedDevice ? colors.greenAccent[500] : colors.primary[400],
                borderColor: colors.grey[100],
                '&:hover': {
                  backgroundColor: device === selectedDevice ? colors.greenAccent[600] : colors.primary[500],
                  color: colors.grey[400],
                },
              }}
            >
              Device {device}
            </Button>
          ))}
        </Box>

        <Box mt="20px"
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          gridAutoRows="140px"
          gap="20px"
        >
          <Box
            gridColumn="span 3"
            backgroundColor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <StatBox
              title={lastVoltage !== null ? `${lastVoltage} V` : "No Data"}
              subtitle="Último valor"
              progress={lastVoltage !== null ? (lastVoltage / 10).toFixed(2) : 0}
              increase={lastVoltage > 10 ? "Normal" : "Baixo"}
              icon={
                <SignalWifi4BarIcon sx={{ fontSize: "26px" }} />
              }
            />
          </Box>

          <Box
            gridColumn="span 9"
            backgroundColor={colors.primary[400]}
            p="20px"
            height="260px"
          >
            <Box >
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={transformedData} margin={{ top: 20, right: 0, bottom: 50, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grey[600]} />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={(value) => new Date(value).toLocaleString()} 
                    stroke={colors.grey[100]} 
                    tick={{ fill: colors.grey[100] }} 
                    axisLine={{ stroke: colors.grey[600] }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    label={{ value: 'Tensão (V)', angle: -90, fill: colors.grey[100], dx: -40 }}
                    stroke={colors.grey[100]} 
                    tick={{ fill: colors.grey[100] }} 
                    axisLine={{ stroke: colors.grey[600] }}
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
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="Voltage" 
                    stroke={colors.greenAccent[500]} 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default Voltage;
