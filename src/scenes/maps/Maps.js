import { Box, Typography, Paper, List, ListItem, ListItemText } from "@mui/material";
import L from "leaflet";
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import useFetchSensorData from "../dashboard/utils/useFetchSensorData";

// Fix for default icon not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const StoreMap = () => {
  const { devices } = useFetchSensorData();

  // Separar dispositivos com e sem coordenadas válidas
  const devicesWithCoords = [];
  const devicesWithoutCoords = [];

  devices?.forEach((device) => {
    const lat = parseFloat(device.latitude);
    const lng = parseFloat(device.longitude);

    const hasValidCoords = !isNaN(lat) && !isNaN(lng);
    if (hasValidCoords) {
      devicesWithCoords.push({ ...device, lat: lat.toFixed(5), lng: lng.toFixed(5) });
    } else {
      devicesWithoutCoords.push(device);
    }
  });

  // Agrupar dispositivos com coordenadas
  const groupedDevices = {};
  devicesWithCoords.forEach((device) => {
    const key = `${device.lat},${device.lng}`;
    if (!groupedDevices[key]) {
      groupedDevices[key] = [];
    }
    groupedDevices[key].push(device);
  });

  return (
    <Box m="20px">
      <Header title="MAPAS" subtitle="Localização dos sensores" />

      <Box height="400px" mt={3} borderRadius="16px" overflow="hidden">
        <MapContainer
          center={[-30.0, -52.0]}
          zoom={7}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {Object.entries(groupedDevices).map(([key, group], idx) => {
            const [lat, lng] = key.split(",").map(Number);
            const first = group[0];

            return (
              <Marker key={`group-${idx}`} position={[lat, lng]}>
                <Popup>
                  <strong>{first.company} - {first.type}</strong>
                  <br />
                  {group.map((d, i) => (
                    <div key={i}>
                      <Link
                        to={`/sensor/${d.device_id}`}
                        style={{ color: "#1976d2", textDecoration: "none" }}
                      >
                        {d.device_id}
                      </Link>: {parseFloat(d.last_temperature).toFixed(1)}°C
                    </div>
                  ))}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </Box>

      {devicesWithoutCoords.length > 0 && (
        <Paper elevation={2} sx={{ mt: 4, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Dispositivos sem coordenadas
          </Typography>
          <List dense>
            {devicesWithoutCoords.map((d) => (
              <ListItem key={d.device_id}>
                <ListItemText
                  primary={`${d.name || d.device_id} (${d.company} - ${d.type})`}
                  secondary="Coordenadas não disponíveis"
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default StoreMap;
