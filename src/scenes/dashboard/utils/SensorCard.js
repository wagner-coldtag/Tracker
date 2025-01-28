import React from "react";
import { IconButton, Card, CardHeader, CardContent, Typography, Box,useTheme } from "@mui/material";
import { Thermostat, Notifications } from "@mui/icons-material";
import { tokens } from "../../../theme";


const SensorCard = ({ sensor, isSelected, onClick }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const getTemperatureColor = () => {
    if (sensor.maxTemp !== undefined || sensor.minTemp !== undefined) {
      if (sensor.last_temperature > sensor.maxTemp || sensor.last_temperature < sensor.minTemp) {
        return "#ff7043";  // Color stays as is
      } else {
        return "rgb(41, 177, 237)";  // Within range, change color
      }
    }
    // If no maxTemp or minTemp, default color
    return "rgb(41, 177, 237)";
  };

  const temperatureColor = getTemperatureColor();
  return (
    <Card
      onClick={onClick}
      sx={{
        border: isSelected ? "2px solid #1976d2" : "1px solid #ddd",
        borderRadius: 2,
        cursor: "pointer",
        backgroundColor: colors.primary[400],
        transition: "0.3s",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
        },
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <CardHeader
        title={sensor.name || `Sensor ${sensor.device_id}`}
        titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
        sx={{ p: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}
        action={
          sensor.notifications && sensor.notifications.length > 0 ? (
            <IconButton>
              <Notifications sx={{ color: "#ff7043" }} />
              <Box
                sx={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  backgroundColor: "#ff7043",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 12,
                }}
              >
                {sensor.notifications.length}
              </Box>
            </IconButton>
          ) : null
        }
      />
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Thermostat sx={{ fontSize: 40, color: temperatureColor }} />
          <Typography variant="h5" fontWeight="bold" color={temperatureColor}>
            {sensor.last_temperature ? `${Math.trunc(sensor.last_temperature * 10) / 10}°C` : "--"}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, textAlign: "right" }}>
          <Typography variant="body1" color="textSecondary">
            {sensor.company || "Unknown Company"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {sensor.type || "Unknown Type"}
          </Typography>
        </Box>
      </CardContent>
      <Box sx={{ position: "absolute", top: 10, right: 10 }}>
        {sensor.notifications && sensor.notifications.length > 0 && (
          <IconButton>
            <Notifications sx={{ color: "#ff7043" }} />
            <Box
              sx={{
                position: "absolute",
                top: -5,
                right: -5,
                backgroundColor: "#ff7043",
                borderRadius: "50%",
                width: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 12,
              }}
            >
              {sensor.notifications.length}
            </Box>
          </IconButton>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 1,
          paddingBottom: 1,
          textAlign: "left",
          gap: 2,  // Space out the two pieces of info
        }}
      >
        <Typography variant="body2" color="textSecondary">
   Atualizado:{" "}
          {sensor.last_timestamp
            ? new Date(sensor.last_timestamp * 1000).toLocaleString("pt-BR", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
            : "N/A"}
        </Typography>
      </Box>
    </Card>
  );
};

export default SensorCard;
