import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, useMediaQuery } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import SignalWifi4BarIcon from "@mui/icons-material/SignalWifi4Bar";
import Logo from "./Logo.png";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import SensorsIcon from "@mui/icons-material/Sensors";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Temperature");
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Check if the screen is small

  useEffect(() => {
    setIsCollapsed(isSmallScreen);
  }, [isSmallScreen]); // Run this effect whenever isSmallScreen changes

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "rgb(0, 120, 180) !important",
        },
        "& .pro-menu-item.active": {
          color: "rgb(42, 180, 234) !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "0 0 10px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="20px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  {/* Title or other content can go here */}
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="20px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="80px"
                  height="80px"
                  src={Logo}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h3"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  Coldtag
                </Typography>
                <Typography variant="h6" color={colors.greenAccent[500]}>
                  Administração de sensores
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Typography
              variant="h7"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Charts
            </Typography>
            <Item
              title="Temperatura"
              to="/"
              icon={<DeviceThermostatIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Pacotes"
              to="/package"
              icon={<Inventory2Icon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Tensão"
              to="/voltage"
              icon={<FlashOnIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="RSSI"
              to="/RSSI"
              icon={<SignalWifi4BarIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Sensores
            </Typography>
            <Item
              title="Sensores"
              to="/sensor"
              icon={<SensorsIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            {/* Other items can go here */}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
