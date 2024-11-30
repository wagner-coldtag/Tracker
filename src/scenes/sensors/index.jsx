import React, { useState, useEffect } from "react";
import { Box, Button, Typography, IconButton, useTheme, TextField, Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle, } from "@mui/material";
import { tokens } from "../../theme";
import RefreshIcon from "@mui/icons-material/Refresh";
import Header from "../../components/Header";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import DeleteIcon from "@mui/icons-material/Delete"; // Icon for exclusion
import axios from "axios";
import SaveIcon from "@mui/icons-material/Save"; // Import the Save icon
import useFetchSensorData from "../dashboard/utils/useFetchSensorData";

const Sensors = () => {
  const theme = useTheme();
  const { refreshDevices } = useFetchSensorData();

  const [sensorType, setSensorType] = useState("");
  const [pH, setPH] = useState("");  // State for pH
  const [aw, setAw] = useState("");  // State for aw
  const [openModal, setOpenModal] = useState(false); // State for modal
  const [productType, setProductType] = useState("");  // State for productType
  const user = JSON.parse(localStorage.getItem("profile"));

  const handleDelete = async () => {
    if (!selectedDevice) return;

    try {
      const response = await fetch("https://o1efafyvn2.execute-api.sa-east-1.amazonaws.com/dev/devices", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ device_id: selectedDevice?.device_id })
      });

      if (!response.ok) {
        throw new Error("Failed to delete device");
      }

      setDevices(devices.filter((device) => device.device_id !== selectedDevice?.device_id));
      setSelectedDevice(null); // Clear the selected device
      console.log("Device deleted successfully");
      const responseSensors = await axios.delete("https://nrsx9ksod5.execute-api.sa-east-1.amazonaws.com/prod/sensors", {
        headers: {
          "Content-Type": "application/json"
        },
        data: JSON.stringify({
          device_id: selectedDevice.device_id
        })
      });

      if (!responseSensors.ok) {
        throw new Error("Failed to delete sensor from Sensors database");
      }

      console.log("Sensor deleted successfully from Sensors database");

    } catch (error) {
      console.error("Error deleting device:", error);
    }
  };

  const handleSaveSensorType = async () => {
    if (!selectedDevice || !sensorType || !pH || !aw || !productType) return;

    try {
      const response = await fetch(
        "https://afuud4nek9.execute-api.sa-east-1.amazonaws.com/dev/sensors",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            device_id: selectedDevice?.device_id,
            type: sensorType,
            pH: pH,
            aw: aw,
            productType: productType,
          }),
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || "Failed to save sensor details");
      }
      fetchSensorData();

      setOpenModal(true);
    } catch (error) {
      console.error("Error saving sensor details:", error);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Close the modal
  };

  const colors = tokens(theme.palette.mode);

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const fetchSensorData = async () => {
    try {
      const company = user.Company;  // Get the user's company
      const response = await axios.get(`https://nrsx9ksod5.execute-api.sa-east-1.amazonaws.com/prod/sensors?company=${company}`);
      const jsonData = response?.data || [];
      setDevices(jsonData);
      return jsonData;
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchSensorData();
  }, []);
  useEffect(() => {
    if (selectedDevice) {
      setSensorType(selectedDevice.type || "");
      setPH(selectedDevice.pH || "");
      setAw(selectedDevice.aw || "");
      setProductType(selectedDevice.productType || "");
    }
  }, [selectedDevice]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box m="20px">
        {/* DEVICE BUTTONS */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title="SENSORES" subtitle="Altere a configuração dos seus sensores" />
          <Box display="flex" alignItems="center" gap="10px">
            <IconButton onClick={refreshDevices} sx={{
              backgroundColor: colors.primary, // Ensure this resolves to a valid value
              color: "rgb(42, 180, 234)",
              "&:hover": {
                backgroundColor: colors.grey[900], // Ensure this resolves to a valid value
              },
              marginRight: "10px",
            }}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
        <Box
          display="flex"
          flexWrap="wrap"
          gap="10px"
          justifyContent="flex-start"
          sx={{
            "& > *": {
              minWidth: "120px", // Adjust width to desired size
            },
            mb: "20px", // Adds margin below the button group
            mt: "0px"
          }}
        >
          {devices.map((device) => (
            <Button
              key={device.device_id}
              variant={device.device_id === selectedDevice?.device_id ? "contained" : "outlined"}
              color="primary"
              onClick={() => setSelectedDevice(device)}
              sx={{
                marginRight: "10px",
                color: device.device_id === selectedDevice?.device_id ? "rgb(42, 180, 234)" : colors.grey[100],
                backgroundColor: colors.primary[400],
                border: "0.5px solid",
                borderColor: device.device_id === selectedDevice?.device_id ? "rgb(42, 180, 234)" : colors.grey[100],
                fontWeight: device.device_id === selectedDevice?.device_id ? 600 : "normal",
                "&:hover": {
                  backgroundColor: colors.primary[900],
                  color: colors.grey[300],
                  border: "0.5px solid",
                },
                width: "175px",
                height: "30px",
                mr: "10px",
              }}
            >
              Sensor {device.device_id }
            </Button>
          ))}
        </Box>

        {/* CONDITIONAL BOX FOR SELECTED DEVICE */}
        {selectedDevice && (
          <Box
            mt="5px"
            p="20px"
            bgcolor={colors.grey[1000]}
            borderRadius="8px"
            width="290px"
            boxShadow={3}
            position="relative"
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb="10px">
              <Typography variant="h5" color="textPrimary" gutterBottom>
              Sensor {selectedDevice?.device_id}
              </Typography>

              <IconButton
                onClick={handleDelete}
                sx={{
                  position: "absolute",
                  top: "20px", // Adjust top position as needed
                  right: "50px", // Adjust right position to align to the right edge
                  backgroundColor: colors.primary,
                  color:  "rgb(42, 180, 234)",
                  "&:hover": {
                    backgroundColor: colors.grey[900],
                  },
                }}
              >
                <DeleteIcon color="white" />
              </IconButton>
              <IconButton
                onClick={handleSaveSensorType}
                sx={{
                  backgroundColor: colors.primary,
                  color:  "rgb(42, 180, 234)",
                  "&:hover": {
                    backgroundColor: colors.grey[900],
                  },
                }}
              >
                <SaveIcon />
              </IconButton>
            </Box>

            <Box mt="10px">
              <TextField
                fullWidth
                value={sensorType}
                onChange={(e) => setSensorType(e.target.value)}
                placeholder="Enter sensor type"
                variant="outlined"
                color="primary"
                sx={{
                  mb: "10px", // Margin below the field

                  "& .MuiOutlinedInput-root": {
                    height: "40px",
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
              <TextField
                fullWidth
                value={pH}
                onChange={(e) => setPH(e.target.value)}
                placeholder="Enter pH"
                variant="outlined"
                color="primary"
                sx={{
                  mb: "10px", // Margin below the field

                  "& .MuiOutlinedInput-root": {
                    height: "40px",
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
              <TextField
                fullWidth
                value={aw}
                onChange={(e) => setAw(e.target.value)}
                placeholder="Enter aw"
                variant="outlined"
                color="primary"
                sx={{
                  mb: "10px", // Margin below the field

                  "& .MuiOutlinedInput-root": {
                    height: "40px",
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
              <TextField
                fullWidth
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                placeholder="Enter product type"
                variant="outlined"
                color="primary"
                sx={{
                  mb: "10px", // Margin below the field

                  "& .MuiOutlinedInput-root": {
                    height: "40px",
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
            </Box>

          </Box>
        )}
        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>Sensor Saved</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Sensor information has been saved successfully!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color={theme.primary}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Sensors;
