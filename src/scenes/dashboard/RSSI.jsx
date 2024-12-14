import React, { useState, useEffect } from "react";
import { Box, Button, useTheme, IconButton, CircularProgress, FormControl, MenuItem, Select, useMediaQuery } from "@mui/material";
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
  const [loading, setLoading] = useState(true);
  const isWideScreen = useMediaQuery((theme) => theme.breakpoints.up("md")); // 'md' corresponds to medium screens (960px and up)

  const [startDate, setStartDate] = useState(() => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 2);  // Subtract 2 days
    return currentDate;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [selectedMetric, setSelectedMetric] = useState("RSSI");
  const getUnitForMetric = (metric) => {
    const metricUnits = {
      RSSI: "dBm",
      voltage: "V",
      count: "",
    };
    return metricUnits[metric] || ""; // Default to empty string if the metric is not found
  };

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
        const startTimestamp = Math.floor(startDate.getTime() / 1000);
        const endTimestamp = Math.floor(endDate.getTime() / 1000);
        const response = await fetch(
          `https://08mwl5gxyj.execute-api.sa-east-1.amazonaws.com/device-data?company=CompanyA&device_id=${selectedDevice}&start_date=${startTimestamp}&end_date=${endTimestamp}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const jsonData = await response.json();
        console.log(jsonData);
        const sortedData = jsonData.sort((a, b) => a.timestamp - b.timestamp);

        const formatData = (deviceData, selectedMetric) => {
          return [
            {
              id: {selectedMetric},
              color: "hsl(45, 70%, 50%)",
              data: deviceData
                .filter(item => item.timestamp && !isNaN(item.timestamp))
                .map(item => ({
                  x: item.timestamp,
                  y: item[selectedMetric],
                  formattedX: formatTimestamp(item.timestamp),
                }))
            }
          ];
        };

        setData(formatData(sortedData, selectedMetric));
      } catch (error) {
        console.error("Error fetching Packages data:", error);
      } finally {
        setLoading(false); // Start loading

      }
    };

    fetchPackageData();
    const intervalId = setInterval(fetchPackageData, 60000);
    return () => clearInterval(intervalId);
  }, [selectedDevice, startDate, endDate, selectedMetric]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const transformedData =
    data[0]?.data.map((tempPoint) => {
      const time = tempPoint.x * 1000; // Keep time as a numeric timestamp in milliseconds
      const value = typeof tempPoint.y === "number" ? tempPoint.y : 0;
      return { time, value };
    }) || [];

  const lastValue = transformedData.length > 0 ? transformedData[transformedData.length-1]?.value?.toFixed(0) : "N/A";

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box m="20px">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title="SENSORES" subtitle="Panorama geral dos Sensores" />
        </Box>
        <Box
          display="flex"
          flexWrap="wrap" // Allows items to wrap to the next line
          alignItems="center"
          gap="10px" // Adds spacing between items
          mb="20px"
        >
          <FormControl style={{ minWidth: "150px" }}>
            <Select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              <MenuItem value="RSSI">RSSI</MenuItem>
              <MenuItem value="voltage">Tensão</MenuItem>
              <MenuItem value="count">Pacotes</MenuItem>
            </Select>
          </FormControl>

          <DateTimePicker
            label="Início"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
          />

          <DateTimePicker
            label="Fim"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
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
            <>{isWideScreen && (
              <Box
                gridColumn="span 3"
                backgroundColor={colors.primary[400]}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <StatBox
                  title={
                    lastValue !== null
                      ? `${lastValue} ${getUnitForMetric(selectedMetric)}`
                      : "No Data"
                  }
                  subtitle="Valor atual"
                  progress={lastValue !== null ? (lastValue / 10).toFixed(2) : 0}
                  icon={<SignalWifi4BarIcon sx={{ fontSize: "26px" }} />}
                />
              </Box>
            )}

            <Box
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
                      label={{
                        value: selectedMetric === "RSSI" ? "RSSI (dBm)" :
                          selectedMetric === "voltage" ? "Tensão (V)" :
                            selectedMetric === "count" ? "Pacotes" : "",
                        angle: -90,
                        fill: colors.grey[100],
                        dx: -40,
                      }}
                      stroke={colors.grey[100]}
                      tick={{ fill: colors.grey[100] }}
                      axisLine={{ stroke: colors.grey[600] }}
                    />
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
                      dataKey="value"
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
