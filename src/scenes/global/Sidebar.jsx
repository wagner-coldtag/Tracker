import ArticleIcon from "@mui/icons-material/Article";
import AssistantIcon from "@mui/icons-material/Assistant";
import BluetoothIcon from "@mui/icons-material/Bluetooth";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import MapIcon from "@mui/icons-material/Map";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import { Box, IconButton, Tooltip, Typography, alpha, useTheme, useMediaQuery } from "@mui/material";
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo.png";
import { tokens } from "../../theme";

// Fixed second stop for the selected-tile gradient (same as Dashboard tabs)
const GRADIENT_DEEP_BLUE = "#0B63C4";

const EXPANDED_WIDTH = 104;
const COLLAPSED_WIDTH = 72;

const NAV_ITEMS = [
  { title: "Temperatura", to: "/", icon: <DeviceThermostatIcon /> },
  { title: "Indicadores", to: "/indicadores", icon: <QueryStatsIcon /> },
  { title: "Shelf life", to: "/ia", icon: <AssistantIcon /> },
  { title: "Relatórios", to: "/report", icon: <ArticleIcon /> },
  { title: "Conectividade", to: "/RSSI", icon: <BluetoothIcon /> },
  { title: "Mapas", to: "/maps", icon: <MapIcon /> },
];

const PATH_TO_TITLE = NAV_ITEMS.reduce((acc, item) => ({ ...acc, [item.to]: item.title }), {});

const NavTile = ({ title, to, icon, active, isCollapsed, colors, okColor }) => {
  const tile = (
    <Box
      component={Link}
      to={to}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        mx: 1,
        my: 0.5,
        py: isCollapsed ? 1 : 1.5,
        px: 0.5,
        borderRadius: 3,
        textDecoration: "none",
        color: active ? "#fff" : colors.grey[300],
        background: active
          ? `linear-gradient(135deg, ${okColor} 0%, ${GRADIENT_DEEP_BLUE} 100%)`
          : "transparent",
        transition: "background-color 0.2s ease, color 0.2s ease",
        "&:hover": !active
          ? { backgroundColor: alpha(okColor, 0.12), color: okColor }
          : undefined,
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: isCollapsed ? 22 : 24 } })}
      {!isCollapsed && (
        <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, textAlign: "center", lineHeight: 1.15 }}>
          {title}
        </Typography>
      )}
    </Box>
  );

  return isCollapsed ? (
    <Tooltip title={title} placement="right">
      {tile}
    </Tooltip>
  ) : (
    tile
  );
};

const ProSidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const okColor = colors.blueAccent[500];
  const location = useLocation();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [isCollapsed, setIsCollapsed] = useState(isSmallScreen);

  useEffect(() => {
    setIsCollapsed(isSmallScreen);
  }, [isSmallScreen]);

  const selected = PATH_TO_TITLE[location.pathname] || "Temperatura";

  return (
    <Box
      sx={{
        height: "100vh",
        width: isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        flexShrink: 0,
        backgroundColor: colors.primary[400],
        borderRight: `1px solid ${colors.grey[700]}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // no scrollbar, ever
        transition: "width 0.2s ease",
      }}
    >
      {/* Toggle + brand */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 2,
          pb: 1.5,
          borderBottom: `1px solid ${colors.grey[700]}`,
          flexShrink: 0,
        }}
      >
        <IconButton
          onClick={() => setIsCollapsed((prev) => !prev)}
          sx={{ color: colors.grey[300], mb: isCollapsed ? 0 : 1 }}
        >
          {isCollapsed ? <MenuOutlinedIcon /> : <ChevronLeft />}
        </IconButton>

        {!isCollapsed && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
            <Box
              component="img"
              alt="Coldtag"
              src={Logo}
              sx={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
            />
            <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.1 }}>
              Coldtag
            </Typography>
            <Typography variant="caption" sx={{ color: colors.grey[300], textAlign: "center", lineHeight: 1.1 }}>
              Sensores
            </Typography>
          </Box>
        )}
      </Box>

      {/* Nav tiles */}
      <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 0.5, overflow: "hidden" }}>
        {NAV_ITEMS.map((item) => (
          <NavTile
            key={item.title}
            title={item.title}
            to={item.to}
            icon={item.icon}
            active={selected === item.title}
            isCollapsed={isCollapsed}
            colors={colors}
            okColor={okColor}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ProSidebar;