import React from "react";
import { Button, Box } from "@mui/material";

const DeviceButtons = ({ devices, selectedDevice, setSelectedDevice, colors }) => (
  <Box display="flex" flexWrap="wrap" gap="10px">
    {devices.map((device) => (
      <Button
        key={device}
        variant={device === selectedDevice ? "contained" : "outlined"}
        color="primary"
        onClick={() => setSelectedDevice(device)}
        sx={{
          color: device === selectedDevice ? colors.primary[500] : colors.grey[100],
          backgroundColor: device === selectedDevice ? colors.greenAccent[500] : colors.primary[400],
          borderColor: colors.grey[100],
          "&:hover": {
            backgroundColor: device === selectedDevice ? colors.greenAccent[600] : colors.primary[900],
            color: colors.grey[300],
          },
          width: "170px",
        }}
      >
        Sensor {device}
      </Button>
    ))}
  </Box>
);

export default DeviceButtons;
