import { MenuItem, TextField, Typography, alpha, useTheme } from "@mui/material";
import React from "react";
import { tokens } from "../../theme";

const DeviceSelector = ({ devices, selectedDeviceId, onSelect, label = "Selecionar dispositivo" }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const okColor = colors.blueAccent[500];

  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      value={selectedDeviceId || ""}
      onChange={(e) => onSelect(e.target.value)}
      SelectProps={{
        MenuProps: { PaperProps: { sx: { maxHeight: 300 } } },
        renderValue: (value) => {
          const d = devices?.find((dev) => dev.device_id === value);
          return d?.name || value;
        },
        displayEmpty: true,
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 3,
          backgroundColor: colors.primary[400],
          "& fieldset": { borderColor: colors.grey[700] },
          "&:hover fieldset": { borderColor: okColor },
          "&.Mui-focused fieldset": { borderColor: okColor, borderWidth: 1 },
          "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(okColor, 0.2)}` },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: okColor },
      }}
    >
      {devices?.length > 0 ? (
        devices.map((device) => (
          <MenuItem key={device.device_id} value={device.device_id}>
            <Typography variant="body1">{device.name || device.device_id}</Typography>
            <Typography variant="caption" sx={{ ml: 1, color: colors.grey[300] }}>
              {device.company} / {device.type}
            </Typography>
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled value="">
          Nenhum dispositivo encontrado.
        </MenuItem>
      )}
    </TextField>
  );
};

export default DeviceSelector;