import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PauseCircleOutline from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutline from "@mui/icons-material/PlayCircleOutline";
import Schedule from "@mui/icons-material/Schedule";
import SettingsIcon from "@mui/icons-material/Settings";
import Thermostat from "@mui/icons-material/Thermostat";
import Tooltip from "@mui/material/Tooltip";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import TrackModal from "./TrackModal";
import Header from "../../components/Header";
import { tokens } from "../../theme";

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

const Panel = ({ title, action, colors, children }) => (
  <Box
    sx={{
      borderRadius: 3,
      backgroundColor: colors.primary[400],
      border: `1px solid ${colors.grey[700]}`,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
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
      <Typography variant="h5" fontWeight="600">
        {title}
      </Typography>
      {action}
    </Box>
    {children}
  </Box>
);

const LegendDot = ({ color, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
    <Box sx={{ width: 10, height: 3, borderRadius: 2, backgroundColor: color }} />
    <Typography variant="caption">{label}</Typography>
  </Box>
);

/* ---------- Page ---------- */

const SHELF_COLOR_LIGHT = "#f2a900"; // amber, distinct from the blue/coral pair used elsewhere

const ShelfDetailsPage = ({
  setPage,
  setChartData,
  selectedPlace,
  chartData,
  isSmallScreen,
  periods,
  microbialThreshold,
  devices,
  batchName,
  monitored,
  setAuditData,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const okColor = colors.blueAccent[500];
  const alertColor = colors.alert;
  const axisColor = theme.palette.text.secondary;

  const hasShelfLife = chartData.some((entry) => "shelf_life_remaining" in entry);
  const [microbialModalOpen, setMicrobialModalOpen] = useState(false);
  const hasEndedWithNow = periods.some((p) => p.endedWithNow);

  const user = JSON.parse(localStorage.getItem("profile"));
  const [openModal, setOpenModal] = useState(false);
  const [inputMicrobialThreshold, setInputMicrobialThreshold] = useState(8);

  const handleSettingsClick = async () => {
    if (monitored) {
      // Orange button → confirm and turn monitoring off
      const confirmStop = window.confirm("Tem certeza que quer parar de monitorar esse lote?");
      if (!confirmStop) return;

      try {
        const response = await fetch(
          `https://3sg24s13ja.execute-api.sa-east-1.amazonaws.com/dev/batches?companyID=${encodeURIComponent(user.Company)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ batchName, monitored: false }),
          }
        );
        if (!response.ok) throw new Error("Erro ao atualizar monitoramento.");
        setAuditData((prev) => ({ ...prev, monitored: false }));
        alert("Monitoramento do lote parado com sucesso.");
      } catch (error) {
        alert("Falha ao parar monitoramento.");
      }
    } else {
      // Blue button → open the modal as usual
      handleOpenModal();
    }
  };

  const handleOpenModal = async () => {
    await submitMicrobialThresholdAndRun();
    setOpenModal(true);
  };
  const handleCloseModal = () => setOpenModal(false);

  const handleDownload = () => {
    if (!chartData || chartData.length === 0) {
      alert("Sem dados para exportar.");
      return;
    }

    const csvHeader = [
      "timestamp",
      "temperature",
      ...(chartData.some((d) => "shelf_life_remaining" in d) ? ["shelf_life_remaining"] : []),
    ];

    const csvRows = chartData.map((entry) => {
      const row = [new Date(entry.timestamp).toLocaleString(), entry.temperature.toFixed(2)];
      if ("shelf_life_remaining" in entry) {
        row.push(entry.shelf_life_remaining?.toFixed(2) ?? "");
      }
      return row.join(",");
    });

    const csvContent = [csvHeader.join(","), ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${batchName}_dados.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submitMicrobialThresholdAndRun = async () => {
    if (!inputMicrobialThreshold || inputMicrobialThreshold <= 0) {
      alert("Informe um valor válido para o limite microbiano.");
      return;
    }
    setMicrobialModalOpen(false);
    try {
      const filledData = chartData.map(({ timestamp, temperature }) => ({ timestamp, temperature }));

      const body = {
        mode: "audit",
        data: filledData,
        microbialThreshold: inputMicrobialThreshold,
      };

      const response = await axios.post(
        "https://9yv5fy40u1.execute-api.sa-east-1.amazonaws.com/dev/predict",
        body,
        { headers: { "Content-Type": "application/json" } }
      );

      const { microbial_load, shelf_life_remaining } = response.data;

      const newChartData = chartData.map((entry, index) => ({
        ...entry,
        microbial_load: microbial_load[index],
        shelf_life_remaining: shelf_life_remaining[index],
      }));

      setChartData(newChartData);
    } catch (error) {
      console.error("Erro ao rodar modelo:", error);
      alert("Erro ao rodar o modelo de IA. Verifique o console.");
    }
  };

  /* ----- Derived values ----- */
  const lastEntry = chartData[chartData.length - 1];
  const shelfLifeValue =
    hasShelfLife && lastEntry?.shelf_life_remaining !== undefined
      ? lastEntry.shelf_life_remaining
      : null;
  const currentTemp = lastEntry?.temperature;

  let avgTemp = null;
  if (chartData.length > 0) {
    const sum = chartData.reduce((acc, d) => acc + d.temperature, 0);
    avgTemp = sum / chartData.length;
  }

  const recentReadings = chartData.slice(-5).reverse();

  const actionButtonSx = {
    backgroundColor: colors.primary[400],
    border: `1px solid ${colors.grey[700]}`,
    color: okColor,
    "&:hover": { backgroundColor: alpha(okColor, 0.12) },
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
        {payload.map((p) => (
          <Typography key={p.dataKey} variant="body2" fontWeight="bold" sx={{ color: p.color }}>
            {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
            {p.dataKey === "temperature" ? "°C" : p.dataKey === "shelf_life_remaining" ? " h" : ""}
          </Typography>
        ))}
      </Box>
    );
  };

  return (
    <Box m="20px" display="flex" flexDirection="column" gap={3}>
      {/* Header */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconButton onClick={() => setPage("input")} sx={actionButtonSx}>
            <ArrowBackIcon />
          </IconButton>
          <Header title={batchName} subtitle={<strong>Detalhes do lote</strong>} mb={0} />
        </Box>

        <Box display="flex" gap={1} alignItems="center">
          <Tooltip title="Rodar modelo de IA">
            <IconButton onClick={() => setMicrobialModalOpen(true)} sx={actionButtonSx}>
              <DeviceHubIcon />
            </IconButton>
          </Tooltip>

          {(hasEndedWithNow || monitored) && (
            <Tooltip title={monitored ? "Parar monitoramento" : "Monitorar continuamente"}>
              <IconButton
                onClick={handleSettingsClick}
                sx={{
                  ...actionButtonSx,
                  color: monitored ? alertColor : okColor,
                  "&:hover": {
                    backgroundColor: alpha(monitored ? alertColor : okColor, 0.12),
                  },
                }}
              >
                {monitored ? <PauseCircleOutline /> : <SettingsIcon />}
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Baixar CSV">
            <IconButton onClick={handleDownload} sx={actionButtonSx}>
              <DownloadOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Periods */}
      <Panel colors={colors} title="Períodos avaliados">
        <Box sx={{ p: periods.length === 0 ? 2.5 : 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
          {periods.length === 0 ? (
            <Typography sx={{ color: colors.grey[300] }}>Nenhum período informado.</Typography>
          ) : (
            periods.map((period, idx) => (
              <Box
                key={idx}
                display="flex"
                flexDirection={isSmallScreen ? "column" : "row"}
                justifyContent="space-between"
                alignItems={isSmallScreen ? "flex-start" : "center"}
                gap={1}
                p={1.5}
                borderRadius={2}
                sx={{
                  backgroundColor: colors.primary[500],
                  border: `1px solid ${colors.grey[700]}`,
                }}
              >
                <Typography sx={{ color: okColor }} fontWeight="600">
                  Sensor: {period.location}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.grey[300] }}>
                  De: {period.from ? new Date(period.from).toLocaleString("pt-BR") : "—"} · Até:{" "}
                  {period.to ? new Date(period.to).toLocaleString("pt-BR") : "—"}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Panel>

      {/* Summary cards */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: `repeat(${hasShelfLife ? 3 : 2}, 1fr)` },
        }}
      >
        {hasShelfLife && (
          <StatCard
            colors={colors}
            color={SHELF_COLOR_LIGHT}
            icon={<Schedule />}
            label="Vida de prateleira restante"
            value={shelfLifeValue !== null ? `${shelfLifeValue.toFixed(1)} h` : "—"}
          />
        )}
        <StatCard
          colors={colors}
          color={okColor}
          icon={<Thermostat />}
          label="Temperatura atual"
          value={currentTemp !== undefined ? `${currentTemp.toFixed(1)}°C` : "—"}
        />
        <StatCard
          colors={colors}
          color={okColor}
          icon={<Thermostat />}
          label="Temperatura média"
          value={avgTemp !== null ? `${avgTemp.toFixed(1)}°C` : "—"}
        />
      </Box>

      {/* Chart + recent readings */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
        }}
      >
        <Panel
          colors={colors}
          title="Evolução do lote"
          action={
            hasShelfLife && (
              <Box display="flex" gap={2}>
                <LegendDot color={okColor} label="Temperatura" />
                <LegendDot color={SHELF_COLOR_LIGHT} label="Vida de prateleira" />
              </Box>
            )
          }
        >
          <Box height="340px" p={1}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 24, bottom: 8, left: 0 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={okColor} stopOpacity={0.3} />
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
                  dataKey="timestamp"
                  tickFormatter={(v) =>
                    new Date(v).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                  tick={{ fill: axisColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={48}
                  tickMargin={8}
                />

                <YAxis
                  yAxisId="temp"
                  tickFormatter={(v) => `${v.toFixed(0)}°`}
                  tick={{ fill: axisColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />

                {hasShelfLife && (
                  <YAxis
                    yAxisId="shelf"
                    orientation="right"
                    tickFormatter={(v) => `${v.toFixed(0)}h`}
                    tick={{ fill: axisColor, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                )}

                <ChartTooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: colors.grey[500], strokeDasharray: "4 4" }}
                />

                <Area
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperature"
                  name="Temperatura"
                  stroke={okColor}
                  strokeWidth={2.5}
                  fill="url(#tempGradient)"
                  dot={false}
                  isAnimationActive={false}
                />

                {hasShelfLife && (
                  <Line
                    yAxisId="shelf"
                    type="monotone"
                    dataKey="shelf_life_remaining"
                    name="Vida de prateleira"
                    stroke={SHELF_COLOR_LIGHT}
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </Panel>

        {!isSmallScreen && (
          <Panel colors={colors} title="Medidas recentes">
            <Box sx={{ overflow: "auto" }}>
              {recentReadings.map((measurement, index) => (
                <Box
                  key={measurement.timestamp}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  px={2.5}
                  py={1.5}
                  sx={{
                    borderBottom:
                      index < recentReadings.length - 1 ? `1px solid ${colors.grey[700]}` : "none",
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: okColor }}>
                      {measurement.temperature.toFixed(1)}°C
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.grey[300] }}>
                      {new Date(measurement.timestamp).toLocaleString("pt-BR")}
                    </Typography>
                  </Box>

                  {measurement.shelf_life_remaining !== undefined && (
                    <Box
                      sx={{
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 2,
                        backgroundColor: SHELF_COLOR_LIGHT,
                        color: "#1a1300",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                      }}
                    >
                      {measurement.shelf_life_remaining.toFixed(1)} h
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Panel>
        )}
      </Box>

      <TrackModal
        openModal={openModal}
        handleCloseModal={handleCloseModal}
        chartData={chartData}
        microbialThreshold={microbialThreshold}
        periods={periods}
        devices={devices}
        batchName={batchName}
      />

      {/* Microbial threshold dialog */}
      {microbialModalOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100vw"
          height="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={9999}
          bgcolor="rgba(0, 0, 0, 0.6)"
          sx={{ backdropFilter: "blur(2px)" }}
        >
          <Box
            sx={{
              backgroundColor: colors.primary[400],
              border: `1px solid ${colors.grey[700]}`,
              borderRadius: 3,
              p: 3,
              minWidth: 320,
              maxWidth: "90vw",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Informe o limite microbiano
            </Typography>

            <TextField
              type="number"
              size="small"
              label="Limite"
              value={inputMicrobialThreshold}
              onChange={(e) => setInputMicrobialThreshold(Number(e.target.value))}
              inputProps={{ min: 0, step: 0.1 }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  "& fieldset": { borderColor: colors.grey[700] },
                  "&:hover fieldset": { borderColor: okColor },
                  "&.Mui-focused fieldset": { borderColor: okColor, borderWidth: 1 },
                  "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(okColor, 0.2)}` },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: okColor },
              }}
            />

            <Box display="flex" gap={1.5} justifyContent="flex-end">
              <Button
                onClick={() => setMicrobialModalOpen(false)}
                sx={{ color: colors.grey[200], textTransform: "none", fontWeight: 600, borderRadius: 2 }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                disableElevation
                startIcon={<PlayCircleOutline />}
                onClick={submitMicrobialThresholdAndRun}
                sx={{
                  backgroundColor: okColor,
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  "&:hover": { backgroundColor: alpha(okColor, 0.85) },
                }}
              >
                Rodar modelo
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ShelfDetailsPage;