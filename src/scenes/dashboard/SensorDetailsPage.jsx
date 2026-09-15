import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Notifications from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box, IconButton, Typography, useTheme, useMediaQuery, Snackbar, SnackbarContent , CircularProgress } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // for navigation and getting the sensor ID
import SettingsModal from "./SettingsModal";
import dashboardStyles from "./styles";
import TableComponent from "./TableComponent";
import DateRangePicker from "./utils/DataRangePicker";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import useFetchSensorData from "./utils/useFetchSensorData";
import Chart from "../../components/LineChart";

const SensorDetailsPage = () => {

  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [sensorData, setSensorData] = useState(JSON.parse(localStorage.getItem("selectedDevice")));
  const [openNotifications, setOpenNotifications] = useState(false);
  const { sensorId } = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const styles = dashboardStyles(colors);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const tempMin = sensorData.minTemp;
  const tempMax = sensorData.maxTemp;

  const { downloadAll, startDate, setStartDate, endDate, setEndDate, formatTimestamp, downloadExcel, setSelectedDevice, selectedDevice, data } = useFetchSensorData();
  const handleOpenModal = () => setOpenModal(true);  
  const handleCloseModal = () => setOpenModal(false);

  const handleSaveSensorType = async() => {
    try {
      const currentSensorData = JSON.parse(localStorage.getItem("selectedDevice"));
  
      const bodyToSend = {
        device_id: currentSensorData.device_id,
      };
  
      if (sensorData.type) bodyToSend.type = sensorData.type;
      if (sensorData.maxTemp !== "") bodyToSend.maxTemp = Number(sensorData.maxTemp);
      if (sensorData.minTemp !== "") bodyToSend.minTemp = Number(sensorData.minTemp);
      if (sensorData.wrongsBeforeAlarm !== "") bodyToSend.wrongsBeforeAlarm = Number(sensorData.wrongsBeforeAlarm);
      if (sensorData.notifications) bodyToSend.notifications = sensorData.notifications;
  
      const response = await axios.post(
        "https://afuud4nek9.execute-api.sa-east-1.amazonaws.com/dev/sensors",
        bodyToSend,
        { headers: { "Content-Type": "application/json" } }
      );
    
      // Verifica se a resposta tem .body e é string para parsear
      const responseData = typeof response.data.body === "string" ? JSON.parse(response.data.body) : response.data;
  
      const updatedSensor = responseData.updated_item;
      if (updatedSensor) {
        localStorage.setItem("selectedDevice", JSON.stringify(updatedSensor));
        alert("Sensor atualizado com sucesso!");
        setOpenModal(false);
      } else {
        throw new Error("Resposta do servidor inválida.");
      }
  
    } catch (error) {
      console.error("Erro salvando as informações do sensor:", error);
      alert("Falha em salvar as informações do sensor.");
    }
  };
  

  const handleDeleteSensor = async() => {
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
    if (sensorId) {
      setSelectedDevice(sensorId);
    }
  }, [sensorId, setSelectedDevice]);

  const goBack = () => {
    navigate(-1);
  };

  if (!data || data.length === 0 || !data[0]?.data) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="80vh" gap={3}>
        <CircularProgress size={60} thickness={4.5} sx={{ color: "rgb(42, 180, 234)" }} />
        <Typography variant="h6" color="textSecondary" fontWeight={500}>
          Coletando seus dados de temperatura...
        </Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box m="20px">
        {isSmallScreen && (
          <>
            {/* Icons */}
            <Box display="flex" gap={1} justifyContent="flex-start" flexWrap="wrap" mb={1}>
              <IconButton onClick={goBack} sx={{ ...styles.iconButton, color: "rgb(42, 180, 234)" }}>
                <ArrowBackIcon />
              </IconButton>
              <IconButton onClick={handleOpenModal} sx={{ ...styles.iconButton, color: "rgb(42, 180, 234)" }}>
                <SettingsIcon />
              </IconButton>
              <IconButton onClick={downloadAll} sx={{ ...styles.iconButton, color: "rgb(42, 180, 234)" }}>
                <DownloadOutlinedIcon />
              </IconButton>
              <IconButton
                onClick={() => setOpenNotifications(true)}
                sx={{ ...styles.iconButton, color: "rgb(42, 180, 234)", position: "relative" }}
              >
                <Notifications />
                {sensorData?.notifications?.filter(n => !n.details?.solved).length > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 1,
                      right: 2,
                      backgroundColor: "#ff7043",
                      borderRadius: "50%",
                      width: 18,
                      height: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: 11,
                      border: `1px solid ${colors.primary[400]}`,
                    }}
                  >
                    {sensorData.notifications.filter(n => !n.details?.solved).length}
                  </Box>
                )}
              </IconButton>
            </Box>

            {/* Header */}
            <Header
              title={sensorData.device_id}
              subtitle={<strong>{sensorData.company} - {sensorData.type}</strong>}
              style={{ marginBottom: 12 }}
            />

            {/* Date Picker */}
            <Box mb={2}>
              <DateRangePicker
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
              />
            </Box>
          </>
        )}

        {/* Header and icons for large screens */}
        {!isSmallScreen && (
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Header
              title={sensorData.device_id}
              subtitle={<strong>{sensorData.company} - {sensorData.type}</strong>}
            />
            <Box display="flex" gap={2}>
              <IconButton onClick={goBack} sx={{ ...styles.iconButton, color: "rgb(42, 180, 234)" }}>
                <ArrowBackIcon />
              </IconButton>
              <IconButton onClick={handleOpenModal} sx={{ ...styles.iconButton, color: "rgb(42, 180, 234)" }}>
                <SettingsIcon />
              </IconButton>
              <IconButton onClick={downloadAll} sx={{ ...styles.iconButton, color: "rgb(42, 180, 234)" }}>
                <DownloadOutlinedIcon />
              </IconButton>
              <IconButton onClick={() => setOpenNotifications(true)} sx={{ ...styles.iconButton, color: "rgb(42, 180, 234)", position: "relative" }}>
                <Notifications />
                {sensorData?.notifications?.filter(n => !n.details?.solved).length > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 1,
                      right: 2,
                      backgroundColor: "#ff7043",
                      borderRadius: "50%",
                      width: 18,
                      height: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: 11,
                      border: `1px solid ${colors.primary[400]}`
                    }}
                  >
                    {sensorData.notifications.filter(n => !n.details?.solved).length}
                  </Box>
                )}
              </IconButton>
              <Box>
                <DateRangePicker
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                />
              </Box>
            </Box>
          </Box>
        )}
        <Box display="grid" gridAutoRows="120px" gap="20px" gridTemplateColumns="repeat(12, 1fr)">
          <Box gridColumn={isSmallScreen ? "span 12" : "span 8"} gridRow="span 2"
            backgroundColor={colors.primary[400]} >
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

        <SettingsModal sensorData = {sensorData} setSensorData = {setSensorData} openModal={openModal} 
          handleCloseModal = {handleCloseModal} handleSaveSensorType = {handleSaveSensorType} handleDeleteSensor = {handleDeleteSensor}/>
        <TableComponent open={openNotifications} handleClose={() => setOpenNotifications(false)}
          sensorData={sensorData} setSensorData={setSensorData} handleSaveSensorType={handleSaveSensorType}/>
        
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
