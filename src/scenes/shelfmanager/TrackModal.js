import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { Select, Box, IconButton, Dialog, DialogContent, DialogTitle, TextField, MenuItem, InputLabel, FormControl } from "@mui/material";
import { useState } from "react";

const TrackModal = ({ openModal, handleCloseModal, chartData, microbialThreshold, periods, devices, batchName
}) => {
  const [location, setLocation] = useState("");
  const [alarmTime, setAlarmTime] = useState("");
  const defaultThreshold = 8;
  const user = JSON.parse(localStorage.getItem("profile"));

  const effectiveThreshold = microbialThreshold;
  console.log(batchName);

  const handleSave = async() => {
    if (!chartData || chartData.length === 0) return;
    const matchingDevice = devices.find((d) => d.device_id === location);
    const lastPredictionTimestamp = chartData[chartData.length - 1].timestamp;
    const lastShelfLife = chartData[chartData.length - 1].shelf_life_remaining;
    const leftoverTemps = chartData.map(entry => entry.temperature);
    const lastMicrobialLoad = chartData[chartData.length - 1].microbial_load ?? null; // requires this field
    const updatedPredictions = {
      lastPredictionTimestamp,
      leftoverTemps,
      lastMicrobialLoad,
      lastShelfLife,
      alarmTime,
      microbialThreshold: effectiveThreshold,
    };

    if (!matchingDevice) {
      console.warn("⚠️ Dispositivo não encontrado para a localização selecionada.");
      handleCloseModal();
      return;
    }
    try {
      await fetch(`https://3sg24s13ja.execute-api.sa-east-1.amazonaws.com/dev/batches?companyID=${encodeURIComponent(user.Company)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchName, monitored: true }),
      });
      console.log("✅ Lote atualizado para monitored = true");
    } catch (err) {
      console.error("❌ Erro ao atualizar lote:", err);
    }
  
    try {
      const response = await fetch(
        "https://afuud4nek9.execute-api.sa-east-1.amazonaws.com/dev/sensors",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            device_id: matchingDevice.device_id,
            type: matchingDevice.type,
            predictions: updatedPredictions,
          }),
        }
      );
  
      if (!response.ok) {
        console.error("❌ Erro ao salvar sensor:", await response.text());
      } else {
        console.log("✅ Sensor salvo com sucesso.");
      }
    } catch (error) {
      console.error("❌ Erro de rede ao salvar sensor:", error);
    }
  
    handleCloseModal();
  };

  const handleSettingsClick = async() => {
    if (monitored) {
      const confirmStop = window.confirm(
        "Tem certeza que quer parar de monitorar esse lote?"
      );
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

        setAuditData(prev => ({ ...prev, monitored: false }));
        alert("Monitoramento do lote parado com sucesso.");
      } catch (error) {
        console.error(error);
        alert("Falha ao parar monitoramento.");
      }
    } else {
    // Caso monitoração esteja false, pode rodar a função normal, tipo abrir modal, etc
      await handleOpenModal();
    }
  };


  return (
    <Dialog
      open={openModal}
      onClose={handleCloseModal}
      sx={{
        "& .MuiDialog-paper": {
          padding: "10px",
          borderRadius: "8px",
          width: "400px",
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <IconButton onClick={handleCloseModal} sx={{ color: "rgb(42, 180, 234)" }}>
            <ArrowBackIcon />
          </IconButton>
          <IconButton onClick={handleSave} sx={{ color: "rgb(42, 180, 234)" }}>
            <SaveIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal" sx={{ 
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
        }}>
          <InputLabel sx={{ color: "rgb(42, 180, 234)" }}>
    Local do Sensor
          </InputLabel>
          <Select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            label="Local do Sensor"
            sx={{
              "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                borderColor: "rgb(42, 180, 234)",
              },
            }}
          >
            {periods?.length > 0 ? (
              periods.map((p, idx) => (
                <MenuItem key={idx} value={p.location}>
                  {p.location}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled value="">
        Nenhum período disponível
              </MenuItem>
            )}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Tempo para alarme"
          type="number"
          margin="normal"
          value={alarmTime}
          onChange={(e) => setAlarmTime(e.target.value)}
          sx={{ 
            marginBottom: "15px",
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
      </DialogContent>
    </Dialog>
  );
};

export default TrackModal;
