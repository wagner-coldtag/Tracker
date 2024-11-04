import React, { useState, useEffect } from "react";
import { Box, Button, Typography, IconButton, useTheme, useMediaQuery } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import DeleteIcon from "@mui/icons-material/Delete"; // Icon for exclusion

const Sensors = () => {
  const theme = useTheme();
  const handleDelete = async () => {
    if (!selectedDevice) return;

    try {
      const response = await fetch("https://o1efafyvn2.execute-api.sa-east-1.amazonaws.com/dev/devices", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ device_id: selectedDevice })
      });

      if (!response.ok) {
        throw new Error("Failed to delete device");
      }

      // Remove the device from the list after successful deletion
      setDevices(devices.filter((device) => device !== selectedDevice));
      setSelectedDevice(null); // Clear the selected device
      console.log("Device deleted successfully");

    } catch (error) {
      console.error("Error deleting device:", error);
    }
  };
  const colors = tokens(theme.palette.mode);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Check if the screen is small

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch("https://08mwl5gxyj.execute-api.sa-east-1.amazonaws.com/devices");
        if (!response.ok) throw new Error("Network response was not ok");
        const jsonData = await response.json();

        const fetchedDevices = jsonData.device_ids;

        setDevices(fetchedDevices);
        if (fetchedDevices.length > 0) setSelectedDevice(fetchedDevices[0]);
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };

    fetchDevices(); // Fetch devices initially
  }, []);

  if (isSmallScreen) {
    return (
      <Box m="20px">
        <Box height="400px">
          <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
          <Box>
            {devices.map((device) => (
              <Button
                key={device}
                variant={device === selectedDevice ? "contained" : "outlined"}
                color="primary"
                onClick={() => setSelectedDevice(device)}
                sx={{
                  mr: "10px",
                  color: device === selectedDevice ? colors.primary[500] : colors.grey[100],
                  backgroundColor: device === selectedDevice ? colors.greenAccent[500] : colors.primary[400],
                  borderColor: colors.grey[100],
                  "&:hover": {
                    backgroundColor: device === selectedDevice ? colors.greenAccent[600] : colors.primary[900],
                    color: colors.grey[300],
                  },
                  width: "170px", // Fixes the width of each button
                  height: "30px", // Optionally adjust the height
                }}
              >
                Sensor {device}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box m="20px">
        {/* DEVICE BUTTONS */}
        <Box
          display="flex"
          flexWrap="wrap"
          gap="10px"  // Adds spacing between buttons
          justifyContent="flex-start"  // Aligns buttons to the start
          sx={{
            "& > *": { // Makes all buttons the same size
              minWidth: "120px", // Adjust width to desired size
            },
            mb: "20px", // Adds margin below the button group
            mt: "20px"
          }}
        >
          {devices.map((device) => (
            <Button
              key={device}
              variant={device === selectedDevice ? "contained" : "outlined"}
              color="primary"
              onClick={() => setSelectedDevice(device)}
              sx={{
                mr: "10px",
                color: device === selectedDevice ? colors.primary[500] : colors.grey[100],
                backgroundColor: device === selectedDevice ? colors.greenAccent[500] : colors.primary[400],
                borderColor: colors.grey[100],
                "&:hover": {
                  backgroundColor: device === selectedDevice ? colors.greenAccent[600] : colors.primary[900],
                  color: colors.grey[300],
                },
                width: "170px", // Fixes the width of each button
                height: "30px", // Optionally adjust the height
              }}
            >
              Sensor {device}
            </Button>
          ))}
        </Box>

        {/* CONDITIONAL BOX FOR SELECTED DEVICE */}
        {selectedDevice && (
          <Box mt="10px" p="10px"
            bgcolor={colors.grey[800]}
            borderRadius="8px"
            alignItems="center"
            justifyContent="space-between"
            width="250px">
            <Typography variant="h6" color="textPrimary">
                 Sensor {selectedDevice}
            </Typography>

            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" color="textSecondary">
        Type: Placeholder text
              </Typography>
              <IconButton onClick={handleDelete}>
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default Sensors;
