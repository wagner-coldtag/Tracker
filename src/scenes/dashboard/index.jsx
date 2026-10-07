import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Skeleton,
  GlobalStyles,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import React from "react";
import { useNavigate } from "react-router-dom";
import SensorCard from "./utils/SensorCard";
import useFetchSensorData from "./utils/useFetchSensorData";
import Header from "../../components/Header";
import { tokens } from "../../theme";

// colors.blueAccent[500] is the brand blue and is identical in both
// light/dark mode (it's the anchor of the scale). A two-stop gradient
// needs a *fixed* second stop though — blueAccent[700] flips from a deep
// blue in dark mode to a pale tint in light mode (by design, so text/icons
// keep contrast against the page), which would make a gradient look wrong
// in light mode. So the deep stop below is intentionally not read from the
// mode-reversing token scale.
const GRADIENT_DEEP_BLUE = "#0B63C4"; // = theme.js blueAccent[700] (dark mode)

const SKELETON_COUNT = 8;

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    filteredSensors,
    setFilteredSensors,
    types,
    selectedType,
    setSelectedType,
    devices,
    selectedDevice,
    setSelectedDevice,
  } = useFetchSensorData();

  const isLoading = !devices || devices.length === 0;

  const getSensorsForType = React.useCallback(
    (type) =>
      type === "Sem Local"
        ? devices.filter((device) => !device.type)
        : devices.filter((device) => device.type === type),
    [devices]
  );

  const handleTabChange = (event, newValue) => {
    setSelectedType(newValue);
    setSelectedDevice(null);
    setFilteredSensors(getSensorsForType(newValue));
  };

  // Land on the first available category automatically instead of showing
  // a blank page when nothing is selected yet.
  React.useEffect(() => {
    if (!selectedType && types && types.length > 0 && devices && devices.length > 0) {
      const firstType = types[0];
      setSelectedType(firstType);
      setFilteredSensors(getSensorsForType(firstType));
    }
  }, [types, devices, selectedType, getSensorsForType, setSelectedType, setFilteredSensors]);

  const handleCardClick = (sensor) => {
    localStorage.setItem("selectedDevice", JSON.stringify(sensor));
    navigate(`/sensor/${sensor.device_id}`);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <GlobalStyles
        styles={{
          "@keyframes pulseDot": {
            "0%": { transform: "scale(1)", opacity: 0.7 },
            "100%": { transform: "scale(2.4)", opacity: 0 },
          },
        }}
      />

      <Box m="20px">
        {/* HEADER */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          mb={1}
        >
          <Header title="DASHBOARD"  />

          {!isLoading && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: isDark ? `${colors.blueAccent[500]}26` : colors.blueAccent[900],
                color: isDark ? colors.blueAccent[500] : colors.blueAccent[100],
                borderRadius: 999,
                px: 2,
                py: 0.9,
              }}
            >
              <Box sx={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: colors.blueAccent[500] }} />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    bgcolor: colors.blueAccent[500],
                    animation: "pulseDot 1.6s ease-out infinite",
                  }}
                />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                {devices.length} {devices.length === 1 ? "sensor monitorado" : "sensores monitorados"}
              </Typography>
            </Box>
          )}
        </Box>

        {isLoading ? (
          <Box sx={{ mt: 2 }}>
            <Skeleton
              variant="rounded"
              width={isSmallScreen ? "100%" : 320}
              height={44}
              sx={{ borderRadius: 999, mb: 3 }}
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 2,
              }}
            >
              {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
                <Skeleton key={idx} variant="rounded" height={140} sx={{ borderRadius: 3 }} />
              ))}
            </Box>
          </Box>
        ) : (
          <>
            <Tabs
              value={selectedType || false}
              onChange={handleTabChange}
              variant={isSmallScreen ? "scrollable" : "standard"}
              scrollButtons={isSmallScreen ? "auto" : false}
              TabIndicatorProps={{ style: { display: "none" } }}
              sx={{
                mb: 3,
                minHeight: 0,
                width: { xs: "100%", sm: "fit-content" },
                maxWidth: "100%",
                bgcolor: colors.primary[400],
                borderRadius: 999,
                p: 0.6,
                "& .MuiTabs-flexContainer": { gap: 0.5 },
                "& .MuiTab-root": {
                  minHeight: 0,
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  px: 2.5,
                  py: 1,
                  color: colors.grey[300],
                  transition: "background-color 0.2s ease, color 0.2s ease",
                },
                "& .MuiTab-root.Mui-selected": {
                  color: "#fff",
                  background: `linear-gradient(135deg, ${colors.blueAccent[500]} 0%, ${GRADIENT_DEEP_BLUE} 100%)`,
                },
              }}
            >
              {types.map((type) => (
                <Tab key={type} label={type} value={type} />
              ))}
            </Tabs>

            {selectedType === null ? null : filteredSensors.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: colors.grey[300],
                }}
              >
                <Typography variant="body1">Nenhum sensor encontrado nesta categoria.</Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 2,
                }}
              >
                {filteredSensors.map((sensor) => (
                  <SensorCard
                    key={sensor.device_id}
                    sensor={sensor}
                    isSelected={sensor.device_id === selectedDevice?.device_id}
                    onClick={() => handleCardClick(sensor)}
                  />
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default Dashboard;
