import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box, IconButton, Typography, useTheme, Button, TextField } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import {
  LineChart, Line,XAxis,YAxis,CartesianGrid, ReferenceArea, Tooltip,ResponsiveContainer,Legend, ReferenceLine
} from "recharts";
import TrackModal from "./TrackModal";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import dashboardStyles from "../dashboard/styles";


const ShelfDetailsPage = ({
  setPage,
  setChartData,
  selectedPlace,
  chartData,
  isSmallScreen,
  periods,
  microbialThreshold, devices, batchName, monitored, setAuditData }) => {
  const hasShelfLife = chartData.some((entry) => "shelf_life_remaining" in entry);
  const [microbialModalOpen, setMicrobialModalOpen] = useState(false);
  const hasEndedWithNow = periods.some(p => p.endedWithNow);

  const user = JSON.parse(localStorage.getItem("profile"));
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const styles = dashboardStyles(colors);
  const [openModal, setOpenModal] = useState(false);
  const [inputMicrobialThreshold, setInputMicrobialThreshold] = useState(
    8
  );

  const handleSettingsClick = async() => {
    if (monitored) {
      // botão laranja → pergunta e desliga monitoramento
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
        console.log(response);
        if (!response.ok) throw new Error("Erro ao atualizar monitoramento.");
        setAuditData(prev => ({ ...prev, monitored: false }));
        alert("Monitoramento do lote parado com sucesso.");
      } catch (error) {
        alert("Falha ao parar monitoramento.");
      }
    } else {
      // botão azul → abre o modal normalmente
      handleOpenModal();
    }
  };
  
  const handleOpenModal = async() => {
    await submitMicrobialThresholdAndRun();
    setOpenModal(true);
  };
  const handleCloseModal = () => setOpenModal(false);
  const handleDownload = () => {
    if (!chartData || chartData.length === 0) {
      alert("Sem dados para exportar.");
      return;
    }
  
    const csvHeader = ["timestamp", "temperature", ...(chartData.some(d => "shelf_life_remaining" in d) ? ["shelf_life_remaining"] : [])];
  
    const csvRows = chartData.map((entry) => {
      const row = [
        new Date(entry.timestamp).toLocaleString(), // ou entry.timestamp diretamente se preferir raw ISO
        entry.temperature.toFixed(2),
      ];
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


  const submitMicrobialThresholdAndRun = async() => {
    if (!inputMicrobialThreshold || inputMicrobialThreshold <= 0) {
      alert("Informe um valor válido para o limite microbiano.");
      return;
    }
    setMicrobialModalOpen(false); 
    try {
      const filledData = chartData.map(({ timestamp, temperature }) => ({
        timestamp,
        temperature,
      }));
  
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
  
      const { timestamps, microbial_load, shelf_life_remaining } = response.data;
  
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
  
  return (
    <Box>
      <Box m="20px">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title={batchName} subtitle={<strong>Detalhes do lote </strong>} />

          <Box display="flex" alignItems="center" gap="10px">
            <IconButton onClick={() => setPage("input")} sx={{ ...styles.iconButton, color: "rgb(42, 180, 234)" }}>
              <ArrowBackIcon />
            </IconButton>
            <IconButton onClick={() => setMicrobialModalOpen(true)} sx={{ ...styles.iconButton, color: "rgb(42, 180, 234)" }}>
              <DeviceHubIcon />
            </IconButton>
            {(hasEndedWithNow || monitored) && (
              <IconButton
                onClick={handleSettingsClick}
                sx={{
                  ...styles.iconButton,
                  color: hasEndedWithNow ? "rgb(42, 180, 234)" : "orange",
                }}
              >
                <SettingsIcon />
              </IconButton>
            )}

            <IconButton sx={{ ...styles.iconButton, color: "rgb(42, 180, 234)" }} onClick={handleDownload}>
              <DownloadOutlinedIcon />
            </IconButton>
               
          </Box>
        </Box>    
        <Box
          backgroundColor={colors.primary[400]}
          borderRadius="8px"
          p={2}
          mb={2}
        >
          <Typography variant="h5" fontWeight="600" color={colors.grey[100]} mb={1}>
    Períodos Avaliados
          </Typography>

          {periods.length === 0 ? (
            <Typography color={colors.grey[300]}>Nenhum período informado.</Typography>
          ) : (
            periods.map((period, idx) => (
              <Box
                key={idx}
                display="flex"
                flexDirection={isSmallScreen ? "column" : "row"}
                justifyContent="space-between"
                alignItems="center"
                mb={1}
                p={1}
                borderRadius="4px"
                sx={{ backgroundColor: colors.primary[400] }}
              >
                <Typography color="rgb(42, 180, 234)" fontWeight="500">
          Sensor: <strong>{period.location}</strong>
                </Typography>
                <Typography color={colors.grey[100]} fontSize="0.85rem">
          De: {period.from ? new Date(period.from).toLocaleString() : "—"} <br />
          Até: {period.to ? new Date(period.to).toLocaleString() : "—"}
                </Typography>
              </Box>
            ))
          )}
        </Box>
        <Box display="grid" gridAutoRows="120px" gap="20px" gridTemplateColumns="repeat(12, 1fr)">
         
          <Box gridColumn={isSmallScreen ? "span 12" : "span 8"} gridRow="span 2"
            backgroundColor={colors.primary[400]} >
            <Box mt="5px" p="0 30px" display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">

                <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
                  Vida de prateleira restante:
                </Typography>
                <Typography variant="h5" fontWeight="bold" color={"rgb(42, 180, 234)"} ml="5px">
                  {hasShelfLife && chartData.length > 0 && chartData[chartData.length - 1].shelf_life_remaining !== undefined
                    ? `${chartData[chartData.length - 1].shelf_life_remaining.toFixed(1)} h`
                    : "—"}
                </Typography>
              </Box>
 
            </Box>
            <Box height="250px" mt="-20px">
              <ResponsiveContainer width="100%" height={300}>
 
                <LineChart data={chartData} margin={{ top: 40, right: 30, bottom: 50, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grey[600]} />
                  <XAxis dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleString()} // Format for readable labels
                    stroke={colors.grey[100]}
                    tick={{ fill: colors.grey[100] }}
                    axisLine={{ stroke: colors.grey[600] }}/>
  
                  {hasShelfLife && (
                    <>
                      <YAxis
                        yAxisId="left"
                        label={{
                          value: "Vida de prateleira (horas)",
                          angle: -90,
                          fill: colors.grey[100],
                          dx: -10
                        }}
                        stroke={colors.grey[100]}
                        tick={{ fill: colors.grey[100] }}
                        axisLine={{ stroke: colors.grey[600] }}
                      />

                      <Line
                        type="monotone"
                        dataKey="shelf_life_remaining"
                        stroke="#ff7300"
                        strokeWidth={2}
                        yAxisId="left"
                        dot={false}
                        name="Vida de Prateleira"
                      />
                    </>
                  )}

                  {/* Right axis for average temperature */}
                  <YAxis yAxisId="right" orientation="right" domain={["auto", "auto"]} tickFormatter={(val) => val.toFixed(1)} 
                    label={{ value: "Temperatura (°C)", angle: 90, fill: colors.grey[100], dx: 20 }}
                    stroke={colors.grey[100]}
                    tick={{ fill: colors.grey[100] }}
                    axisLine={{ stroke: colors.grey[600] }}
                  />

                  <Tooltip
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleString();
                    }}
                    formatter={(value, name) => {
                      const formattedValue = typeof value === "number" ? value.toFixed(1) : value;
    
                      let unit = "";
                      if (name === "Temperatura") {
                        unit = "°C";
                      } else if (name === "Vida de Prateleira") {
                        unit = "h";
                      }

                      return [`${formattedValue} ${unit}`, name];
                    }}
                  />
                  <Legend />


                  {/* Microbial load on left axis or right axis? You can adjust similarly */}

                  {/* Average Temperature line on right axis */}
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#00bcd4"
                    strokeWidth={2}                      
                    yAxisId="right"
                    dot={false}
                    name="Temperatura"
                  />
                </LineChart>
              </ResponsiveContainer>

            </Box>

          </Box>
          {!isSmallScreen && (
            <Box
              gridColumn="span 4"
              gridRow="span 2"
              backgroundColor={colors.primary[400]}
              overflow="auto"
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                borderBottom={`2px solid ${colors.primary[400]}`}
                colors={colors.grey[100]}
                p="15px"
              >
                <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
                  Medidas Recentes
                </Typography>
              </Box>
              {chartData.length > 0 && chartData.slice(-5).reverse().map((measurement) => (
                <Box
                  key={`${measurement.timestamp}`}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  borderBottom={`3px solid ${colors.primary[400]}`}
                  p="10px"
                >
                  <Box>
                    <Typography
                      color={"rgb(42, 180, 234)"}
                      variant="h5" fontWeight="600"
                    >
                      {measurement.temperature.toFixed(1)} °C
                    </Typography>
                    <Typography color={colors.grey[100]}>
                      {new Date(measurement.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
             
                  {measurement.shelf_life_remaining !== undefined && (
                    <Box
                      backgroundColor={"rgb(42, 180, 234)"}
                      p="5px 10px"
                      borderRadius="4px"
                      color="white"
                    >
                      {measurement.shelf_life_remaining.toFixed(1)} h
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}

        </Box>
      </Box>
      <TrackModal
        openModal={openModal}
        handleCloseModal={handleCloseModal}
        chartData={chartData}
        microbialThreshold={microbialThreshold}
        periods={periods}
        devices = {devices}
        batchName={batchName}
      />     

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
          bgcolor="rgba(0, 0, 0, 0.5)"
        >
          <Box
            bgcolor={colors.primary[400]}
            p={4}
            borderRadius="8px"
            minWidth="300px"
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <Typography variant="h6" color={colors.grey[100]} mb={2}>
        Informe o limite microbiano
            </Typography>
            <TextField
              type="number"
              label="Limite"
              value={inputMicrobialThreshold}
              onChange={(e) => setInputMicrobialThreshold(Number(e.target.value))}
              inputProps={{ min: 0, step: 0.1 }}
              sx={{ mb: 2 ,
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
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                sx={{ bgcolor: "rgb(42, 180, 234)", color: "#fff" }}
                onClick={submitMicrobialThresholdAndRun}
              >
          Rodar Modelo
              </Button>
              <Button
                variant="outlined"
                onClick={() => setMicrobialModalOpen(false)}
                sx={{
                  color: "rgb(42, 180, 234)",
                  borderColor: "rgb(42, 180, 234)",
                  "&:hover": {
                    borderColor: "rgb(42, 180, 234)",
                    backgroundColor: "rgba(42, 180, 234, 0.08)", // leve destaque no hover
                  },
                }}
              >
  Cancelar
              </Button>
            </Box>
          </Box>
        </Box>
      )}

    </Box>
  );
};

export default ShelfDetailsPage;
