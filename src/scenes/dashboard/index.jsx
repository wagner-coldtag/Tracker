import React, { useState, useEffect } from 'react';
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import StatBox from "../../components/StatBox";
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import CoronavirusIcon from '@mui/icons-material/Coronavirus';

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://iike8cfke9.execute-api.sa-east-1.amazonaws.com/prod/temperatures?device_id=Device001');
        console.log(response)
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        const fetchedData = JSON.parse(jsonData.body);
        const formattedData = formatData(fetchedData); // Helper function to format data for Nivo
        console.log('Fetched and formatted data:', formattedData); // Debugging line
        setData(formattedData);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Initial fetch

    const intervalId = setInterval(fetchData, 60000); // Fetch data every 60 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // Helper function to format the data for Nivo's Line Chart
  const formatData = (fetchedData) => {
    return [
      {
        id: "temperature",
        color: "hsl(214, 70%, 50%)",
        data: fetchedData
          .filter(item => item.timestamp && !isNaN(item.timestamp)) // Filter out invalid timestamps
          .map(item => ({
            x: formatTimestamp(item.timestamp),
            y: item.temperature,
          })),
      },
      {
        id: "N",
        color: "hsl(153, 70%, 50%)",
        data: fetchedData
          .filter(item => item.timestamp && !isNaN(item.timestamp)) // Filter out invalid timestamps
          .map(item => ({
            x: formatTimestamp(item.timestamp),
            y: item.N,
          })),
      }
    ];
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) {
      return "Invalid Date"; // Handle invalid timestamp
    }
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Check the structure of data before accessing it
  console.log('Current data state:', data); // Debugging line

  const lastTemperature = data.length > 0 && data[0]?.data.length > 0
  ? data[0].data[data[0].data.length - 1]?.y?.toFixed(1) 
  : 0;  
  const temperatureColor = lastTemperature > 10 ? colors.redAccent[500] : colors.greenAccent[500];

  // Update this line with proper checks
  const lastMicrobialLoad = data.length > 1 && data[1]?.data.length > 0 
    ? data[1].data[data[1].data.length - 1]?.y?.toFixed(1) 
    : 0;

  const microbialColor = lastMicrobialLoad > 5 ? colors.redAccent[500] : colors.greenAccent[500];
  const highTemperatureMeasurements = data.length > 0 
    ? data[0].data.filter(item => item.y > 7).length
    : 0;

  let timePassed = 0;
  if (data[0]?.data.length > 1) {
    const firstTimestamp = data[0].data[0].x;
    const lastTimestamp = data[0].data[data[0].data.length - 1].x;

    const firstDate = new Date(firstTimestamp);
    const lastDate = new Date(lastTimestamp);

    const timeDifference = lastDate - firstDate;

    const minutesPassed = Math.floor(timeDifference / 60000);
    const secondsPassed = Math.floor((timeDifference % 60000) / 1000);
    timePassed = { minutes: minutesPassed, seconds: secondsPassed };
  }

  const timePassedString = timePassed
    ? `${timePassed.minutes}m ${timePassed.seconds}s`
    : "No Data";

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Download Reports
          </Button>
        </Box>
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={lastTemperature !== null ? `${lastTemperature}°C` : "No Data"}
            subtitle="Current Temperature"
            progress={lastTemperature !== null ? (lastTemperature / 10).toFixed(2) : 0}
            increase={lastTemperature > 10 ? "High" : "Normal"}
            icon={
              <DeviceThermostatIcon
                sx={{ color: temperatureColor, fontSize: "26px" }}
              />
            }
            progressColor={temperatureColor}
          />
        </Box>

        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={lastMicrobialLoad !== null ? `${lastMicrobialLoad}` : "No Data"}
            subtitle="Current Load"
            progress={lastMicrobialLoad !== null ? (lastMicrobialLoad / 5).toFixed(2) : 0}
            increase={
              <Typography sx={{ color: microbialColor }}>
                {lastMicrobialLoad > 5 ? "High" : "Normal"}
              </Typography>
            }            
            icon={
              <CoronavirusIcon
                sx={{ color: microbialColor, fontSize: "26px" }}
              />
            }
            titleColor={lastMicrobialLoad > 5 ? colors.redAccent[500] : colors.grey[100]}
            progressColor={microbialColor}
            subtitleColor={microbialColor}
          />
        </Box>

        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={highTemperatureMeasurements}
            subtitle="Notifications"
            icon={
              <NotificationsActiveIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={timePassedString}
            subtitle="Time passed"
            icon={
              <AccessTimeIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
          )
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Number of readings
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                {data.length > 0 ? data[0].data.length : 0 }
              </Typography>
            </Box>
            <Box>
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} data={data} />
          </Box>
        </Box>

        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Recent Measurements
            </Typography>
          </Box>
          {data.length > 0 && data[0].data.length > 0 && data[0].data.slice(-10).map((measurement, i) => (
            <Box
              key={`${measurement.x}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  Truck 1
                </Typography>
                <Typography color={colors.grey[100]}>
                  Thermostat 1
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{measurement.x}</Box>
              <Box
                backgroundColor={colors.greenAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >
                {measurement.y.toFixed(1)} °C
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
