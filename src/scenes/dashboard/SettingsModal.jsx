import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme";

// Same soft red used across the sensor UI
const ALERT_COLOR = "#e5695a";

const SectionLabel = ({ children, colors }) => (
  <Typography
    variant="caption"
    sx={{
      display: "block",
      mb: 1.5,
      color: colors.grey[300],
      fontWeight: 700,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    }}
  >
    {children}
  </Typography>
);

const SettingsModal = ({
  sensorData,
  setSensorData,
  openModal,
  handleCloseModal,
  handleSaveSensorType,
  handleDeleteSensor,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const okColor = colors.blueAccent[500];

  const update = (field) => (e) => setSensorData({ ...sensorData, [field]: e.target.value });

  // Min must be lower than max (only checked when both are filled in)
  const hasBoth =
    sensorData.minTemp !== "" &&
    sensorData.maxTemp !== "" &&
    sensorData.minTemp != null &&
    sensorData.maxTemp != null;
  const rangeInvalid = hasBoth && Number(sensorData.minTemp) >= Number(sensorData.maxTemp);

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
      "& fieldset": { borderColor: colors.grey[700] },
      "&:hover fieldset": { borderColor: okColor },
      "&.Mui-focused fieldset": { borderColor: okColor, borderWidth: 1 },
      "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(okColor, 0.2)}` },
      "&.Mui-error fieldset": { borderColor: ALERT_COLOR },
      "&.Mui-error.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(ALERT_COLOR, 0.2)}` },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: okColor },
    "& .MuiInputLabel-root.Mui-error": { color: ALERT_COLOR },
    "& .MuiFormHelperText-root.Mui-error": { color: ALERT_COLOR },
  };

  const degreeAdornment = {
    endAdornment: <InputAdornment position="end">°C</InputAdornment>,
  };

  return (
    <Dialog
      open={openModal}
      onClose={handleCloseModal}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: colors.primary[400],
          backgroundImage: "none",
          border: `1px solid ${colors.grey[700]}`,
          m: 2,
          width: "100%",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: `1px solid ${colors.grey[700]}`,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Configurações
          </Typography>
          <Typography variant="body2" sx={{ color: colors.grey[300] }}>
            {sensorData.device_id}
          </Typography>
        </Box>
        <IconButton onClick={handleCloseModal} sx={{ color: colors.grey[300] }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Body */}
      <DialogContent sx={{ px: 3, pt: "24px !important", pb: 1 }}>
        <Box mb={3}>
          <SectionLabel colors={colors}>Identificação</SectionLabel>
          <TextField
            fullWidth
            size="small"
            label="Local do Sensor"
            value={sensorData.type ?? ""}
            onChange={update("type")}
            sx={fieldSx}
          />
        </Box>

        <Box mb={3}>
          <SectionLabel colors={colors}>Faixa de temperatura</SectionLabel>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              size="small"
              label="Mínima"
              type="number"
              value={sensorData.minTemp ?? ""}
              onChange={update("minTemp")}
              error={rangeInvalid}
              InputProps={degreeAdornment}
              sx={fieldSx}
            />
            <TextField
              fullWidth
              size="small"
              label="Máxima"
              type="number"
              value={sensorData.maxTemp ?? ""}
              onChange={update("maxTemp")}
              error={rangeInvalid}
              InputProps={degreeAdornment}
              sx={fieldSx}
            />
          </Box>
          {rangeInvalid && (
            <Typography variant="caption" sx={{ color: ALERT_COLOR, display: "block", mt: 0.75 }}>
              A temperatura mínima deve ser menor que a máxima.
            </Typography>
          )}
        </Box>

        <Box mb={1}>
          <SectionLabel colors={colors}>Alarme</SectionLabel>
          <TextField
            fullWidth
            size="small"
            label="Inconformidades antes do alarme"
            type="number"
            value={sensorData.wrongsBeforeAlarm ?? ""}
            onChange={update("wrongsBeforeAlarm")}
            inputProps={{ min: 1, step: 1 }}
            helperText="Quantas leituras fora da faixa até disparar um alarme."
            sx={fieldSx}
          />
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          mt: 1,
          borderTop: `1px solid ${colors.grey[700]}`,
          justifyContent: "space-between",
        }}
      >
        <Button
          onClick={handleDeleteSensor}
          startIcon={<DeleteOutlineIcon />}
          sx={{
            color: ALERT_COLOR,
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            "&:hover": { backgroundColor: alpha(ALERT_COLOR, 0.1) },
          }}
        >
          Excluir
        </Button>

        <Box display="flex" gap={1}>
          <Button
            onClick={handleCloseModal}
            sx={{
              color: colors.grey[200],
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveSensorType}
            disabled={rangeInvalid}
            variant="contained"
            startIcon={<SaveIcon />}
            disableElevation
            sx={{
              backgroundColor: okColor,
              color: "#fff",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              "&:hover": { backgroundColor: alpha(okColor, 0.85) },
              "&.Mui-disabled": { backgroundColor: alpha(okColor, 0.3), color: "#fff" },
            }}
          >
            Salvar
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal;