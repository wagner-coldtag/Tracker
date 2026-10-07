import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Notifications from "@mui/icons-material/Notifications";
import NotificationsActive from "@mui/icons-material/NotificationsActive";
import SettingsIcon from "@mui/icons-material/Settings";
import ShowChart from "@mui/icons-material/ShowChart";
import Thermostat from "@mui/icons-material/Thermostat";
import UnfoldMore from "@mui/icons-material/UnfoldMore";
import WarningAmber from "@mui/icons-material/WarningAmber";
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Snackbar,
  SnackbarContent,
  CircularProgress,
  Badge,
  Tooltip,
  Chip,
  alpha,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SettingsModal from "./SettingsModal";
import TableComponent from "./TableComponent";
import DateRangePicker from "./utils/DataRangePicker";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import useFetchSensorData from "./utils/useFetchSensorData";
import Chart from "../../components/LineChart";

// Same soft red used in SensorCard
const ALERT_COLOR = "#e5695a";

/* ---------- Small presentational helpers ---------- */

const StatCard = ({ icon, label, value, color, colors }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      p: 2,
      borderRadius: 3,
      backgroundColor: colors.primary[400],
      border: `1px solid ${colors.grey[700]}`,
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: alpha(color, 0.15),
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: colors.grey[300] }}>
        {label}
      </Typography>
      <Typography variant="h4" fontWeight="bold" noWrap sx={{ color, lineHeight: 1.2 }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const Panel = ({ title, icon, action, colors, children, sx }) => (
  <Box
    sx={{
      borderRadius: 3,
      backgroundColor: colors.primary[400],
      border: `1px solid ${colors.grey[700]}`,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      ...sx,
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2.5,
        py: 1.5,
        borderBottom: `1px solid ${colors.grey[700]}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {icon}
        <Typography variant="h5" fontWeight="600">
          {title}
        </Typography>
      </Box>
      {action}
    </Box>
    {children}
  </Box>
);

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
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const okColor = colors.blueAccent[500];
  const tempMin = sensorData.minTemp;
  const tempMax = sensorData.maxTemp;

  const {
    downloadAll,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    formatTimestamp,
    downloadExcel,
    setSelectedDevice,
    data,
  } = useFetchSensorData();

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleSaveSensorType = async () => {
    try {
      const currentSensorData = JSON.parse(localStorage.getItem("selectedDevice"));

      const bodyToSend = {
        device_id: currentSensorData.device_id,
      };

      if (sensorData.type) bodyToSend.type = sensorData.type;
      if (sensorData.maxTemp !== "") bodyToSend.maxTemp = Number(sensorData.maxTemp);
      if (sensorData.minTemp !== "") bodyToSend.minTemp = Number(sensorData.minTemp);
      if (sensorData.wrongsBeforeAlarm !== "") bodyToSend.wrongsBeforeAlarm = Number(sensorData.wrongsBeforeAlarm);
      if (sensorData.notifications) bodyToSend.notifications = currentSensorData.notifications;
      console.log("REQUEST SENT:", bodyToSend);

      const response = await axios.post(
        "https://afuud4nek9.execute-api.sa-east-1.amazonaws.com/dev/sensors",
        bodyToSend,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("RAW RESPONSE:", response.data);

      const responseData =
        typeof response.data.body === "string" ? JSON.parse(response.data.body) : response.data;


      const updatedSensor = responseData.updated_item;
            console.log("UPDATED ITEM FROM SERVER:", updatedSensor);
      console.log(
        "SERVER NOTIFICATION:",
        updatedSensor?.notifications
      );
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

  const handleDeleteSensor = async () => {
    const confirmation = window.confirm("Are you sure you want to delete this sensor?");
    if (confirmation) {
      try {
        const response = await axios.delete(
          "https://nrsx9ksod5.execute-api.sa-east-1.amazonaws.com/prod/sensors",
          {
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({ device_id: sensorData.device_id }),
          }
        );

        if (response.status === 200) {
          setAlertMessage("Sensor deleted successfully!");
          setOpenAlert(true);
          navigate("/Tracker");
        } else {
          setAlertMessage("Failed to delete sensor!");
          setOpenAlert(true);
        }
      } catch (error) {
        console.error("Error deleting sensor:", error);
        setAlertMessage("Failed to delete sensor!");
        setOpenAlert(true);
      }
      setOpenModal(false);
    }
  };

  useEffect(() => {
    if (sensorId) {
      setSelectedDevice(sensorId);
    }
  }, [sensorId, setSelectedDevice]);

  const goBack = () => navigate(-1);

  if (!data || data.length === 0 || !data[0]?.data) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="80vh" gap={3}>
        <CircularProgress size={60} thickness={4.5} sx={{ color: okColor }} />
        <Typography variant="h6" color="textSecondary" fontWeight={500}>
          Coletando seus dados de temperatura...
        </Typography>
      </Box>
    );
  }

  /* ---------- Derived values ---------- */
  const readings = data[0].data;
  const lastReading = readings.length > 0 ? readings[readings.length - 1] : null;
  const recentReadings = readings.slice(-5).reverse(); // newest first

  const hasRange = tempMin !== undefined && tempMax !== undefined;
  const isOutOfRangeValue = (v) => hasRange && (v > tempMax || v < tempMin);

  const currentTemp = lastReading?.y;
  const isOutOfRange = currentTemp !== undefined && isOutOfRangeValue(currentTemp);
  const statusColor = isOutOfRange ? ALERT_COLOR : okColor;
  const unsolvedCount = sensorData?.notifications?.filter((n) => !n.details?.solved).length ?? 0;

  /* ---------- Header actions ---------- */
  const actionButtonSx = {
    backgroundColor: colors.primary[400],
    border: `1px solid ${colors.grey[700]}`,
    color: okColor,
    "&:hover": { backgroundColor: colors.primary[500] },
  };

  const actions = (
    <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
      <Tooltip title="Configurações">
        <IconButton onClick={handleOpenModal} sx={actionButtonSx}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Baixar tudo">
        <IconButton onClick={downloadAll} sx={actionButtonSx}>
          <DownloadOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Notificações">
        <IconButton onClick={() => setOpenNotifications(true)} sx={actionButtonSx}>
          <Badge
            badgeContent={unsolvedCount}
            invisible={unsolvedCount === 0}
            sx={{
              "& .MuiBadge-badge": { backgroundColor: ALERT_COLOR, color: "#fff", fontWeight: 700 },
            }}
          >
            <Notifications />
          </Badge>
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box m="20px" display="flex" flexDirection="column" gap={3}>
        {/* Top bar */}
        <Box
          display="flex"
          flexDirection={isSmallScreen ? "column" : "row"}
          justifyContent="space-between"
          alignItems={isSmallScreen ? "flex-start" : "center"}
          gap={2}
        >
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            <IconButton onClick={goBack} sx={actionButtonSx}>
              <ArrowBackIcon />
            </IconButton>
            <Header
              title={sensorData.device_id}
              subtitle={<strong>{sensorData.company} - {sensorData.type}</strong>}
              mb={0}
            />
            <Chip
              icon={isOutOfRange ? <WarningAmber /> : <CheckCircleOutline />}
              label={isOutOfRange ? "Fora da faixa" : "Dentro da faixa"}
              sx={{
                color: "#fff",
                fontWeight: 600,
                backgroundColor: statusColor,
                "& .MuiChip-icon": { color: "#fff" },
              }}
            />
          </Box>

          <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
            <DateRangePicker
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
            {actions}
          </Box>
        </Box>

        {/* Summary cards */}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          }}
        >
          <StatCard
            colors={colors}
            color={statusColor}
            icon={<Thermostat />}
            label="Temperatura atual"
            value={currentTemp !== undefined ? `${Math.trunc(currentTemp * 10) / 10}°C` : "--"}
          />
          <StatCard
            colors={colors}
            color={okColor}
            icon={<UnfoldMore />}
            label="Faixa ideal"
            value={hasRange ? `${tempMin}° a ${tempMax}°` : "Indefinida"}
          />
          <StatCard
            colors={colors}
            color={okColor}
            icon={<ShowChart />}
            label="Leituras no período"
            value={readings.length}
          />
          <StatCard
            colors={colors}
            color={unsolvedCount > 0 ? ALERT_COLOR : okColor}
            icon={<NotificationsActive />}
            label="Alertas ativos"
            value={unsolvedCount}
          />
        </Box>

        {/* Chart + recent readings */}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          }}
        >
          <Panel
            colors={colors}
            title="Temperatura ao longo do tempo"
            action={
              <Tooltip title="Baixar Excel">
                <IconButton onClick={downloadExcel} sx={{ color: okColor }}>
                  <DownloadOutlinedIcon />
                </IconButton>
              </Tooltip>
            }
          >
            <Box height="340px" p={1}>
              <Chart isDashboard={true} data={data} tempMin={tempMin} tempMax={tempMax} />
            </Box>
          </Panel>

          <Panel colors={colors} title="Medidas recentes">
            <Box sx={{ overflow: "auto" }}>
              {recentReadings.map((measurement, index) => {
                const out = isOutOfRangeValue(measurement.y);
                return (
                  <Box
                    key={`${measurement.x}-${measurement.y}`}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    px={2.5}
                    py={1.5}
                    sx={{
                      borderBottom:
                        index < recentReadings.length - 1 ? `1px solid ${colors.grey[700]}` : "none",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: colors.grey[300] }}>
                      {formatTimestamp(measurement.x)}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${measurement.y.toFixed(1)}°C`}
                      sx={{
                        fontWeight: 700,
                        color: "#fff",
                        backgroundColor: out ? ALERT_COLOR : okColor,
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Panel>
        </Box>

        <SettingsModal
          sensorData={sensorData}
          setSensorData={setSensorData}
          openModal={openModal}
          handleCloseModal={handleCloseModal}
          handleSaveSensorType={handleSaveSensorType}
          handleDeleteSensor={handleDeleteSensor}
        />
        <TableComponent
          open={openNotifications}
          handleClose={() => setOpenNotifications(false)}
          sensorData={sensorData}
          setSensorData={setSensorData}
          handleSaveSensorType={handleSaveSensorType}
        />

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