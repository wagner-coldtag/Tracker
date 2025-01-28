import React from "react";
import { Box, useTheme, useMediaQuery, Tabs, Tab, CircularProgress } from "@mui/material";
import Header from "../../components/Header";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import useFetchSensorData from "./utils/useFetchSensorData";
import SensorCard from "./utils/SensorCard";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();  // Use navigate to programmatically change routes
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Check if the screen is small
  const { isLoading, filteredSensors, setFilteredSensors, types, selectedType, setSelectedType, devices, selectedDevice, setSelectedDevice } = useFetchSensorData();

  const handleTabChange = (event, newValue) => {
    setSelectedType(newValue);
    setSelectedDevice(null);
    const sensorsForType = devices.filter((device) => device.type === newValue);
    setFilteredSensors(sensorsForType);
  };

  const handleCardClick = (sensor) => {
    localStorage.setItem("selectedDevice", JSON.stringify(sensor));
    navigate(`/sensor/${sensor.device_id}`);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box m="20px">
        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title="DASHBOARD" subtitle="Análise de sensores" />

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
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {filteredSensors.map((sensor) => (
                <SensorCard
                  key={sensor.device_id}
                  sensor={sensor}
                  isSelected={sensor.device_id === selectedDevice?.device_id}
                  onClick={() => handleCardClick(sensor)}  // Click redirects to sensor page
                />
              ))}
            </Box>
            {isLoading ? (
              <Box gridColumn="span 12" display="flex" justifyContent="center" alignItems="center">
                <CircularProgress color="inherit" />
              </Box>
            ) : <>
            </>}

          </div>
        }
      </Box>
    </LocalizationProvider>
  );
};

export default Dashboard;