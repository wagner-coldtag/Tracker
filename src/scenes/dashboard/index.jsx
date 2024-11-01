import React, { useState, useEffect } from "react";
import { Box, Button, IconButton, Typography, useTheme, useMediaQuery } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Header from "../../components/Header";
import Chart from "../../components/LineChart";
import StatBox from "../../components/StatBox";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import CoronavirusIcon from "@mui/icons-material/Coronavirus";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import * as XLSX from "xlsx"; // Import xlsx

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Check if the screen is small

  const [data, setData] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 1);  // Subtract one month
    return currentDate;
  });  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch("https://08mwl5gxyj.execute-api.sa-east-1.amazonaws.com/devices");
        if (!response.ok) throw new Error("Network response was not ok");
        const jsonData = await response.json();

        const fetchedDevices = jsonData.device_ids;

        setDevices(fetchedDevices);
        if (fetchedDevices.length > 0) setSelectedDevice(fetchedDevices[0]);
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };

    fetchDevices(); // Fetch devices initially
  }, []);

  // Fetch data for the selected device within the date range
  useEffect(() => {
    const fetchPackageData = async () => {
      if (!selectedDevice) return; // Don't fetch if no device is selected

      try {
        const response = await fetch(`https://08mwl5gxyj.execute-api.sa-east-1.amazonaws.com/device-data?company=CompanyA&device_id=${selectedDevice}`);
        if (!response.ok) throw new Error("Network response was not ok");

        const jsonData = await response.json();
        const sortedData = jsonData.sort((a, b) => a.timestamp - b.timestamp);

        // Format data with date filtering
        const formatData = (deviceData) => {
          return [
            {
              id: "temperature",
              color: "hsl(214, 70%, 50%)",
              data: deviceData
                .filter(item => item.timestamp && !isNaN(item.timestamp))
                .filter(item => {
                  // Filter by start and end date
                  const itemDate = new Date(item.timestamp * 1000);
                  return itemDate >= startDate && itemDate <= endDate;
                })
                .map(item => {
                  return {
                    x: item.timestamp, // Keep the raw timestamp
                    y: item.temperature,
                    voltage: item.voltage,
                    rssi: item.RSSI,
                    packages: item.count,
                    formattedX: formatTimestamp(item.timestamp), // Store formatted timestamp for display
                  };
                })
            },
            {
              id: "N",
              color: "hsl(153, 70%, 50%)",
              data: deviceData
                .filter(item => item.timestamp && !isNaN(item.timestamp))
                .map(item => ({
                  x: item.timestamp, // Keep the raw timestamp
                  y: item.N,
                  formattedX: formatTimestamp(item.timestamp), // Store formatted timestamp for display
                }))
            }
          ];
        };
        setData(formatData(sortedData.filter(item => item.device_id === selectedDevice)));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchPackageData(); // Call to fetch data initially
    const intervalId = setInterval(fetchPackageData, 60000); // Fetch data every 60 seconds
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [selectedDevice, startDate, endDate]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) {
      console.error("Invalid timestamp:", timestamp);
      return "Invalid Date"; // Handle invalid timestamp
    }

    const date = new Date(timestamp * 1000); // Assuming timestamp is in seconds

    if (isNaN(date.getTime())) {
      console.error("Date creation failed for timestamp:", timestamp);
      return "Invalid Date";
    }
    return date.toLocaleString();
  };

  const downloadExcel = () => {
    if (data.length === 0) return;

    const worksheetData = data[0].data.map((item, index) => ({
      Timestamp: formatTimestamp(item.x),
      Temperature: item.y,
      N: data[1]?.data[index]?.y || "No Data" // Add N data if available, else 'No Data'
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SensorData");

    XLSX.writeFile(workbook, "sensor_report.xlsx");
  };

  const downloadAll = () => {
    if (data.length === 0) return;

    const worksheetData = data[0].data.map((item, index) => ({
      Timestamp: formatTimestamp(item.x),
      Temperature: item.y,
      N: data[1]?.data[index]?.y || "No Data",
      Voltage: item.voltage || "No Data",
      RSSI: item.rssi || "No Data",
      Packages: item.packages || "No Data",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SensorData");

    XLSX.writeFile(workbook, "sensor_report.xlsx");
  };

  // Check the structure of data before accessing it
  const lastTemperature = data.length > 0 && data[0]?.data.length > 0
    ? data[0].data[data[0].data.length - 1]?.y?.toFixed(1)
    : 0;
  const temperatureColor = lastTemperature > 10 ? colors.redAccent[500] : colors.greenAccent[500];

  const lastMicrobialLoad = data.length > 1 && data[1]?.data.length > 0
    ? data[1].data[data[1].data.length - 1]?.y?.toFixed(1)
    : 0;

  const microbialColor = lastMicrobialLoad > 5 ? colors.redAccent[500] : colors.greenAccent[500];
  const highTemperatureMeasurements = data.length > 0
    ? data[0].data.filter(item => item.y > 7).length
    : 0;

  let timePassed = 0;
  if (data[0]?.data.length > 1) {
    const firstTimestamp = data[0].data[0].x * 1000; // Convert to milliseconds
    const lastTimestamp = data[0].data[data[0].data.length - 1].x * 1000; // Convert to milliseconds

    const firstDate = new Date(firstTimestamp);
    const lastDate = new Date(lastTimestamp);

    const timeDifference = lastDate - firstDate;

    const minutesPassed = Math.floor(timeDifference / 60000);
    const secondsPassed = Math.floor((timeDifference % 60000) / 1000);
    timePassed = { minutes: minutesPassed, seconds: secondsPassed };
  }

  const timePassedString = timePassed
    ? `${timePassed.minutes}m`
    : "No Data";

  if (isSmallScreen) {
    return (
      <Box m="20px">
        <Box height="400px">
          <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
          <Box>
            {devices.map((device) => (
              <Button
                key={device}
                variant={device === selectedDevice ? "contained" : "outlined"}
                color="primary"
                onClick={() => setSelectedDevice(device)}
                sx={{
                  mr: "10px",
                  color: device === selectedDevice ? colors.primary[500] : colors.grey[100],
                  backgroundColor: device === selectedDevice ? colors.greenAccent[500] : colors.primary[400],
                  borderColor: colors.grey[100],
                  "&:hover": {
                    backgroundColor: device === selectedDevice ? colors.greenAccent[600] : colors.primary[900],
                    color: colors.grey[300],
                  },
                  width: "170px", // Fixes the width of each button
                  height: "30px", // Optionally adjust the height
                }}
              >
                Sensor {device}
              </Button>
            ))}
          </Box>
          <Chart isDashboard={true} data={data} />
        </Box>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>

      <Box m="20px">
        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
          <Box>
            <Button
              onClick={downloadAll} // Add onClick event
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

        {/* DEVICE BUTTONS */}
        <Box
          display="flex"
          flexWrap="wrap"
          gap="10px"  // Adds spacing between buttons
          justifyContent="flex-start"  // Aligns buttons to the start
          sx={{
            "& > *": { // Makes all buttons the same size
              minWidth: "120px", // Adjust width to desired size
            },
            mb: "20px", // Adds margin below the button group
            mt: "20px"
          }}
        >
          {devices.map((device) => (
            <Button
              key={device}
              variant={device === selectedDevice ? "contained" : "outlined"}
              color="primary"
              onClick={() => setSelectedDevice(device)}

              sx={{
                mr: "10px",
                color: device === selectedDevice ? colors.primary[500] : colors.grey[100],
                backgroundColor: device === selectedDevice ? colors.greenAccent[500] : colors.primary[400],
                borderColor: colors.grey[100],
                "&:hover": {
                  backgroundColor: device === selectedDevice ? colors.greenAccent[600] : colors.primary[900],
                  color: colors.grey[300],
                },
                width: "170px", // Fixes the width of each button
                height: "30px", // Optionally adjust the height
              }}
            >
            Sensor {device}
            </Button>
          ))}
        </Box>

        {/* GRID & CHARTS */}
        <Box
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          gridAutoRows="120px"
          gap="20px"
          mt="20px"
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
              subtitle="Temperatura"
              progress={lastTemperature !== null ? (lastTemperature / 10).toFixed(2) : 0}
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
              subtitle="Carga microbiana"
              progress={lastMicrobialLoad !== null ? (lastMicrobialLoad / 5).toFixed(2) : 0}

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
              subtitle="Notificações"
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
              subtitle="Tempo passado"
              icon={
                <AccessTimeIcon
                  sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                />
              }
            />
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
                <IconButton onClick={downloadExcel}>
                  <DownloadOutlinedIcon
                    sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                  />
                </IconButton>
              </Box>
            </Box>
            <Box height="250px" m="-20px 0 0 0">
              <Chart isDashboard={true} data={data} />
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
              borderBottom={`2px solid ${colors.primary[400]}`}
              colors={colors.grey[100]}
              p="15px"
            >
              <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Recent Measurements
              </Typography>
            </Box>
            {data.length > 0 && data[0].data.length > 0 && data[0].data.slice(-10).map((measurement) => (
              <Box
                key={`${measurement.x}-${measurement.y}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottom={`3px solid ${colors.primary[400]}`}
                p="10px"
              >
                <Box>
                  <Typography
                    color={colors.greenAccent[500]}
                    variant="h5"
                    fontWeight="600"
                  >
                    {selectedDevice}
                  </Typography>
                  <Typography color={colors.grey[100]}>
                    {formatTimestamp(measurement.x)}
                  </Typography>
                </Box>
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
    </LocalizationProvider>
  );
};

export default Dashboard;
