import BatteryFull from "@mui/icons-material/BatteryFull";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Inventory2 from "@mui/icons-material/Inventory2";
import Sensors from "@mui/icons-material/Sensors";
import SignalWifi4Bar from "@mui/icons-material/SignalWifi4Bar";
import Timeline from "@mui/icons-material/Timeline";
import TouchApp from "@mui/icons-material/TouchApp";
import TrendingDown from "@mui/icons-material/TrendingDown";
import TrendingUp from "@mui/icons-material/TrendingUp";
import {
  Box,
  CircularProgress,
  GlobalStyles,
  IconButton,
  Skeleton,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import DateRangePicker from "./utils/DataRangePicker";
import SensorCard from "./utils/SensorCard";
import useFetchSensorData from "./utils/useFetchSensorData";
import Header from "../../components/Header";
import { tokens } from "../../theme";

// Fixed second stop for the selected-tab gradient (same as Dashboard)
const GRADIENT_DEEP_BLUE = "#0B63C4";
const SKELETON_COUNT = 8;

const METRICS = {
  RSSI: { label: "RSSI", unit: "dBm", decimals: 0, icon: <SignalWifi4Bar /> },
  voltage: { label: "Tensão", unit: "V", decimals: 2, icon: <BatteryFull /> },
  count: { label: "Pacotes", unit: "", decimals: 0, icon: <Inventory2 /> },
};

const isValidLimit = (v) => v !== undefined && v !== null && v !== "" && !Number.isNaN(Number(v));

const formatTimestamp = (seconds) => new Date(seconds * 1000).toLocaleString("pt-BR");

const formatTick = (ms) =>
  new Date(ms).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

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

const Panel = ({ title, subtitle, action, colors, children }) => (
  <Box
    sx={{
      borderRadius: 3,
      backgroundColor: colors.primary[400],
      border: `1px solid ${colors.grey[700]}`,
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2.5,
        py: 1.5,
        borderBottom: `1px solid ${colors.grey[700]}`,
      }}
    >
      <Box>
        <Typography variant="h5" fontWeight="600">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: colors.grey[300] }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
    {children}
  </Box>
);

const EmptyState = ({ icon, text, colors }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
      py: 8,
      px: 2,
      textAlign: "center",
      color: colors.grey[300],
    }}
  >
    {React.cloneElement(icon, { sx: { fontSize: 48 } })}
    <Typography variant="h6">{text}</Typography>
  </Box>
);

/* ---------- Page ---------- */
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

const RSSI = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";
  const okColor = colors.blueAccent[500];
  const axisColor = theme.palette.text.secondary;
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    types,
    selectedType,
    setSelectedType,
    devices,
    selectedDevice,
    setSelectedDevice,
    setFilteredSensors,
    filteredSensors,
  } = useFetchSensorData();

  const [points, setPoints] = useState([]); // [{ time (ms), value }]
  const [loadingData, setLoadingData] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("RSSI");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());

  const metric = METRICS[selectedMetric];
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
    setSelectedDevice(null);
    setFilteredSensors(getSensorsForType(newValue));
  };

  React.useEffect(() => {
    if (!selectedType && types && types.length > 0 && devices && devices.length > 0) {
      const firstType = types[0];
      setSelectedType(firstType);
      setFilteredSensors(getSensorsForType(firstType));
    }
  }, [types, devices, selectedType, getSensorsForType, setSelectedType, setFilteredSensors]);

  /* ----- Data fetching ----- */
  useEffect(() => {
    if (!selectedDevice || !startDate || !endDate) {
      setPoints([]);
      return undefined;
    }

    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
    if (Number.isNaN(startTimestamp) || Number.isNaN(endTimestamp)) return undefined;

    let cancelled = false;

    // `silent` = background refresh: no spinner, so the chart doesn't flash every minute
    const fetchPackageData = async (silent) => {
      if (!silent) {
        setLoadingData(true);
        setPoints([]);
      }
      try {
        const response = await fetch(
          `https://08mwl5gxyj.execute-api.sa-east-1.amazonaws.com/device-data?company=CompanyA&device_id=${selectedDevice}&start_date=${startTimestamp}&end_date=${endTimestamp}`
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const jsonData = await response.json();
        if (cancelled) return;

        const next = jsonData
          .filter(
            (item) =>
              item.timestamp &&
              !Number.isNaN(item.timestamp) &&
              item[selectedMetric] !== null &&
              item[selectedMetric] !== undefined &&
              Number.isFinite(Number(item[selectedMetric]))
          )
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((item) => ({ time: item.timestamp * 1000, value: Number(item[selectedMetric]) }));

        setPoints(next);
      } catch (error) {
        console.error("Error fetching package data:", error);
      } finally {
        if (!cancelled && !silent) setLoadingData(false);
      }
    };

    fetchPackageData(false);
    const intervalId = setInterval(() => fetchPackageData(true), 60000);
    return () => {
      cancelled = true; // ignore late responses from a previous device/range/metric
      clearInterval(intervalId);
    };
  }, [selectedDevice, startDate, endDate, selectedMetric]);

  /* ----- Derived values ----- */
  const stats = useMemo(() => {
    if (points.length === 0) return null;
    let sum = 0;
    let low = Infinity;
    let high = -Infinity;
    for (const p of points) {
      sum += p.value;
      if (p.value < low) low = p.value;
      if (p.value > high) high = p.value;
    }
    return { current: points[points.length - 1].value, avg: sum / points.length, low, high };
  }, [points]);

  const fmt = (v) => (v === undefined || v === null ? "--" : v.toFixed(metric.decimals));
  const withUnit = (v) =>
    v === undefined || v === null ? "--" : `${fmt(v)}${metric.unit ? ` ${metric.unit}` : ""}`;

  const yDomain = useMemo(() => {
    if (!stats) return ["auto", "auto"];
    const pad = (stats.high - stats.low || 1) * 0.1;
    return [stats.low - pad, stats.high + pad];
  }, [stats]);

  const downloadExcel = () => {
    if (points.length === 0) return;
    const rows = points.map((p) => ({
      Timestamp: formatTimestamp(p.time / 1000),
      [metric.label]: p.value,
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
    XLSX.writeFile(workbook, `${metric.label}_${selectedDevice}.xlsx`);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <Box
        sx={{
          backgroundColor: colors.primary[400],
          border: `1px solid ${colors.grey[700]}`,
          borderLeft: `4px solid ${okColor}`,
          borderRadius: 2,
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          px: 1.5,
          py: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: axisColor }}>
          {new Date(label).toLocaleString("pt-BR")}
        </Typography>
        <Typography variant="h5" fontWeight="bold" sx={{ color: okColor }}>
          {withUnit(payload[0].value)}
        </Typography>
      </Box>
    );
  };

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
          <Header title="CONECTIVIDADE"  mb={0} />

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

            {/* SENSOR CARDS (click to select) */}
            {selectedType === null ? null : filteredSensors.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6, color: colors.grey[300] }}>
                <Typography variant="body1">Nenhum sensor encontrado nesta categoria.</Typography>
              </Box>
            ) : (
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
                  isSelected={sensor.device_id === selectedDevice}
                  onClick={() => setSelectedDevice(sensor.device_id)}
                />
              ))}
            </Box>
            )}

            {/* METRIC + PERIOD */}
            {selectedDevice && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: { xs: "stretch", md: "center" },
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={selectedMetric}
                    onChange={(e, value) => value !== null && setSelectedMetric(value)}
                    sx={{
                      "& .MuiToggleButton-root": {
                        flex: { xs: 1, md: "none" },
                        textTransform: "none",
                        fontWeight: 600,
                        px: 2.5,
                        color: colors.grey[300],
                        borderColor: colors.grey[700],
                        backgroundColor: colors.primary[400],
                        "&.Mui-selected": {
                          color: okColor,
                          backgroundColor: alpha(okColor, 0.15),
                        },
                      },
                    }}
                  >
                    {Object.entries(METRICS).map(([key, m]) => (
                      <ToggleButton key={key} value={key}>
                        {m.label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>

                  <DateRangePicker
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                  />
                </Box>

                {/* STATS */}
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                  }}
                >
                  <StatCard
                    colors={colors}
                    color={okColor}
                    icon={metric.icon}
                    label="Valor atual"
                    value={withUnit(stats?.current)}
                  />
                  <StatCard
                    colors={colors}
                    color={okColor}
                    icon={<Timeline />}
                    label="Média no período"
                    value={withUnit(stats?.avg)}
                  />
                  <StatCard
                    colors={colors}
                    color={okColor}
                    icon={<TrendingDown />}
                    label="Mínimo"
                    value={withUnit(stats?.low)}
                  />
                  <StatCard
                    colors={colors}
                    color={okColor}
                    icon={<TrendingUp />}
                    label="Máximo"
                    value={withUnit(stats?.high)}
                  />
                </Box>

                {/* CHART */}
                <Panel
                  colors={colors}
                  title={`${metric.label} ao longo do tempo`}
                  action={
                    <Tooltip title="Baixar Excel">
                      <span>
                        <IconButton
                          onClick={downloadExcel}
                          disabled={points.length === 0}
                          sx={{ color: okColor }}
                        >
                          <DownloadOutlinedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  }
                >
                  <Box height="340px" p={1}>
                    {loadingData ? (
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                      >
                        <CircularProgress sx={{ color: okColor }} />
                      </Box>
                    ) : points.length === 0 ? (
                      <EmptyState
                        colors={colors}
                        icon={<ErrorOutline />}
                        text="Sem dados neste período para o sensor selecionado."
                      />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={points}
                          margin={{ top: 20, right: 24, bottom: 8, left: 0 }}
                        >
                          <defs>
                            <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={okColor} stopOpacity={0.35} />
                              <stop offset="100%" stopColor={okColor} stopOpacity={0} />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke={colors.grey[700]}
                            opacity={0.5}
                          />
                          <XAxis
                            dataKey="time"
                            type="number"
                            scale="time"
                            domain={["dataMin", "dataMax"]}
                            tickFormatter={formatTick}
                            tick={{ fill: axisColor, fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={48}
                            tickMargin={8}
                          />
                          <YAxis
                            domain={yDomain}
                            tickFormatter={(v) => v.toFixed(metric.decimals)}
                            tick={{ fill: axisColor, fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            width={52}
                            unit={metric.unit ? ` ${metric.unit}` : ""}
                          />
                          <ChartTooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: colors.grey[500], strokeDasharray: "4 4" }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={okColor}
                            strokeWidth={2.5}
                            fill="url(#metricGradient)"
                            dot={false}
                            activeDot={{ r: 5, stroke: colors.primary[400], strokeWidth: 2 }}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </Panel>
              </>
            )}

            {/* Nothing selected yet */}
            {!selectedDevice && filteredSensors.length > 0 && (
              <Panel colors={colors} title="Histórico do sensor">
                <EmptyState
                  colors={colors}
                  icon={<TouchApp />}
                  text="Selecione um sensor acima para ver o histórico."
                />
              </Panel>
            )}
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default RSSI;