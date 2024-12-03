import React from "react";
import { Box, Button, IconButton, Typography, useTheme, useMediaQuery, Tabs, Tab, CircularProgress } from "@mui/material";
import { tokens } from "../../theme";
import { Link } from "react-router-dom";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Header from "../../components/Header";
import Chart from "../../components/LineChart";
import RefreshIcon from "@mui/icons-material/Refresh";
import StatBox from "../../components/StatBox";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import CoronavirusIcon from "@mui/icons-material/Coronavirus";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import DateRangePicker from "./utils/DataRangePicker";
import useFetchSensorData from "./utils/useFetchSensorData";
import dashboardStyles from "./styles"; // Import the styles

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const styles = dashboardStyles(colors);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Check if the screen is small
  const { isLoading, filteredSensors, setFilteredSensors, types, selectedType, setSelectedType, data, downloadAll, downloadExcel, devices, selectedDevice, setSelectedDevice, startDate, formatTimestamp, setStartDate, endDate, setEndDate, refreshDevices } = useFetchSensorData();

  const handleTabChange = (event, newValue) => {
    setSelectedType(newValue);
    setSelectedDevice(null);
    const sensorsForType = devices.filter((device) => device.type === newValue);
    setFilteredSensors(sensorsForType);
  };

  const lastTemperature = data.length > 0 && data[0]?.data.length > 0
    ? data[0].data[data[0].data.length - 1]?.y?.toFixed(1)
    : 0;
  const temperatureColor = lastTemperature > 10 ? colors.redAccent[400] : "rgb(42, 180, 234)";

  const lastMicrobialLoad = data.length > 1 && data[1]?.data.length > 0
    ? data[1].data[data[1].data.length - 1]?.y?.toFixed(1)
    : 0;

  const microbialColor = lastMicrobialLoad > 5 ? colors.redAccent[400] :  "rgb(42, 180, 234)";
  const highTemperatureMeasurements = data.length > 0
    ? data[0].data.filter(item => item.y > 10).length
    : 0;


  let timePassed = "No Data";

  if (data[0]?.data.length > 1) {
    const firstTimestamp = data[0].data[0].x * 1000; // Convert to milliseconds
    const lastTimestamp = data[0].data[data[0].data.length - 1].x * 1000; // Convert to milliseconds

    const timeDifference = lastTimestamp - firstTimestamp; // Time difference in milliseconds

    const minutesPassed = Math.floor(timeDifference / 60000);
    const hoursPassed = Math.floor(timeDifference / 3600000);
    const daysPassed = Math.floor(timeDifference / 86400000);

    if (timeDifference < 3600000) {
      const secondsPassed = Math.floor((timeDifference % 60000) / 1000);
      timePassed = `${minutesPassed} m ${secondsPassed} s`;
    } else if (timeDifference < 86400000) {
    // Less than 1 day, display hours and minutes
      const remainingMinutes = Math.floor((timeDifference % 3600000) / 60000);
      timePassed = `${hoursPassed} h ${remainingMinutes} m`;
    } else {
    // 1 day or more, display days and hours
      timePassed = `${daysPassed} d`;
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box m="20px">
        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title="DASHBOARD" subtitle="Análise de sensores" />
          {selectedDevice && (!isSmallScreen && (
            <Box display="flex" alignItems="center" gap="10px">
              <IconButton onClick={refreshDevices} sx={styles.iconButton}>
                <RefreshIcon />
              </IconButton>
              <IconButton onClick={downloadAll} sx={styles.iconButton}>
                <DownloadOutlinedIcon />
              </IconButton>
              <DateRangePicker
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
              />
            </Box>
          ))}

        </Box>
        <Tabs
          value={selectedType || false} // Use `false` when `selectedType` is `null`
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            marginBottom: "20px",
            marginTop: "-20px",
            ".MuiTab-root.Mui-selected": {
              color: "rgb(42, 180, 234)", // Selected tab text color
              fontWeight: "bold", // Selected tab font weight
            },
            ".MuiTabs-indicator": {
              backgroundColor: "rgb(42, 180, 234)" // Indicator color
            },
          }}
          variant={isSmallScreen ? "scrollable" : "standard"}
          scrollButtons={isSmallScreen ? "auto" : false}
        >
          {types.map((type) => (
            <Tab key={type} label={type} value={type} />
          ))}
        </Tabs>

        {selectedType === null ? (
          <></>
        ) :
          <div>

            {/* DEVICE BUTTONS */}
            <Box
              display="flex" flexWrap="wrap" gap="10px" justifyContent="flex-start"
              sx={{
                "& > *": {
                  minWidth: "120px", // Adjust width to desired size
                },
                mb: "20px", // Adds margin below the button group
                mt: "20px"
              }}
            >
              {filteredSensors.map((device) => (
                <Button key={device.device_id} color="primary"
                  variant={device.device_id === selectedDevice?.device_id ? "contained" : "outlined"}
                  onClick={() => setSelectedDevice(device)}
                  sx={styles.button(device.device_id === selectedDevice?.device_id)}
                >
            Sensor {device.device_id}
                </Button>
              ))}
            </Box>
            {isLoading ? (
              <Box gridColumn="span 12" display="flex" justifyContent="center" alignItems="center">
                <CircularProgress color="inherit" />
              </Box>
            ) : (
              selectedDevice ? (selectedDevice.productType && selectedDevice.pH && selectedDevice.aw) ? (
                <>
                  <Box
                    display="grid" gridAutoRows="120px" gap="20px"
                    gridTemplateColumns="repeat(12, 1fr)">
                    {!isSmallScreen && (
                      <>    <Box
                        gridColumn="span 2" // Reduced from span 3 to span 2
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor={colors.primary[400]}
                        sx={{ maxHeight: "100px"}}
                      >
                        <StatBox
                          title={lastTemperature !== null ? `${lastTemperature}°C` : "Sem dados"}
                          subtitle="Temperatura"
                          progress={lastTemperature !== null ? (lastTemperature / 10).toFixed(2) : 0}
                          icon={<DeviceThermostatIcon
                            sx={{ color: temperatureColor, fontSize: "26px" }} />}
                          progressColor={temperatureColor} />
                      </Box>    <Box
                        gridColumn="span 2"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor={colors.primary[400]}
                        sx={{ maxHeight: "100px"}}
                      >
                        <StatBox
                          title={lastMicrobialLoad !== null ? `${lastMicrobialLoad}` : "No Data"}
                          subtitle="Contagem"
                          progress={lastMicrobialLoad !== null ? (lastMicrobialLoad / 5).toFixed(2) : 0}
                          icon={<CoronavirusIcon sx={{ color: microbialColor, fontSize: "26px" }} />}
                          progressColor={microbialColor} />
                      </Box><Box
                        gridColumn="span 2"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor={colors.primary[400]}
                        sx={{ maxHeight: "100px"}}
                      >
                        <StatBox
                          title={highTemperatureMeasurements} subtitle="Notificações"
                          icon={<NotificationsActiveIcon
                            sx={{ color:  "rgb(42, 180, 234)", fontSize: "26px" }} />} />
                      </Box><Box
                        gridColumn="span 2"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor={colors.primary[400]}
                        sx={{ maxHeight: "100px"}}
                      >
                        <StatBox
                          title={timePassed} subtitle="Tempo"
                          icon={<AccessTimeIcon sx={{ color:  "rgb(42, 180, 234)", fontSize: "26px" }} />} />
                      </Box></>
                    )}
                    <Box
                      gridColumn={isSmallScreen ? "span 12" : "span 8"} // Full width on small screens
                      gridRow="span 2"
                      backgroundColor={colors.primary[400]}
                      mt="-20px"
                    >
                      <Box mt="5px" p="0 30px" display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center">
                          <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
        Número de leituras:
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" color={"rgb(42, 180, 234)"} ml="5px">
                            {data.length > 0 ? data[0].data.length : 0}
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton onClick={downloadExcel}>
                            <DownloadOutlinedIcon sx={{ fontSize: "26px", color: "rgb(42, 180, 234)" }} />
                          </IconButton>
                        </Box>
                      </Box>
                      <Box height="250px" mt="-20px">
                        <Chart isDashboard={true} data={data} />
                      </Box>
                    </Box>


                    {!isSmallScreen && (
                      <Box
                        gridColumn="span 4"
                        gridRow="span 2"
                        backgroundColor={colors.primary[400]}
                        overflow="auto"
                        sx={{ mt: "-140px" }} // Adjust the margin to reduce space between chart and this box
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          borderBottom={`2px solid ${colors.primary[400]}`}
                          colors={colors.grey[100]}
                          p="15px"
                        >
                          <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
        Medidas Recentes
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
                                color={"rgb(42, 180, 234)"}
                                variant="h5" fontWeight="600"
                              >
                                {selectedDevice?.device_id}
                              </Typography>
                              <Typography color={colors.grey[100]}>
                                {formatTimestamp(measurement.x)}
                              </Typography>
                            </Box>
                            <Box backgroundColor={"rgb(42, 180, 234)"}
                              p="5px 10px" borderRadius="4px"   color="white">
                              {measurement.y.toFixed(1)}°C
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" backgroundColor={colors.primary[400]} p="20px">
                  <Typography variant="h6" color={colors.grey[100]}>
                  Seu sensor ainda não está configurado.{" "}
                    <Link to="/sensor" style={{ color: colors.greenAccent[500], fontWeight: "bold" }}>
                    Configurar sensor.
                    </Link>
                  </Typography>
                </Box>
              ): null)}
            <Box
              display="grid" gridAutoRows="120px" gap="20px" mt="20px"
              gridTemplateColumns="repeat(12, 1fr)">
              {/* ROW 1 */}

            </Box>

          </div>
        }
      </Box>
    </LocalizationProvider>
  );
};

export default Dashboard;