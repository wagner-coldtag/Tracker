import React, { useState, useEffect } from "react";
import { Box, Button, useTheme, IconButton, CircularProgress } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import SignalWifi4BarIcon from "@mui/icons-material/SignalWifi4Bar";
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
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import * as XLSX from "xlsx"; // Import xlsx


const RSSI = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [startDate, setStartDate] = useState(() => {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 1);  // Subtract one month
    return currentDate;
  });  const [endDate, setEndDate] = useState(new Date());

  const downloadExcel = () => {
    if (data.length === 0) return;

    const worksheetData = data[0].data.map((item) => ({
      Timestamp: formatTimestamp(item.x),
      RSSI: item.y,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RSSIData");

    XLSX.writeFile(workbook, "RSSI_report.xlsx");
  };

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true); // Start loading

        const response = await fetch("https://08mwl5gxyj.execute-api.sa-east-1.amazonaws.com/devices");
        if (!response.ok) throw new Error("Network response was not ok");
        const jsonData = await response.json();

        const fetchedDevices = jsonData.device_ids;

        setDevices(fetchedDevices);
        if (fetchedDevices.length > 0) setSelectedDevice(fetchedDevices[0]);
      } catch (error) {
        console.error("Error fetching devices:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchDevices(); // Fetch devices initially
  }, []);

  // Fetch RSSI data for the selected device and date range
  useEffect(() => {
    const fetchPackageData = async () => {
      if (!selectedDevice) return; // Don't fetch if no device is selected
      setLoading(true); // Start loading

      try {
        const response = await fetch(`https://08mwl5gxyj.execute-api.sa-east-1.amazonaws.com/device-data?company=CompanyA&device_id=${selectedDevice}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const jsonData = await response.json();
        const sortedData = jsonData.sort((a, b) => a.timestamp - b.timestamp);

        // Format data with date filtering
        const formatData = (deviceData) => {
          return [
            {
              id: "RSSI",
              color: "hsl(45, 70%, 50%)",
              data: deviceData
                .filter(item => item.timestamp && !isNaN(item.timestamp))
                .filter(item => {
                  // Filter by start and end date
                  const itemDate = new Date(item.timestamp * 1000);
                  return itemDate >= startDate && itemDate <= endDate;
                })
                .map(item => ({
                  x: item.timestamp,
                  y: item.RSSI,
                  formattedX: formatTimestamp(item.timestamp),
                }))
            }
          ];
        };

        setData(formatData(sortedData.filter(item => item.device_id === selectedDevice)));
      } catch (error) {
        console.error("Error fetching Packages data:", error);
      } finally {
        setLoading(false); // Start loading

      }
    };

    fetchPackageData(); // Call to fetch RSSI data
    const intervalId = setInterval(fetchPackageData, 60000); // Fetch data every 60 seconds
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [selectedDevice, startDate, endDate]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const lastRSSI = data.length > 0 && data[0]?.data.length > 0
    ? data[0].data[data[0].data.length - 1]?.y?.toFixed(1)
    : 0;
  const transformedData = data[0]?.data.map((tempPoint) => {
    const time = tempPoint.x * 1000; // Keep `time` as a numeric timestamp in milliseconds
    const RSSI = typeof tempPoint.y === "number" ? tempPoint.y : 0;
    return { time, RSSI };
  }) || [];



  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box m="20px">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title="ANÁLISE DE RSSI" subtitle="Panorama geral do RSSI (Received Signal Strength Indication)" />
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
            mt: "20px",
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

        <Box mt="20px"
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          gridAutoRows="140px"
          gap="20px"
        >
          {loading ? (
            <Box gridColumn="span 12" display="flex" justifyContent="center" alignItems="center">
              <CircularProgress color="inherit" />
            </Box>
          ) : (
            <><Box
              gridColumn="span 3"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <StatBox
                title={lastRSSI !== null ? `${lastRSSI} dBm` : "No Data"}
                subtitle="Último valor"
                progress={lastRSSI !== null ? (lastRSSI / 10).toFixed(2) : 0}
                increase={lastRSSI > 10 ? "Normal" : "Baixo"}
                icon={<SignalWifi4BarIcon sx={{ fontSize: "26px" }} />} />
            </Box><Box
              gridColumn="span 9"
              backgroundColor={colors.primary[400]}
              p="20px"
              height="260px"
              position="relative"
            >
              <Box position="absolute" top={5} right={5}>
                <Box>
                  <IconButton onClick={downloadExcel} // Add onClick event
                  >
                    <DownloadOutlinedIcon
                      sx={{ fontSize: "26px", color: colors.greenAccent[500] }} />
                  </IconButton>
                </Box>
              </Box>
              <Box>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={transformedData} margin={{ top: 20, right: 0, bottom: 50, left: 20 }}>
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
                    <YAxis
                      yAxisId="left"
                      label={{ value: "RSSI (dBm)", angle: -90, fill: colors.grey[100], dx: -40 }}
                      stroke={colors.grey[100]}
                      tick={{ fill: colors.grey[100] }}
                      axisLine={{ stroke: colors.grey[600] }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: colors.primary[500], color: colors.grey[300] }}
                      labelStyle={{ color: "white" }}
                      itemStyle={{ color: "white" }}
                      labelFormatter={(label) => {
                        const date = new Date(label).toLocaleDateString();
                        const time = new Date(label).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                        return `${date}, ${time}`; // Combine date and time
                      } } />
                    <Legend
                      wrapperStyle={{ color: colors.grey[100] }}
                      itemStyle={{ color: colors.grey[100] }}
                      iconSize={12} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="RSSI"
                      stroke={colors.greenAccent[500]}
                      strokeWidth={2}
                      dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box></>
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default RSSI;
