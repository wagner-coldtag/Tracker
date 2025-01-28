import { useEffect, useState } from "react";
import { Box, IconButton, Typography, useTheme, useMediaQuery, Dialog, DialogContent, DialogTitle, TextField, Snackbar, SnackbarContent } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom"; // for navigation and getting the sensor ID
import Header from "../../components/Header";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import DateRangePicker from "./utils/DataRangePicker";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import dashboardStyles from "./styles";
import { tokens } from "../../theme";
import useFetchSensorData from "./utils/useFetchSensorData";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import SettingsIcon from "@mui/icons-material/Settings";
import Chart from "../../components/LineChart";
import axios from "axios";

const SensorDetailsPage = () => {
  const navigate = useNavigate();
  const { sensorId } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const styles = dashboardStyles(colors);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [sensorData, setSensorData] = useState(JSON.parse(localStorage.getItem("selectedDevice")));
  const tempMin = sensorData.minTemp;
  const tempMax = sensorData.maxTemp;

  const { downloadAll, startDate, setStartDate, endDate, setEndDate, formatTimestamp, downloadExcel, setSelectedDevice, data } = useFetchSensorData();
  const handleOpenModal = () => setOpenModal(true);  // Open the modal
  const handleCloseModal = () => setOpenModal(false);  // Close the modal

  const handleSaveSensorType = async () => {
    try {

      const response = await fetch(
        "https://afuud4nek9.execute-api.sa-east-1.amazonaws.com/dev/sensors",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            device_id: sensorData?.device_id,
            type: sensorData?.type,
            maxTemp: sensorData?.maxTemp,
            minTemp: sensorData?.minTemp,
            wrongsBeforeAlarm: sensorData?.wrongsBeforeAlarm,
          }),
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || "Failed to save sensor details");
      }

      const currentSensorData = JSON.parse(localStorage.getItem("selectedDevice"));

      const updatedSensorData = {
        ...currentSensorData,
        type: sensorData.type,
        maxTemp: Number(sensorData.maxTemp),
        minTemp: Number(sensorData.minTemp),
        wrongsBeforeAlarm: Number(sensorData.wrongsBeforeAlarm),
      };

      // Save updated sensor data to localStorage
      localStorage.setItem("selectedDevice", JSON.stringify(updatedSensorData));

      alert("Sensor updated successfully!");
      setOpenModal(false);
    } catch (error) {
      console.error("Error saving sensor details:", error);
      alert("Failed to save sensor details.");
    }
  };

  const handleDeleteSensor = async () => {
    const confirmation = window.confirm("Are you sure you want to delete this sensor?");
    if (confirmation) {
      try {
        const response = await axios.delete("https://nrsx9ksod5.execute-api.sa-east-1.amazonaws.com/prod/sensors", {
          headers: { "Content-Type": "application/json" },
          data: JSON.stringify({ device_id: sensorData.device_id }),
        });

        if (response.status === 200) {
          setAlertMessage("Sensor deleted successfully!");
          setOpenAlert(true); // Show success alert
          navigate("/Tracker"); // Redirect to Tracker page
        } else {
          setAlertMessage("Failed to delete sensor!");
          setOpenAlert(true); // Show error alert
        }
      } catch (error) {
        console.error("Error deleting sensor:", error);
        setAlertMessage("Failed to delete sensor!");
        setOpenAlert(true); // Show error alert
      }
      setOpenModal(false); // Close the modal
    }
  };

  useEffect(() => {
    setSelectedDevice(sensorId);
  }, [sensorId, setSelectedDevice]);

  const goBack = () => {
    navigate(-1); // This takes you back to the previous page
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box m="20px">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title={sensorData.device_id}   subtitle={<strong>{sensorData.company} - {sensorData.type} </strong>} />
          <Box display="flex" alignItems="center" gap="10px">
            <IconButton onClick={goBack} sx={{ ...styles.iconButton, color: "rgb(42, 180, 234)" }}>
              <ArrowBackIcon />
            </IconButton>
            <IconButton onClick={handleOpenModal} sx={{ ...styles.iconButton, color: "rgb(42, 180, 234)" }}>
              <SettingsIcon />
            </IconButton>
            <IconButton onClick={downloadAll} sx={{ ...styles.iconButton, color: "rgb(42, 180, 234)" }}>
              <DownloadOutlinedIcon />
            </IconButton>
            <DateRangePicker
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
          </Box>
        </Box>

        {/* Main content with chart */}
        <Box
          display="grid"
          gridAutoRows="120px"
          gap="20px"
          gridTemplateColumns="repeat(12, 1fr)"
        >
          <Box
            gridColumn={isSmallScreen ? "span 12" : "span 8"} // Full width on small screens
            gridRow="span 2"
            backgroundColor={colors.primary[400]}
          >
            <Box mt="5px" p="0 30px" display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
                  Número de leituras:
                </Typography>
                <Typography variant="h5" fontWeight="bold" color={"rgb(42, 180, 234)"} ml="5px">
                  {data.length > 0 ? data[0].data.length : 0}
                </Typography>
              </Box>
              <Box>
                <IconButton onClick={downloadExcel}>
                  <DownloadOutlinedIcon sx={{ fontSize: "26px", color: "rgb(42, 180, 234)" }} />
                </IconButton>
              </Box>
            </Box>
            <Box height="250px" mt="-20px">
              <Chart isDashboard={true} data={data} tempMin = {tempMin} tempMax = {tempMax}/>
            </Box>
          </Box>

          {/* Medidas Recentes */}
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
              {data.length > 0 && data[0].data.length > 0 && data[0].data.slice(-5).map((measurement) => (
                <Box
                  key={`${measurement.x}-${measurement.y}`}
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
                      {sensorId}
                    </Typography>
                    <Typography color={colors.grey[100]}>
                      {formatTimestamp(measurement.x)}
                    </Typography>
                  </Box>
                  <Box backgroundColor={"rgb(42, 180, 234)"}
                    p="5px 10px" borderRadius="4px" color="white">
                    {measurement.y.toFixed(1)}°C
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Sensor Info */}

        {/* Modal */}
        <Dialog
          open={openModal}
          onClose={handleCloseModal}
          sx={{
            "& .MuiDialog-paper": {
              padding: "10px",
              borderRadius: "8px",
              width: "400px",  // Set a fixed width for the modal
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
        <Snackbar open={openAlert} autoHideDuration={6000} onClose={() => setOpenAlert(false)}>
          <SnackbarContent
            message={alertMessage}
            sx={{ backgroundColor: alertMessage.includes("successfully") ? "green" : "red" }}
          />
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default SensorDetailsPage;
