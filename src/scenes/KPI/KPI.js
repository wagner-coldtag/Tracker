import { Typography, Grid, useMediaQuery, useTheme, Box, Tabs, Tab } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { subDays } from "date-fns";
import React, { useMemo ,useState} from "react";
import AlarmBar from "./AlarmBar";
import PiePlot from "./PieChart";
import SensorAccordion from "./SensorAccordion";
import useAlarmData from "./useAlarmData";
import useAverageResolutionTime from "./useAverageResolutionTIme";
import useTemperatureStatusData from "./useTemperatureStatus";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import useFetchSensorData from "../dashboard/utils/useFetchSensorData";

const KPI = () => {
  const [startDate, setStartDate] = useState(subDays(new Date(), 7)); // default: last 7 days
  const [endDate, setEndDate] = useState(new Date());
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { types, selectedType, setFilteredSensors, devices, setSelectedType, filteredSensors } = useFetchSensorData();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    
  const handleTabChange = (event, newValue) => {
    setSelectedType(newValue);
    const sensorsForType = devices.filter((device) => device.type === newValue);
    setFilteredSensors(sensorsForType);
  };
  const allNotifications = useMemo(() => filteredSensors.flatMap(s => s.notifications || []), [filteredSensors]);
  const globalAlarmData = useAlarmData(allNotifications, startDate, endDate);
  const globalStatusData = useTemperatureStatusData(allNotifications, startDate, endDate);
  const globalResolutionData = useAverageResolutionTime(allNotifications, startDate, endDate);

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="INDICADORES" subtitle="Análise de indicadores" />
      </Box>
      <Tabs
        value={selectedType || false}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        sx={{
          marginBottom: "20px",
          marginTop: "-20px",
          backgroundColor: colors.primary[400],
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
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box display="flex" gap={2} mb={2}>
          <DatePicker
            label="Data de Início"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            maxDate={endDate}
            sx={{
              backgroundColor: colors.primary[400],
              "& .MuiInputBase-root": { fontSize: "0.9rem" },
              "& .MuiFormLabel-root": { fontSize: "0.8rem" },
              "& .MuiSvgIcon-root": { fontSize: "1rem" },
            }}
          />
          <DatePicker
            label="Data de fim"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            minDate={startDate}
            sx={{
              backgroundColor: colors.primary[400],
              "& .MuiInputBase-root": { fontSize: "0.9rem" },
              "& .MuiFormLabel-root": { fontSize: "0.8rem" },
              "& .MuiSvgIcon-root": { fontSize: "1rem" },
            }}
          />
        </Box>
      </LocalizationProvider>
              
      <Grid container spacing={4} >
        <Grid item xs={12} md={4}>
          <AlarmBar data={globalAlarmData} title="Alarmes por dia" barColor="rgba(42,180,234,0.6)" />
        </Grid>
        <Grid item xs={12} md={4}>
          <AlarmBar
            data={globalResolutionData}
            title="Tempo de resolução"
            barColor="rgba(42,180,234,0.6)"
            dataKey="avgMinutes"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PiePlot data={globalStatusData} title="Status de temperatura" />
        </Grid>

      </Grid>
      <Typography variant="h6" gutterBottom color="text.secondary" mt={4}>
                Indicadores por Sensor
      </Typography>
      {filteredSensors.map((sensor ) => {
        return (
          <SensorAccordion
            key={sensor.id || sensor.device_id}
            sensor={sensor}
            startDate={startDate}
            endDate={endDate}
            theme={theme}
          />
        );
      })}
    </Box>
  );
};

export default KPI;