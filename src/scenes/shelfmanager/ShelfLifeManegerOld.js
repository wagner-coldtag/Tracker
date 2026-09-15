import AddIcon from "@mui/icons-material/Add";
import {
  Box, TextField,Button,Typography,Paper,useMediaQuery, useTheme, CircularProgress, Tabs, Tab
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import React, { useState, useEffect } from "react";
import DeviceSelector from "./DeviceSelector";
import ShelfDetailsPage from "./ShelfDetailsPage";
import { handleAuditSubmit } from "./utils/handleAuditSubmit"; // adjust the path accordingly
import Header from "../../components/Header";
import { tokens } from "../../theme";
import DateRangePicker from "../dashboard/utils/DataRangePicker";
import useFetchSensorData from "../dashboard/utils/useFetchSensorData";

export default function ShelfLifeManager() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(false);
  const [savedBatches, setSavedBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [page, setPage] = useState("input"); // "input" or "result"
  const [selectedStore, setSelectedStore] = React.useState(null);
  const [selectedPlace, setSelectedPlace] = React.useState(null);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [alarmTime, setAlarmTime] = useState(undefined);
  const [microbialThreshold, setMicrobialThreshold] = useState(8);
  const [activeTab, setActiveTab] = useState("predict"); // 'predict' ou 'history'
  const user = JSON.parse(localStorage.getItem("profile"));
  const { devices, formatTimestamp } = useFetchSensorData();
  const [predictions, setPredictions] = useState({
    lastPredictionTimestamp: null,
    leftoverTemps: [],
    lastMicrobialLoad: null,
  });
  const [chartData, setChartData] = useState([]);

  // --- Forward Tracking State ---
  const [trackData, setTrackData] = useState({
  //    product: "",
    location: "",
    entryDate: null,
    initialShelfLife: "",
  });
  const [trackResult, setTrackResult] = useState(null);

  // --- Retrospective Analysis State ---
  const [auditData, setAuditData] = useState({
    //product: "",
    periods: [{ location: "", from: null, to: null }],
  });
  
  const [auditResult, setAuditResult] = useState(null);
  useEffect(() => {
    const fetchBatches = async() => {
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
  

  const onAuditSubmit = async() => {
    setLoading(true);
    setAuditResult(null);
    try {
      await handleAuditSubmit(auditData, setAuditResult, setChartData, fetchTemperatureData);
      setPage("result");
    } finally {
      setLoading(false);
    }
  };
  const isLastPeriodComplete = () => {
    const last = auditData.periods[auditData.periods.length - 1];
    return last.location && last.from && last.to;
  };

  const fetchTemperatureData = async(deviceId, startDate, endDate) => {
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
  
    setAuditData(prev => {
      const lastPeriod = prev.periods[prev.periods.length - 1];
      const newPeriod = {
        location: "",
        from: lastPeriod?.to || null,
        to: null,
      };
      return { ...prev, periods: [...prev.periods, newPeriod] };
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {page === "input" && (
        <>
          <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Header title="PREDIÇÃO DE SHELF LIFE" subtitle="Use IA para prever shelf-life do seu produto" />
            </Box>
            <Paper sx={{ maxWidth: 600, marginTop: "-20px", border: "none", boxShadow: "none"}}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                textColor="primary"
                indicatorColor="primary"
                sx={{ mb: 2, ml: 2 }}
              >
                <Tab label="Predição de Shelf Life" value="predict" />
                <Tab label="Histórico de Lotes" value="history" />
              </Tabs>
              {activeTab === "predict" && page === "input" && (
                <Box>
                  {/* 
              <TextField
                label="Product"
                fullWidth
                margin="normal"
                value={auditData.product}
                onChange={e => setAuditData({ ...auditData, product: e.target.value })}
              />
              */}
                  {auditData.periods.map((period, index) => (
                    <Box key={index} sx={{ mt: 2, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>

                        <Typography variant="subtitle1">Período {index + 1}</Typography>
                        {auditData.periods.length > 1 && (
                          <Button
                            size="small"
                            onClick={() => {
                              const updatedPeriods = auditData.periods.filter((_, i) => i !== index);
                              setAuditData({ ...auditData, periods: updatedPeriods });
                            }}
                            variant="outlined"
                            color="error"
                            sx={{
                              fontSize: "0.75rem",
                              padding: "2px 8px",
                              textTransform: "none",
                              borderRadius: 1,
                            }}
                          >
      Remover
                          </Button>
                        )}
                      </Box>

                      <Box
                        display="flex"
                        flexDirection={{ xs: "column", md: "row" }}
                        alignItems="center"
                        gap={2}
                        mb={0}
                      >
                        <Box flex={1} alignSelf="stretch" display="flex">

                          <DeviceSelector
                            devices={devices}
                            selectedDeviceId={period.location}
                            onSelect={(deviceId) => {
                              const newPeriods = [...auditData.periods];
                              newPeriods[index].location = deviceId;
                              setAuditData({ ...auditData, periods: newPeriods });
                              const selectedDevice = devices.find(d => d.device_id === deviceId);
                              if (selectedDevice) {
                                setSelectedStore(selectedDevice.company);
                                setSelectedPlace(selectedDevice.type);
                              }
                            }}
                            label="SELECIONAR LOCAL (SENSOR)"
                            colorTheme={{ bg: "#1F2A40", fg: "#fff" }}
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
                                newPeriods[index].to = new Date();
                                setAuditData({ ...auditData, periods: newPeriods });
                              }}
                              size="small"
                              variant="outlined"
                              sx={{
                                mt: 0.5,
                                fontSize: "0.75rem",
                                padding: "4px 8px",
                                color: "#2ab4ea",
                                borderColor: "#2ab4ea",
                                textTransform: "none",
                              }}
                            >
      Horário final = agora
                            </Button>
                          </Box>
                        </Box>

                      </Box>
                    </Box>
                  ))}
                  <TextField
                    label="Limite microbiano (opcional)"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={auditData.microbialThreshold ?? ""}
                    onChange={(e) =>
                      setAuditData({
                        ...auditData,
                        microbialThreshold: e.target.value === "" ? undefined : parseFloat(e.target.value),
                      })
                    }
                  />
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    gap={2}
                    mt={2}
                    mb={2}
                  >
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addPeriod}
                      variant="outlined"
                      sx={{
                        flex: 1,
                        bgcolor: colors.primary[400],
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
                        },
                        border: "1px solid #ddd",
                        borderRadius: 2,
                        color: "rgb(41, 177, 237)",
                      }}
                      disabled={!isLastPeriodComplete()} // ⛔️ disable if last period is incomplete
                    >
    Adicionar etapa
                    </Button>

                    <Button
                      variant="contained"
                      onClick={onAuditSubmit}
                      sx={{
                        flex: 1,
                        bgcolor: colors.primary[400],
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
                        },
                        border: "1px solid #ddd",
                        borderRadius: 2,
                        color: "rgb(41, 177, 237)",
                      }}
                    >
    Calcular shelf life
                    </Button>
                  </Box>
                </Box>)}
              {activeTab === "history" && (
                <Box m="20px">
                  {loadingBatches ? (
                    <Box mt={4} display="flex" justifyContent="center">
                      <CircularProgress />
                    </Box>
                  ) : savedBatches.length === 0 ? (
                    <Typography mt={4} color="textSecondary">
        Nenhum lote encontrado.
                    </Typography>
                  ) : (
                    <Box mt={2} display="flex" flexDirection="column" gap={2}>
                      {savedBatches.map((batch, index) => (
                        <Paper key={index} sx={{ p: 2, backgroundColor: colors.primary[400] }}>
                          <Typography variant="h6" color="rgb(42, 180, 234)">
                            {batch.batchName}
                          </Typography>
                          <Typography variant="body2" color={colors.grey[100]}>
              Períodos: {batch.periods?.length || 0}
                          </Typography>
                          <Typography variant="body2" color={colors.grey[300]}>
              Criado por: {user?.name || "Usuário desconhecido"}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Box>
        </>)}
      {loading && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100%"
          height="100%"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          zIndex={9999}
        >
          <CircularProgress />
          <Typography mt={2}>Aguarde enquanto nosso modelo de IA processa seus dados!</Typography>
        </Box>
      )}
      {page === "result" && chartData.length > 0 && (() => {
        const threshold = auditData.microbialThreshold ?? 8;
  
        return (
          <ShelfDetailsPage
            setPage={setPage}
            selectedStore={selectedStore}
            selectedPlace={selectedPlace}
            chartData={chartData}
            isSmallScreen={isSmallScreen}
            periods={auditData.periods}
            microbialThreshold={threshold}
            devices = {devices}
          />
        );
      })()}
    </LocalizationProvider>
  );
}
