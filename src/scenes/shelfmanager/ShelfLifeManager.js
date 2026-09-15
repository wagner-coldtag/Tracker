import AddIcon from "@mui/icons-material/Add";
import {
  Box, TextField,Button,Typography,Paper,useMediaQuery, useTheme, CircularProgress, Tabs, Tab
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import React, { useState, useEffect } from "react";
import DeviceSelector from "./DeviceSelector";
import ShelfDetailsPage from "./ShelfDetailsPage";
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

  const processTemperatureDataFromPeriods = async(periods, fetchTemperatureDataFn) => {
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
  
  const onAuditSubmit = async() => {
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
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
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
            >
              <Tab label="Criar" value="predict" />
              <Tab label="Consultar" value="history" />
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
              */}   <TextField
                  label="Nome do lote"
                  fullWidth
                  margin="normal"
                  value={auditData.batchName ?? ""}
                  onChange={(e) =>
                    setAuditData({
                      ...auditData,
                      batchName: e.target.value === "" ? undefined : e.target.value,
                    })
                  }
                  sx={{ 
                    "& .MuiOutlinedInput-root": {
                      height: "45px",
                      "& .MuiInputBase-input": {
                        padding: "12px 14px", // Vertical centering
                        fontSize: "1rem",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgb(30,182,250)", // Light blue outline on focus
                      },
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "1rem",
                      top: "-6px",
                      "&.Mui-focused": {
                        color: "rgb(30,182,250)", // Light blue label color on focus
                      },
                    },
                  }}
                />
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
                              newPeriods[index] = {
                                ...newPeriods[index],
                                to: new Date(),
                                endedWithNow: true, // << este flag que será passado para o results
                              };
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
    CRIAR LOTE
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
                      <Paper
                        key={index}
                        sx={{
                          border: "1px solid #ddd",
                          borderRadius: 2,
                          cursor: "pointer",
                          backgroundColor: colors.primary[400],
                          transition: "0.3s",
                          position: "relative", // necessário para posicionar o botão
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
                          },
                          p: 2,
                        }}
                      >
                        <Box onClick={async() => {
                          setLoading(true);
                          try {
                            const payloadData = await processTemperatureDataFromPeriods(batch.periods, fetchTemperatureData);
                            setChartData(payloadData);
                            setAuditData({
                              batchName: batch.batchName,
                              periods: batch.periods.map(period => {
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
                        }}>
                          <Typography variant="h6" color="rgb(42, 180, 234)">
                            {batch.batchName}
                          </Typography>
                          <Typography variant="body2" color={colors.grey[100]}>
                            Períodos: {batch.periods?.length || 0}
                          </Typography>
                          <Typography variant="body2" color={colors.grey[300]}>
                            Criado por: {user?.name || "Usuário desconhecido"}
                          </Typography>
                        </Box>
                      
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            minWidth: "auto",
                            padding: "2px 8px",
                            fontSize: "0.75rem",
                          }}
                          onClick={async(e) => {
                            e.stopPropagation(); // impede que o clique carregue os dados
                            const confirm = window.confirm(`Deseja realmente deletar o lote "${batch.batchName}"?`);
                            if (!confirm) return;
                      
                            try {
                              const response = await fetch(
                                `https://3sg24s13ja.execute-api.sa-east-1.amazonaws.com/dev/batches?companyID=${encodeURIComponent(user.Company)}`,
                                {
                                  method: "DELETE",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
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
                          Deletar
                        </Button>
                      </Paper>
                    ))}

                  </Box>
                )}
              </Box>
            )}
          </Box>
        </>)}
      {loading && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100vw"
          height="100vh"
          bgcolor="rgba(0, 0, 0, 0.7)" // ✅ dark translucent overlay
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          zIndex={1300} // ✅ above everything else
          sx={{ backdropFilter: "blur(2px)" }} // optional blur effect
        >
          <CircularProgress sx={{ color: "white" }} />
          <Typography mt={2} color="white">
          Coletando dados do lote!
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
            devices = {devices}
            batchName={auditData.batchName}
            monitored={auditData.monitored}
            setAuditData={setAuditData}
          />
        );
      })()}
    </LocalizationProvider>
  );
}
