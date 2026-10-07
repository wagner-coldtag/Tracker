import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import ShowChart from "@mui/icons-material/ShowChart";
import Thermostat from "@mui/icons-material/Thermostat";
import UnfoldMore from "@mui/icons-material/UnfoldMore";
import WarningAmber from "@mui/icons-material/WarningAmber";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ptBR } from "date-fns/locale";
import React, { useState, useEffect } from "react";
import TemperatureReport from "./Report";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import DateRangePicker from "../dashboard/utils/DataRangePicker";
import useFetchSensorData from "../dashboard/utils/useFetchSensorData";

const isValidLimit = (v) => v !== undefined && v !== null && v !== "" && !Number.isNaN(Number(v));

const formatDate = (d) =>
  new Date(d).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/* ---------- Small presentational helpers ---------- */

const Panel = ({ title, subtitle, colors, children }) => (
  <Box
    sx={{
      borderRadius: 3,
      backgroundColor: colors.primary[400],
      border: `1px solid ${colors.grey[700]}`,
      overflow: "hidden",
    }}
  >
    <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${colors.grey[700]}` }}>
      <Typography variant="h5" fontWeight="600">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: colors.grey[300] }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    <Box sx={{ p: 2.5 }}>{children}</Box>
  </Box>
);

const StatCard = ({ icon, label, value, color, colors }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      p: 1.5,
      borderRadius: 3,
      border: `1px solid ${colors.grey[700]}`,
      backgroundColor: colors.primary[500],
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
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
      <Typography variant="h5" fontWeight="bold" noWrap sx={{ color, lineHeight: 1.2 }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

/* ---------- Page ---------- */

const ReportPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const okColor = colors.blueAccent[500];
  const alertColor = colors.alert;

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [reportDevice, setReportDevice] = useState(null);

  const {
    devices,
    setSelectedDevice,
    selectedDevice,
    data,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = useFetchSensorData();

  const hasData = !!(selectedDevice && data && data.length > 0 && data[0]?.data?.length > 0);

  // Loading: cleared when data arrives, set again whenever the request inputs change
  useEffect(() => {
    setIsLoadingData(!hasData);
  }, [data, selectedDevice]); 

  useEffect(() => {
    if (selectedDevice && startDate && endDate) {
      setIsLoadingData(true);
    }
  }, [startDate, endDate, selectedDevice]);

  const handleSelect = (event) => {
    const device = devices.find((d) => d.device_id === event.target.value);
    if (device) {
      setReportDevice(device);
      setSelectedDevice(device.device_id);
    }
  };

  // Fall back to the list if the device was selected somewhere else (e.g. hook default)
  const currentDevice =
    reportDevice ?? devices?.find((d) => d.device_id === selectedDevice) ?? null;

  const transformedData =
    data?.[0]?.data?.map((tempPoint) => ({
      time: tempPoint.x, // seconds, as before
      temp: typeof tempPoint.y === "number" ? parseFloat(tempPoint.y.toFixed(1)) : 0,
    })) || [];

  // Summary stats (plain loop: safe for big arrays)
  const hasMin = isValidLimit(currentDevice?.minTemp);
  const hasMax = isValidLimit(currentDevice?.maxTemp);
  let sum = 0;
  let low = Infinity;
  let high = -Infinity;
  let outCount = 0;
  for (const p of transformedData) {
    sum += p.temp;
    if (p.temp < low) low = p.temp;
    if (p.temp > high) high = p.temp;
    if ((hasMax && p.temp > Number(currentDevice.maxTemp)) || (hasMin && p.temp < Number(currentDevice.minTemp))) {
      outCount += 1;
    }
  }
  const count = transformedData.length;
  const avg = count > 0 ? (sum / count).toFixed(1) : "--";

  const ready = !!(selectedDevice && startDate && endDate);

  const fieldSx = {
    width: { xs: "100%", sm: 260 },
    "& .MuiOutlinedInput-root": {
      backgroundColor: colors.primary[400],
      borderRadius: 3,
      "& fieldset": { borderColor: colors.grey[700] },
      "&:hover fieldset": { borderColor: okColor },
      "&.Mui-focused fieldset": { borderColor: okColor, borderWidth: 1 },
      "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(okColor, 0.2)}` },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: okColor },
  };

  const downloadButtonSx = {
    backgroundColor: okColor,
    color: "#fff",
    textTransform: "none",
    fontWeight: 600,
    borderRadius: 2,
    px: 3,
    py: 1,
    width: { xs: "100%", sm: "auto" },
    "&:hover": { backgroundColor: alpha(okColor, 0.85) },
    "&.Mui-disabled": { backgroundColor: alpha(okColor, 0.3), color: "#fff" },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box m="20px" display="flex" flexDirection="column" gap={3}>
        <Header title="GERAÇÃO DE RELATÓRIOS" mb={0} />

        {/* Step 1: choose device and period */}
        <Panel
          colors={colors}
          title="Configuração"
          subtitle="Escolha o dispositivo e o intervalo de datas do relatório."
        >
          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            alignItems={{ xs: "stretch", md: "center" }}
            gap={2}
          >
            <TextField
              select
              size="small"
              label="Dispositivo"
              value={selectedDevice || ""}
              onChange={handleSelect}
              sx={fieldSx}
              SelectProps={{
                MenuProps: { PaperProps: { sx: { maxHeight: 300 } } },
                renderValue: (value) => {
                  const d = devices?.find((dev) => dev.device_id === value);
                  return d?.name || value;
                },
              }}
            >
              {devices?.length > 0 ? (
                devices.map((device) => (
                  <MenuItem key={device.device_id} value={device.device_id}>
                    <Box>
                      <Typography variant="body1">{device.name || device.device_id}</Typography>
                      <Typography variant="caption" sx={{ color: colors.grey[300] }}>
                        {device.company} / {device.type}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  Nenhum dispositivo encontrado.
                </MenuItem>
              )}
            </TextField>

            <DateRangePicker
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
          </Box>
        </Panel>

        {/* Step 2: summary + download */}
        <Panel colors={colors} title="Relatório">
          {!ready ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                py: 4,
                color: colors.grey[300],
                textAlign: "center",
              }}
            >
              <DescriptionOutlined sx={{ fontSize: 48 }} />
              <Typography variant="h6">
                Selecione o dispositivo e o intervalo de datas para gerar o relatório.
              </Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2.5}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {currentDevice?.name || selectedDevice}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.grey[300] }}>
                  {[currentDevice?.company, currentDevice?.type].filter(Boolean).join(" / ")}
                  {currentDevice ? " · " : ""}
                  {formatDate(startDate)} → {formatDate(endDate)}
                </Typography>
              </Box>

              {!isLoadingData && (
                <Box
                  sx={{
                    display: "grid",
                    gap: 1.5,
                    gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                  }}
                >
                  <StatCard
                    colors={colors}
                    color={okColor}
                    icon={<ShowChart fontSize="small" />}
                    label="Leituras"
                    value={count}
                  />
                  <StatCard
                    colors={colors}
                    color={okColor}
                    icon={<Thermostat fontSize="small" />}
                    label="Média"
                    value={avg === "--" ? avg : `${avg}°C`}
                  />
                  <StatCard
                    colors={colors}
                    color={okColor}
                    icon={<UnfoldMore fontSize="small" />}
                    label="Mín. / Máx."
                    value={count > 0 ? `${low}° / ${high}°` : "--"}
                  />
                  <StatCard
                    colors={colors}
                    color={outCount > 0 ? alertColor : okColor}
                    icon={<WarningAmber fontSize="small" />}
                    label="Fora da faixa"
                    value={outCount}
                  />
                </Box>
              )}

              <Box>
                {isLoadingData ? (
                  <Button
                    variant="contained"
                    disabled
                    disableElevation
                    startIcon={<CircularProgress size={16} sx={{ color: "#fff" }} />}
                    sx={downloadButtonSx}
                  >
                    Carregando dados...
                  </Button>
                ) : (
                  <PDFDownloadLink
                    document={
                      <TemperatureReport
                        device={currentDevice}
                        startDate={startDate}
                        endDate={endDate}
                        data={transformedData}
                      />
                    }
                    fileName={`relatorio-${selectedDevice}.pdf`}
                    style={{ textDecoration: "none" }}
                  >
                    {({ loading }) => (
                      <Button
                        variant="contained"
                        disabled={loading}
                        disableElevation
                        startIcon={
                          loading ? (
                            <CircularProgress size={16} sx={{ color: "#fff" }} />
                          ) : (
                            <PictureAsPdf />
                          )
                        }
                        sx={downloadButtonSx}
                      >
                        {loading ? "Gerando PDF..." : "Baixar relatório PDF"}
                      </Button>
                    )}
                  </PDFDownloadLink>
                )}
              </Box>
            </Box>
          )}
        </Panel>
      </Box>
    </LocalizationProvider>
  );
};

export default ReportPage;