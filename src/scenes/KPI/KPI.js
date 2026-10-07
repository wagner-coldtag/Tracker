import ClearAll from "@mui/icons-material/ClearAll";
import NotificationsActive from "@mui/icons-material/NotificationsActive";
import Sensors from "@mui/icons-material/Sensors";
import WarningAmber from "@mui/icons-material/WarningAmber";
import {
  Box,
  Button,
  GlobalStyles,
  Skeleton,
  Tab,
  Tabs,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import React, { useMemo, useState } from "react";
import AlarmBar from "./AlarmBar";
import PiePlot from "./PieChart";
import SensorAccordion from "./SensorAccordion";
import useAlarmData from "./useAlarmData";
import useAverageResolutionTime from "./useAverageResolutionTIme";
import useTemperatureStatusData from "./useTemperatureStatus";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import DateRangePicker from "../dashboard/utils/DataRangePicker";
import useFetchSensorData from "../dashboard/utils/useFetchSensorData";

// Fixed second stop for the selected-tab gradient (same as Dashboard)
const GRADIENT_DEEP_BLUE = "#0B63C4";
const SKELETON_COUNT = 8;

const isValidLimit = (v) => v !== undefined && v !== null && v !== "" && !Number.isNaN(Number(v));

/* ---------- Small presentational helpers ---------- */

const StatCard = ({ icon, label, value, color, colors }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      p: 2,
      borderRadius: 3,
      backgroundColor: colors.primary[400],
      border: `1px solid ${colors.grey[700]}`,
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: alpha(color, 0.15),
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: colors.grey[300] }}>
        {label}
      </Typography>
      <Typography variant="h4" fontWeight="bold" noWrap sx={{ color, lineHeight: 1.2 }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const CompactSensorCard = ({ sensor, isSelected, onClick, colors }) => {
  const okColor = colors.blueAccent[500];
  const alertColor = colors.alert;

  const temp = parseFloat(sensor.last_temperature);
  const hasTemp = !Number.isNaN(temp);
  const isOut =
    hasTemp &&
    ((isValidLimit(sensor.maxTemp) && temp > Number(sensor.maxTemp)) ||
      (isValidLimit(sensor.minTemp) && temp < Number(sensor.minTemp)));
  const statusColor = isOut ? alertColor : okColor;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        px: 2,
        py: 1.25,
        borderRadius: 3,
        cursor: "pointer",
        backgroundColor: colors.primary[400],
        border: `1px solid ${colors.grey[700]}`,
        borderLeft: `4px solid ${statusColor}`,
        boxShadow: isSelected ? `0 0 0 2px ${statusColor}` : "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: isSelected
            ? `0 0 0 2px ${statusColor}, 0 6px 16px rgba(0,0,0,0.12)`
            : "0 6px 16px rgba(0,0,0,0.12)",
        },
      }}
    >
      <Typography variant="h6" fontWeight="bold" noWrap>
        {sensor.name || `Sensor ${sensor.device_id}`}
      </Typography>
      <Typography variant="h5" fontWeight="bold" sx={{ color: statusColor, flexShrink: 0 }}>
        {hasTemp ? `${Math.trunc(temp * 10) / 10}°C` : "--"}
      </Typography>
    </Box>
  );
};

// Rounded card that wraps the existing chart components
const ChartCard = ({ colors, children }) => (
  <Box
    sx={{
      borderRadius: 3,
      backgroundColor: colors.primary[400],
      border: `1px solid ${colors.grey[700]}`,
      overflow: "hidden",
      p: 1,
    }}
  >
    {children}
  </Box>
);

/* ---------- Page ---------- */

const KPI = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";
  const okColor = colors.blueAccent[500];
  const alertColor = colors.alert;
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [startDate, setStartDate] = useState(subDays(new Date(), 7)); // default: last 7 days
  const [endDate, setEndDate] = useState(new Date());
  const [selectedIds, setSelectedIds] = useState([]); // empty = all sensors of the tab

  const {
    types,
    selectedType,
    setSelectedType,
    setFilteredSensors,
    devices,
    filteredSensors,
  } = useFetchSensorData();

  const isLoading = !devices || devices.length === 0;

  /* ----- Tabs (same behavior as Dashboard) ----- */
  const getSensorsForType = React.useCallback(
    (type) =>
      type === "Sem Local"
        ? devices.filter((device) => !device.type)
        : devices.filter((device) => device.type === type),
    [devices]
  );

  const handleTabChange = (event, newValue) => {
    setSelectedType(newValue);
    setSelectedIds([]);
    setFilteredSensors(getSensorsForType(newValue));
  };

  React.useEffect(() => {
    if (!selectedType && types && types.length > 0 && devices && devices.length > 0) {
      const firstType = types[0];
      setSelectedType(firstType);
      setFilteredSensors(getSensorsForType(firstType));
    }
  }, [types, devices, selectedType, getSensorsForType, setSelectedType, setFilteredSensors]);

  /* ----- Sensor selection (acts as a filter) ----- */
  const toggleSensor = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const visibleSensors = useMemo(
    () =>
      selectedIds.length === 0
        ? filteredSensors
        : filteredSensors.filter((s) => selectedIds.includes(s.device_id)),
    [filteredSensors, selectedIds]
  );

  /* ----- Data for the charts (same hooks as before, now following the selection) ----- */
  const allNotifications = useMemo(
    () => visibleSensors.flatMap((s) => s.notifications || []),
    [visibleSensors]
  );
  const globalAlarmData = useAlarmData(allNotifications, startDate, endDate);
  const globalStatusData = useTemperatureStatusData(allNotifications, startDate, endDate);
  const globalResolutionData = useAverageResolutionTime(allNotifications, startDate, endDate);

  /* ----- Summary numbers ----- */
  const { alertsInPeriod, pendingInPeriod } = useMemo(() => {
    const startSec = new Date(startDate).getTime() / 1000;
    const endSec = new Date(endDate).getTime() / 1000;
    const inPeriod = allNotifications.filter((n) => {
      const t = Number(n.details?.triggeredAt);
      return t >= startSec && t <= endSec;
    });
    return {
      alertsInPeriod: inPeriod.length,
      pendingInPeriod: inPeriod.filter((n) => !n.details?.solved).length,
    };
  }, [allNotifications, startDate, endDate]);

  const chartColor = alpha(okColor, 0.75);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <GlobalStyles
        styles={{
          "@keyframes pulseDot": {
            "0%": { transform: "scale(1)", opacity: 0.7 },
            "100%": { transform: "scale(2.4)", opacity: 0 },
          },
        }}
      />

      <Box m="20px" display="flex" flexDirection="column" gap={3}>
        {/* HEADER */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Header title="INDICADORES"  mb={0} />

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
                <Box
                  sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: colors.blueAccent[500] }}
                />
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
                {devices.length}{" "}
                {devices.length === 1 ? "sensor monitorado" : "sensores monitorados"}
              </Typography>
            </Box>
          )}
        </Box>

        {isLoading ? (
          <Box>
            <Skeleton
              variant="rounded"
              width={isSmallScreen ? "100%" : 320}
              height={44}
              sx={{ borderRadius: 999, mb: 3 }}
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 1.5,
              }}
            >
              {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
                <Skeleton key={idx} variant="rounded" height={56} sx={{ borderRadius: 3 }} />
              ))}
            </Box>
          </Box>
        ) : (
          <>
            {/* TABS */}
            <Tabs
              value={selectedType || false}
              onChange={handleTabChange}
              variant={isSmallScreen ? "scrollable" : "standard"}
              scrollButtons={isSmallScreen ? "auto" : false}
              TabIndicatorProps={{ style: { display: "none" } }}
              sx={{
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
              {(types ?? []).map((type) => (
                <Tab key={type} label={type} value={type} />
              ))}
            </Tabs>

            {selectedType === null ? null : filteredSensors.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6, color: colors.grey[300] }}>
                <Typography variant="body1">Nenhum sensor encontrado nesta categoria.</Typography>
              </Box>
            ) : (
              <>
                {/* SENSOR FILTER CARDS */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      mb: 1,
                      minHeight: 30,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: colors.grey[300] }}>
                      {selectedIds.length === 0
                        ? "Mostrando todos os sensores. Clique para filtrar."
                        : `${selectedIds.length} de ${filteredSensors.length} sensores selecionados`}
                    </Typography>
                    {selectedIds.length > 0 && (
                      <Button
                        size="small"
                        startIcon={<ClearAll />}
                        onClick={() => setSelectedIds([])}
                        sx={{ color: okColor, textTransform: "none", fontWeight: 600 }}
                      >
                        Limpar seleção
                      </Button>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: 1.5,
                    }}
                  >
                    {filteredSensors.map((sensor) => (
                      <CompactSensorCard
                        key={sensor.device_id}
                        sensor={sensor}
                        colors={colors}
                        isSelected={selectedIds.includes(sensor.device_id)}
                        onClick={() => toggleSensor(sensor.device_id)}
                      />
                    ))}
                  </Box>
                </Box>

                {/* PERIOD */}
                <DateRangePicker
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                />

                {/* SUMMARY */}
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                  }}
                >
                  <StatCard
                    colors={colors}
                    color={okColor}
                    icon={<Sensors />}
                    label="Sensores analisados"
                    value={visibleSensors.length}
                  />
                  <StatCard
                    colors={colors}
                    color={alertsInPeriod > 0 ? alertColor : okColor}
                    icon={<WarningAmber />}
                    label="Alertas no período"
                    value={alertsInPeriod}
                  />
                  <StatCard
                    colors={colors}
                    color={pendingInPeriod > 0 ? alertColor : okColor}
                    icon={<NotificationsActive />}
                    label="Alertas pendentes"
                    value={pendingInPeriod}
                  />
                </Box>

                {/* GLOBAL CHARTS */}
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                  }}
                >
                  <ChartCard colors={colors}>
                    <AlarmBar data={globalAlarmData} title="Alarmes por dia" barColor={chartColor} />
                  </ChartCard>
                  <ChartCard colors={colors}>
                    <AlarmBar
                      data={globalResolutionData}
                      title="Tempo de resolução"
                      barColor={chartColor}
                      dataKey="avgMinutes"
                    />
                  </ChartCard>
                  <ChartCard colors={colors}>
                    <PiePlot data={globalStatusData} title="Status de temperatura" />
                  </ChartCard>
                </Box>

                
              </>
            )}
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default KPI;