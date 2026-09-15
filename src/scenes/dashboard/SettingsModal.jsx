import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { Box, IconButton, Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";

const SettingsModal = ({sensorData, setSensorData, openModal, handleCloseModal, handleSaveSensorType, handleDeleteSensor}) => {
  return (
    <Dialog
      open={openModal}
      onClose={handleCloseModal}
      sx={{
        "& .MuiDialog-paper": {
          padding: "10px",
          borderRadius: "8px",
          width: "400px", // Set a fixed width for the modal
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <IconButton onClick={handleCloseModal} sx={{ color: "rgb(42, 180, 234)" }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <IconButton onClick={handleSaveSensorType} sx={{ color: "rgb(42, 180, 234)" }}>
              <SaveIcon />
            </IconButton>
            <IconButton onClick={handleDeleteSensor} sx={{ color: "rgb(42, 180, 234)" }}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Local do Sensor"
          value={sensorData.type}
          onChange={(e) => setSensorData({ ...sensorData, type: e.target.value })}
          margin="normal"
          sx={{
            marginBottom: "15px",
            "& .MuiInputLabel-root": {
              // Only change label color when focused
              "&.Mui-focused": {
                color: "rgb(42, 180, 234)", // Blue color when focused
              }
            },
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: "rgb(42, 180, 234)", // Blue border on focus
              }
            }
          }}
        />
        <TextField
          fullWidth
          label="Temperatura Máxima"
          type="number"
          value={sensorData.maxTemp}
          onChange={(e) => setSensorData({ ...sensorData, maxTemp: e.target.value })}
          margin="normal"
          sx={{
            marginBottom: "15px",
            "& .MuiInputLabel-root": {
              // Only change label color when focused
              "&.Mui-focused": {
                color: "rgb(42, 180, 234)", // Blue color when focused
              }
            },
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: "rgb(42, 180, 234)", // Blue border on focus
              }
            }
          }}
        />
        <TextField
          fullWidth
          label="Temperatura Mínima"
          type="number"
          value={sensorData.minTemp}
          onChange={(e) => setSensorData({ ...sensorData, minTemp: e.target.value })}
          margin="normal"
          sx={{
            marginBottom: "15px",
            "& .MuiInputLabel-root": {
              // Only change label color when focused
              "&.Mui-focused": {
                color: "rgb(42, 180, 234)", // Blue color when focused
              }
            },
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: "rgb(42, 180, 234)", // Blue border on focus
              }
            }
          }}
        />
        <TextField
          fullWidth
          label="Inconformidades Antes de Alarme"
          type="number"
          value={sensorData.wrongsBeforeAlarm}
          onChange={(e) => setSensorData({ ...sensorData, wrongsBeforeAlarm: e.target.value })}
          margin="normal"
          sx={{
            "& .MuiInputLabel-root": {
              // Only change label color when focused
              "&.Mui-focused": {
                color: "rgb(42, 180, 234)", // Blue color when focused
              }
            },
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: "rgb(42, 180, 234)", // Blue border on focus
              }
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
