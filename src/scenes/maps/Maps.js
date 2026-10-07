import LocationOff from "@mui/icons-material/LocationOff";
import Place from "@mui/icons-material/Place";
import Sensors from "@mui/icons-material/Sensors";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import L from "leaflet";
import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import useFetchSensorData from "../dashboard/utils/useFetchSensorData";

const DEFAULT_CENTER = [-30.0, -52.0];
const DEFAULT_ZOOM = 7;

/* ---------- Helpers ---------- */

const isValidLimit = (v) => v !== undefined && v !== null && v !== "" && !Number.isNaN(Number(v));

// "ok" | "alert" | "unknown"
const getStatus = (device) => {
  const temp = parseFloat(device.last_temperature);
  if (Number.isNaN(temp)) return "unknown";
  const out =
    (isValidLimit(device.maxTemp) && temp > Number(device.maxTemp)) ||
    (isValidLimit(device.minTemp) && temp < Number(device.minTemp));
  return out ? "alert" : "ok";
};

// Pin-shaped marker: colored by status, with a count when several sensors share a spot
const makePinIcon = (color, count) =>
  L.divIcon({
    className: "sensor-pin", // replaces Leaflet's default white box
    iconSize: [34, 34],
    iconAnchor: [17, 41],
    popupAnchor: [0, -38],
    html: `
      <div style="position:relative;width:34px;height:34px;">
        <div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          background:${color};border:3px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.35);"></div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
          color:#fff;font:700 13px sans-serif;">
          ${
  count > 1
    ? count
    : '<span style="width:10px;height:10px;border-radius:50%;background:#fff;display:block;"></span>'
}
        </div>
      </div>`,
  });

// Fits the map to the markers once per set of positions (not on every data refresh,
// so it doesn't fight the user's panning)
const FitBounds = ({ points }) => {
  const map = useMap();
  const boundsKey = points.map((p) => p.join(",")).join("|");

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) map.setView(points[0], 13);
    else map.fitBounds(points, { padding: [50, 50], maxZoom: 15 });
  }, [map, boundsKey]); 

  return null;
};

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

const LegendItem = ({ color, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
    <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color }} />
    <Typography variant="caption">{label}</Typography>
  </Box>
);

/* ---------- Page ---------- */

const StoreMap = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";
  const okColor = colors.blueAccent[500];
  const alertColor = colors.alert;
  const unknownColor = colors.grey[500];
  const statusColor = { ok: okColor, alert: alertColor, unknown: unknownColor };

  const { devices } = useFetchSensorData();

  // Split devices with and without valid coordinates, then group by position
  const { groups, devicesWithoutCoords, mappedCount, alertCount } = useMemo(() => {
    const withCoords = [];
    const withoutCoords = [];

    devices?.forEach((device) => {
      const lat = parseFloat(device.latitude);
      const lng = parseFloat(device.longitude);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        withCoords.push({ ...device, lat, lng });
      } else {
        withoutCoords.push(device);
      }
    });

    const byPosition = {};
    withCoords.forEach((device) => {
      const key = `${device.lat.toFixed(5)},${device.lng.toFixed(5)}`;
      if (!byPosition[key]) byPosition[key] = [];
      byPosition[key].push(device);
    });

    const groupList = Object.values(byPosition).map((members) => {
      const statuses = members.map(getStatus);
      // A spot is "alert" if any sensor there is out of range
      const status = statuses.includes("alert")
        ? "alert"
        : statuses.every((s) => s === "unknown")
          ? "unknown"
          : "ok";
      return { position: [members[0].lat, members[0].lng], members, status };
    });

    return {
      groups: groupList,
      devicesWithoutCoords: withoutCoords,
      mappedCount: withCoords.length,
      alertCount: withCoords.filter((d) => getStatus(d) === "alert").length,
    };
  }, [devices]);

  const points = groups.map((g) => g.position);
  const hasUnknown = groups.some((g) => g.status === "unknown");

  return (
    <Box m="20px" display="flex" flexDirection="column" gap={3}>
      <Header title="MAPAS" mb={0} />

      {/* Summary cards */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
        }}
      >
        <StatCard
          colors={colors}
          color={okColor}
          icon={<Sensors />}
          label="Sensores no mapa"
          value={mappedCount}
        />
        <StatCard
          colors={colors}
          color={alertCount > 0 ? alertColor : okColor}
          icon={<WarningAmber />}
          label="Fora da faixa"
          value={alertCount}
        />
        <StatCard
          colors={colors}
          color={devicesWithoutCoords.length > 0 ? colors.grey[300] : okColor}
          icon={<LocationOff />}
          label="Sem coordenadas"
          value={devicesWithoutCoords.length}
        />
      </Box>

      {/* Map */}
      <Box
        sx={{
          position: "relative",
          isolation: "isolate", // keeps Leaflet's z-indexes below your top bar / drawers
          height: { xs: "55vh", md: "62vh" },
          minHeight: 380,
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${colors.grey[700]}`,
          "& .sensor-pin": { background: "transparent", border: "none" },
          "& .leaflet-popup-content-wrapper": {
            backgroundColor: colors.primary[400],
            color: theme.palette.text.primary,
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
          },
          "& .leaflet-popup-tip": { backgroundColor: colors.primary[400] },
          "& .leaflet-popup-content": { margin: "12px 14px" },
          "& .leaflet-popup-close-button": { color: `${colors.grey[300]} !important` },
        }}
      >
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

          <FitBounds points={points} />

          {groups.map(({ position, members, status }) => {
            const first = members[0];
            return (
              <Marker
                key={position.join(",")}
                position={position}
                icon={makePinIcon(statusColor[status], members.length)}
              >
                <Popup minWidth={200}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    {first.company} - {first.type}
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                    {members.map((d) => {
                      const s = getStatus(d);
                      const temp = parseFloat(d.last_temperature);
                      return (
                        <Box
                          key={d.device_id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: statusColor[s],
                              }}
                            />
                            <Link
                              to={`/sensor/${d.device_id}`}
                              style={{ color: okColor, fontWeight: 600, textDecoration: "none" }}
                            >
                              {d.name || d.device_id}
                            </Link>
                          </Box>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ color: statusColor[s] }}
                          >
                            {Number.isNaN(temp) ? "--" : `${temp.toFixed(1)}°C`}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Legend */}
        <Box
          sx={{
            position: "absolute",
            left: 12,
            bottom: 24,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            px: 1.5,
            py: 1,
            borderRadius: 2,
            backgroundColor: alpha(colors.primary[400], 0.92),
            border: `1px solid ${colors.grey[700]}`,
            color: theme.palette.text.primary,
          }}
        >
          <LegendItem color={okColor} label="Dentro da faixa" />
          <LegendItem color={alertColor} label="Fora da faixa" />
          {hasUnknown && <LegendItem color={unknownColor} label="Sem leitura" />}
        </Box>
      </Box>

      {/* Devices without coordinates */}
      {devicesWithoutCoords.length > 0 && (
        <Box
          sx={{
            borderRadius: 3,
            backgroundColor: colors.primary[400],
            border: `1px solid ${colors.grey[700]}`,
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${colors.grey[700]}` }}>
            <Typography variant="h5" fontWeight="600">
              Dispositivos sem coordenadas
            </Typography>
            <Typography variant="body2" sx={{ color: colors.grey[300] }}>
              Esses sensores não aparecem no mapa porque não têm localização cadastrada.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              p: 2.5,
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            }}
          >
            {devicesWithoutCoords.map((d) => (
              <Box
                key={d.device_id}
                component={Link}
                to={`/sensor/${d.device_id}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 3,
                  textDecoration: "none",
                  color: "inherit",
                  border: `1px solid ${colors.grey[700]}`,
                  backgroundColor: colors.primary[500],
                  transition: "border-color 0.2s ease",
                  "&:hover": { borderColor: okColor },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    borderRadius: "50%",
                    backgroundColor: alpha(okColor, 0.15),
                    color: okColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Place fontSize="small" />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" fontWeight="bold" noWrap>
                    {d.name || d.device_id}
                  </Typography>
                  <Typography variant="body2" noWrap sx={{ color: colors.grey[300] }}>
                    {[d.company, d.type].filter(Boolean).join(" - ") || "Sem informações"}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default StoreMap;