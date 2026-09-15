import {
  Box,
  Button,
  Paper,
  Popper,
  ClickAwayListener,
  List,
  ListItemButton,
  ListItemText, useTheme
} from "@mui/material";
import React, { useState, useRef } from "react";
import { tokens } from "../../theme";

const DeviceSelector = ({ devices, selectedDeviceId, onSelect, label = "Selecionar Dispositivo", colorTheme }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleToggle = () => setOpen(prev => !prev);
  const handleClickAway = () => setOpen(false);

  const selectedDevice = devices.find(d => d.device_id === selectedDeviceId);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box>
        <Button
          variant="outlined"
          ref={anchorRef}
          onClick={handleToggle}
          fullWidth
          sx={{
            height: 56,
            width: 250,
            backgroundColor: colors.primary[400],
            color: selectedDeviceId ? "#2ab4ea" : colors.grey[100],
            border: `1px solid ${selectedDeviceId ? "#2ab4ea" : "#ddd"}`,
            justifyContent: "space-between",
            textTransform: "none",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
              border: `1px solid ${selectedDeviceId ? "#2ab4ea" : "#ccc"}`,
            },
          }}
        >
          {selectedDevice
            ? (selectedDevice.name || selectedDevice.device_id)
            : label}
        </Button>

        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ zIndex: 1300, width: anchorRef.current?.offsetWidth || 250 }}
        >
          <Paper sx={{ maxHeight: 250, overflowY: "auto", width: "100%" }}>
            <List dense>
              {devices?.length > 0 ? (
                devices.map((device) => (
                  <ListItemButton
                    key={device.device_id}
                    onClick={() => {
                      onSelect(device.device_id);
                      setOpen(false);
                    }}
                    selected={selectedDeviceId === device.device_id}
                  >
                    <ListItemText
                      primary={device.name || device.device_id}
                      secondary={`${device.company} / ${device.type}`}
                    />
                  </ListItemButton>
                ))
              ) : (
                <ListItemText primary="Nenhum dispositivo encontrado." />
              )}
            </List>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default DeviceSelector;
