import {
  Sensors,
  Wifi,
  Store,
  MoreVert,
  HelpOutline,
  WarningAmber,
  CheckCircleOutline,
  ArrowDropDown,
  ArrowDropUp,
  HourglassBottom,
  Notifications,
} from "@mui/icons-material";
import {
  Card,
  Box,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import React from "react";
import { tokens } from "../../../theme";

// Soft, warm red for out-of-range (not a harsh alarm red).
const ALERT_COLOR = "#e5695a";

const formatTimeAgo = (unixSeconds) => {
  if (!unixSeconds) return "N/A";
  const diffMin = Math.max(0, Math.floor((Date.now() / 1000 - unixSeconds) / 60));
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}m atrás`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  if (h < 24) return `${h}h ${m}m atrás`;
  return `${Math.floor(h / 24)}d atrás`;
};

const InfoRow = ({ icon, label, value, colors }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: colors.primary[400],
        color: "text.secondary", // adapts to light/dark mode
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </Box>
    <Typography variant="body2" noWrap>
      {label && (
        <Box component="span" fontWeight="bold">
          {label}:{" "}
        </Box>
      )}
      {value}
    </Typography>
  </Box>
);

const SensorCard = ({ sensor, isSelected, onClick, onMenuClick }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const okColor = colors.blueAccent[500];

  const hasRange = sensor.maxTemp !== undefined || sensor.minTemp !== undefined;
  const hasTemperature =
    sensor.last_temperature !== undefined && sensor.last_temperature !== null;

  const isOutOfRange =
    hasRange &&
    hasTemperature &&
    (sensor.last_temperature > sensor.maxTemp || sensor.last_temperature < sensor.minTemp);

  const statusColor = isOutOfRange ? ALERT_COLOR : okColor;

  const unsolvedCount =
    sensor.notifications?.filter((n) => n?.details?.solved === false).length ?? 0;

  const fullDate = sensor.last_timestamp
    ? new Date(sensor.last_timestamp * 1000).toLocaleString("pt-BR", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  const shelfLife = sensor.predictions?.lastShelfLife;

  return (
    <Card
      onClick={onClick}
      sx={{
        maxWidth: 340,
        overflow: "hidden",
        border: `1px solid ${statusColor}`,
        borderRadius: 3,
        cursor: "pointer",
        backgroundColor: colors.primary[400],
        boxShadow: isSelected ? `0 0 0 2px ${statusColor}` : "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: isSelected
            ? `0 0 0 2px ${statusColor}, 0 8px 20px rgba(0,0,0,0.12)`
            : "0 8px 20px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: statusColor,
          color: "#fff",
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Sensors sx={{ opacity: 0.85 }} />
        <Typography variant="h5" fontWeight="bold" noWrap sx={{ flex: 1 }}>
          {sensor.name || `Sensor ${sensor.device_id}`}
        </Typography>
 

      </Box>

      {/* Body */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: 2,
          py: 2.5,
        }}
      >
        {/* Temperature + range */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
            <Typography
              variant="h2"
              fontWeight="bold"
              sx={{ color: statusColor, lineHeight: 1 }}
            >
              {hasTemperature ? Math.trunc(sensor.last_temperature * 10) / 10 : "--"}
              <Typography
                component="span"
                variant="h5"
                sx={{ color: statusColor, fontWeight: 400 }}
              >
                °C
              </Typography>
            </Typography>

          </Box>

          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              color: colors.grey[300],
              display: "flex",
              alignItems: "center",
            }}
          >
            {hasRange ? (
              <>
                <ArrowDropDown fontSize="small" />
                {sensor.minTemp ?? "--"}°C
                <ArrowDropUp fontSize="small" sx={{ ml: 0.5 }} />
                {sensor.maxTemp ?? "--"}°C
              </>
            ) : (
              "Faixa indefinida"
            )}
          </Typography>
        </Box>

        {/* Info rows */}
        <Box
          sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0, flex: 1 }}
        >
        <InfoRow
          colors={colors}
          icon={<Wifi fontSize="small" />}
          value={sensor.type || "Unknown Type"}
        />
        <InfoRow
          colors={colors}
          icon={<Store fontSize="small" />}
          value={sensor.company || "Unknown Company"}
        />
          {shelfLife !== undefined && (
            <InfoRow
              colors={colors}
              icon={<HourglassBottom fontSize="small" />}
              label="Vida útil"
              value={`${shelfLife.toFixed(1)} h`}
            />
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          borderTop: `1px solid ${isOutOfRange ? statusColor : colors.grey[700]}`,
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: statusColor }}>
          {isOutOfRange ? (
            <WarningAmber fontSize="small" />
          ) : (
            <CheckCircleOutline fontSize="small" />
          )}
          <Typography variant="body2" fontWeight={500}>
            {isOutOfRange ? "Fora da faixa" : "Dentro da faixa"}
          </Typography>
          {unsolvedCount > 0 && (
            <Box
              sx={{
                ml: 0.5,
                display: "flex",
                alignItems: "center",
                gap: 0.25,
                color: ALERT_COLOR,
              }}
            >
              <Notifications sx={{ fontSize: 16 }} />
              <Typography variant="caption" fontWeight="bold">
                {unsolvedCount}
              </Typography>
            </Box>
          )}
        </Box>

        <Typography variant="caption" sx={{ color: colors.grey[300] }}>
          Atualizado{" "}
          <Box component="span" fontWeight="bold" color="text.primary">
            {formatTimeAgo(sensor.last_timestamp)}
          </Box>
        </Typography>
      </Box>
    </Card>
  );
};

export default SensorCard;