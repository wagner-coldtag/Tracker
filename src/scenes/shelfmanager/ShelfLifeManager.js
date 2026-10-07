import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import ScheduleIcon from "@mui/icons-material/Schedule";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import React, { useState, useEffect } from "react";
import DeviceSelector from "./DeviceSelector";
import ShelfDetailsPage from "./ShelfDetailsPage";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import DateRangePicker from "../dashboard/utils/DataRangePicker";
import useFetchSensorData from "../dashboard/utils/useFetchSensorData";

// Fixed second stop for the selected-tab gradient (same as Dashboard)
const GRADIENT_DEEP_BLUE = "#0B63C4";

export default function ShelfLifeManager() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const okColor = colors.blueAccent[500];
  const alertColor = colors.alert;

  const [loading, setLoading] = useState(false);
  const [savedBatches, setSavedBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [page, setPage] = useState("input"); // "input" or "result"
  const [selectedStore, setSelectedStore] = React.useState(null);
  const [selectedPlace, setSelectedPlace] = React.useState(null);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeTab, setActiveTab] = useState("predict"); // 'predict' ou 'history'
  const user = JSON.parse(localStorage.getItem("profile"));
  const { devices } = useFetchSensorData();

  const [chartData, setChartData] = useState([]);

  // --- Retrospective Analysis State ---
  const [auditData, setAuditData] = useState({
    batchName: "",
    periods: [{ location: "", from: null, to: null }],
    monitored: false,
  });

  const [auditResult, setAuditResult] = useState(null);
  useEffect(() => {
    const fetchBatches = async () => {
      if (activeTab !== "history" || !user?.Company) return;

      setLoadingBatches(true);
      try {
        const response = await fetch(
          `https://3sg24s13ja.execute-api.sa-east-1.amazonaws.com/dev/batches?companyID=${encodeURIComponent(user.Company)}`
        );

        if (!response.ok) throw new Error("Erro ao buscar lotes");

        const data = await response.json();
        setSavedBatches(data.batches || []);
      } catch (error) {
        console.error("Erro ao buscar lotes:", error);
        setSavedBatches([]);
      } finally {
        setLoadingBatches(false);
      }
    };

    fetchBatches();
  }, [activeTab, user?.Company]);

  const processTemperatureDataFromPeriods = async (periods, fetchTemperatureDataFn) => {
    let allData = [];

    for (const period of periods) {
      const sensorTemperatureData = await fetchTemperatureDataFn(
        period.location,
        period.from,
        period.to
      );
      allData = allData.concat(sensorTemperatureData);
    }

    const grouped = {};
    allData.forEach((entry) => {
      const hourTimestamp = Math.floor(entry.timestamp / 3600) * 3600;
      if (!grouped[hourTimestamp]) grouped[hourTimestamp] = [];
      grouped[hourTimestamp].push(entry.temperature);
    });

    let averagedData = Object.entries(grouped).map(([timestamp, temps]) => {
      const sum = temps.reduce((acc, t) => acc + t, 0);
      return {
        timestamp: Number(timestamp),
        averageTemperature: sum / temps.length,
      };
    });
    averagedData.sort((a, b) => a.timestamp - b.timestamp);

    const filledData = [];
    for (let i = 0; i < averagedData.length; i++) {
      filledData.push(averagedData[i]);
      if (i === averagedData.length - 1) break;

      const current = averagedData[i];
      const next = averagedData[i + 1];
      const gap = (next.timestamp - current.timestamp) / 3600;

      if (gap > 1) {
        for (let h = 1; h < gap; h++) {
          const missingTimestamp = current.timestamp + h * 3600;
          const interpolatedTemp =
            current.averageTemperature +
            ((next.averageTemperature - current.averageTemperature) * h) / gap;

          filledData.push({
            timestamp: missingTimestamp,
            averageTemperature: interpolatedTemp,
            interpolated: true,
          });
        }
      }
    }

    filledData.sort((a, b) => a.timestamp - b.timestamp);

    return filledData.map(({ timestamp, averageTemperature }) => ({
      timestamp: new Date(timestamp * 1000).toISOString(),
      temperature: averageTemperature,
    }));
  };

  const onAuditSubmit = async () => {
    setLoading(true);

    try {
      const batchName = auditData.batchName;
      const periods = auditData.periods;
      const createdBy = `${user?.Name ?? ""} ${user?.Surname ?? ""}`.trim();

      if (!batchName) {
        alert("Por favor, defina um nome para o lote.");
        return;
      }

      if (!user?.Company) {
        alert("Empresa do usuário não encontrada.");
        return;
      }

      const payload = { batchName, periods, createdBy, monitored: false };

      const response = await fetch(
        `https://3sg24s13ja.execute-api.sa-east-1.amazonaws.com/dev/batches?companyID=${encodeURIComponent(user.Company)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar lote.");
      }

      alert("Lote criado com sucesso!");

      const payloadData = await processTemperatureDataFromPeriods(periods, fetchTemperatureData);

      setSavedBatches((prev) => [...prev, data.newBatch || payload]);
      setChartData(payloadData);
      setPage("result");
    } catch (error) {
      console.error("Erro na criação do lote:", error);
      alert("Erro ao criar lote: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isLastPeriodComplete = () => {
    const last = auditData.periods[auditData.periods.length - 1];
    return last.location && last.from && last.to;
  };

  const fetchTemperatureData = async (deviceId, startDate, endDate) => {
    try {
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

      const response = await fetch(
        `https://08mwl5gxyj.execute-api.sa-east-1.amazonaws.com/device-data?company=CompanyA&device_id=${deviceId}&start_date=${startTimestamp}&end_date=${endTimestamp}`
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const jsonData = await response.json();
      const sortedData = jsonData.sort((a, b) => a.timestamp - b.timestamp);

      return sortedData; // Raw sensor data
    } catch (error) {
      return [];
    }
  };

  const addPeriod = () => {
    if (!isLastPeriodComplete()) return; // prevent adding if incomplete

    setAuditData((prev) => {
      const lastPeriod = prev.periods[prev.periods.length - 1];
      const newPeriod = {
        location: "",
        from: lastPeriod?.to || null,
        to: null,
      };
      return { ...prev, periods: [...prev.periods, newPeriod] };
    });
  };

  /* ---------- Shared styles ---------- */
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
      "& fieldset": { borderColor: colors.grey[700] },
      "&:hover fieldset": { borderColor: okColor },
      "&.Mui-focused fieldset": { borderColor: okColor, borderWidth: 1 },
      "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(okColor, 0.2)}` },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: okColor },
  };

  const outlineButtonSx = {
    color: okColor,
    borderColor: colors.grey[700],
    backgroundColor: colors.primary[400],
    textTransform: "none",
    fontWeight: 600,
    borderRadius: 2,
    "&:hover": { borderColor: okColor, backgroundColor: alpha(okColor, 0.08) },
    "&.Mui-disabled": { color: colors.grey[500], borderColor: colors.grey[700] },
  };

  const solidButtonSx = {
    backgroundColor: okColor,
    color: "#fff",
    textTransform: "none",
    fontWeight: 600,
    borderRadius: 2,
    "&:hover": { backgroundColor: alpha(okColor, 0.85) },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      {page === "input" && (
        <Box m="20px" display="flex" flexDirection="column" gap={3}>
          <Header
            title="PREDIÇÃO DE SHELF LIFE"
            subtitle="Use IA para prever shelf-life do seu produto"
            mb={0}
          />

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            TabIndicatorProps={{ style: { display: "none" } }}
            sx={{
              minHeight: 0,
              width: { xs: "100%", sm: "fit-content" },
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
            <Tab label="Criar" value="predict" />
            <Tab label="Consultar" value="history" />
          </Tabs>

          {/* Create batch */}
          {activeTab === "predict" && page === "input" && (
            <Box
              sx={{
                borderRadius: 3,
                backgroundColor: colors.primary[400],
                border: `1px solid ${colors.grey[700]}`,
                p: { xs: 2, sm: 3 },
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
              }}
            >
              <TextField
                label="Nome do lote"
                fullWidth
                size="small"
                value={auditData.batchName ?? ""}
                onChange={(e) =>
                  setAuditData({
                    ...auditData,
                    batchName: e.target.value === "" ? undefined : e.target.value,
                  })
                }
                sx={fieldSx}
              />

              {auditData.periods.map((period, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${colors.grey[700]}`,
                    backgroundColor: colors.primary[500],
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography variant="h6" fontWeight="600">
                      Período {index + 1}
                    </Typography>
                    {auditData.periods.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          const updatedPeriods = auditData.periods.filter((_, i) => i !== index);
                          setAuditData({ ...auditData, periods: updatedPeriods });
                        }}
                        sx={{
                          color: alertColor,
                          "&:hover": { backgroundColor: alpha(alertColor, 0.1) },
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", md: "row" }}
                    alignItems={{ xs: "stretch", md: "flex-start" }}
                    gap={2}
                  >
                    <Box flex={1} alignSelf="stretch" display="flex">
                      <DeviceSelector
                        devices={devices}
                        selectedDeviceId={period.location}
                        onSelect={(deviceId) => {
                          const newPeriods = [...auditData.periods];
                          newPeriods[index].location = deviceId;
                          setAuditData({ ...auditData, periods: newPeriods });
                          const selectedDevice = devices.find((d) => d.device_id === deviceId);
                          if (selectedDevice) {
                            setSelectedStore(selectedDevice.company);
                            setSelectedPlace(selectedDevice.type);
                          }
                        }}
                        label="SELECIONAR LOCAL (SENSOR)"
                        colorTheme={{ bg: colors.primary[400], fg: theme.palette.text.primary }}
                      />
                    </Box>

                    <Box display="flex" flexDirection="column" width="100%" gap={1}>
                      <DateRangePicker
                        startDate={period.from}
                        setStartDate={(newDate) => {
                          const newPeriods = [...auditData.periods];
                          newPeriods[index].from = newDate;
                          setAuditData({ ...auditData, periods: newPeriods });
                        }}
                        endDate={period.to}
                        setEndDate={(newDate) => {
                          const newPeriods = [...auditData.periods];
                          newPeriods[index].to = newDate;
                          setAuditData({ ...auditData, periods: newPeriods });
                        }}
                      />

                      <Box display="flex" justifyContent="flex-end">
                        <Button
                          onClick={() => {
                            const newPeriods = [...auditData.periods];
                            newPeriods[index] = {
                              ...newPeriods[index],
                              to: new Date(),
                              endedWithNow: true, // passed along to ShelfDetailsPage
                            };
                            setAuditData({ ...auditData, periods: newPeriods });
                          }}
                          size="small"
                          startIcon={<ScheduleIcon fontSize="small" />}
                          sx={{
                            mt: 0.5,
                            fontSize: "0.75rem",
                            color: okColor,
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          Horário final = agora
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}

              <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addPeriod}
                  variant="outlined"
                  disabled={!isLastPeriodComplete()}
                  sx={{ flex: 1, ...outlineButtonSx }}
                >
                  Adicionar etapa
                </Button>

                <Button
                  variant="contained"
                  disableElevation
                  onClick={onAuditSubmit}
                  sx={{ flex: 1, ...solidButtonSx }}
                >
                  Criar lote
                </Button>
              </Box>
            </Box>
          )}

          {/* History */}
          {activeTab === "history" && (
            <Box>
              {loadingBatches ? (
                <Box mt={4} display="flex" justifyContent="center">
                  <CircularProgress sx={{ color: okColor }} />
                </Box>
              ) : savedBatches.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    py: 6,
                    color: colors.grey[300],
                  }}
                >
                  <Inventory2Outlined sx={{ fontSize: 48 }} />
                  <Typography variant="h6">Nenhum lote encontrado.</Typography>
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {savedBatches.map((batch, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: "relative",
                        borderRadius: 3,
                        border: `1px solid ${colors.grey[700]}`,
                        backgroundColor: colors.primary[400],
                        cursor: "pointer",
                        transition: "border-color 0.2s ease, transform 0.2s ease",
                        "&:hover": {
                          borderColor: okColor,
                          transform: "translateY(-2px)",
                        },
                        p: 2,
                        pr: 6,
                      }}
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const payloadData = await processTemperatureDataFromPeriods(
                            batch.periods,
                            fetchTemperatureData
                          );
                          setChartData(payloadData);
                          setAuditData({
                            batchName: batch.batchName,
                            periods: batch.periods.map((period) => {
                              const { endedWithNow, ...rest } = period;
                              return rest;
                            }),
                            monitored: batch.monitored ?? false,
                          });
                          setPage("result");
                        } catch (err) {
                          alert("Erro ao buscar dados do lote.");
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" sx={{ color: okColor }}>
                        {batch.batchName}
                      </Typography>
                      <Typography variant="body2">
                        Períodos: {batch.periods?.length || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.grey[300] }}>
                        Criado por: {user?.name || "Usuário desconhecido"}
                      </Typography>

                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          color: alertColor,
                          "&:hover": { backgroundColor: alpha(alertColor, 0.1) },
                        }}
                        onClick={async (e) => {
                          e.stopPropagation(); // don't trigger the card click
                          const confirmDelete = window.confirm(
                            `Deseja realmente deletar o lote "${batch.batchName}"?`
                          );
                          if (!confirmDelete) return;

                          try {
                            const response = await fetch(
                              `https://3sg24s13ja.execute-api.sa-east-1.amazonaws.com/dev/batches?companyID=${encodeURIComponent(user.Company)}`,
                              {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ batchName: batch.batchName }),
                              }
                            );

                            if (!response.ok) throw new Error("Erro ao deletar lote.");

                            setSavedBatches((prev) =>
                              prev.filter((b) => b.batchName !== batch.batchName)
                            );
                            alert("Lote deletado com sucesso!");
                          } catch (err) {
                            console.error("Erro ao deletar lote:", err);
                            alert("Erro ao deletar lote.");
                          }
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      {loading && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100vw"
          height="100vh"
          bgcolor="rgba(0, 0, 0, 0.6)"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          zIndex={1300}
          sx={{ backdropFilter: "blur(2px)" }}
        >
          <CircularProgress sx={{ color: okColor }} />
          <Typography mt={2} sx={{ color: "#fff" }}>
            Coletando dados do lote...
          </Typography>
        </Box>
      )}

      {page === "result" && chartData.length > 0 && (() => {
        const threshold = auditData.microbialThreshold ?? 8;

        return (
          <ShelfDetailsPage
            setPage={setPage}
            setChartData={setChartData}
            selectedPlace={selectedPlace}
            chartData={chartData}
            isSmallScreen={isSmallScreen}
            periods={auditData.periods}
            microbialThreshold={threshold}
            devices={devices}
            batchName={auditData.batchName}
            monitored={auditData.monitored}
            setAuditData={setAuditData}
          />
        );
      })()}
    </LocalizationProvider>
  );
}