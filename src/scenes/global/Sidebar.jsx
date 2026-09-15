import ArticleIcon from "@mui/icons-material/Article";
import AssistantIcon from "@mui/icons-material/Assistant";
import BluetoothIcon from "@mui/icons-material/Bluetooth";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import MapIcon from "@mui/icons-material/Map";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import { Box, IconButton, Typography, useTheme, useMediaQuery } from "@mui/material";
import { useState, useEffect } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link , useLocation } from "react-router-dom";
import Logo from "./Logo.png";
import { tokens } from "../../theme";

const Item = ({ title, to, icon, selected, setSelected }) => {

  return (
    <MenuItem
      active={selected === title}

      onClick={() => setSelected(title)}
      icon={icon}
      component={<Link to={to} />} // Fix: Use "component" prop instead of nesting <Link />
    >
      <Typography>{title}</Typography>
    </MenuItem>
  );
};


const ProSidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const [selected, setSelected] = useState(() => {
    const pathToTitle = {
      "/": "Temperatura",
      "/indicadores": "Indicadores",
      "/report": "Relatórios",
      "/RSSI": "Conectividade",
      "/maps": "Mapas",
    };
    return pathToTitle[location.pathname] || "Temperatura";
  });
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Check if the screen is small

  useEffect(() => {
    setIsCollapsed(isSmallScreen);
  }, [isSmallScreen]); // Run this effect whenever isSmallScreen changes

  return (

    <Box
      sx={{
        height: "100vh",
        backgroundColor: colors.primary[400]
      }}
    >
      <Sidebar collapsed={isCollapsed} 
        backgroundColor= {colors.primary[400]}
      >
        <Menu 
          menuItemStyles={{
            button: ({ level, active }) => {
              if (level === 0 || level === 1 ) {
                return {
                  color: active ? "rgb(42, 180, 234)" : "" ,
                  "&:hover" : {
                    color:  "rgb(20, 120, 180)",
                  }
                };
              }
            },
          }}
        >
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

            <Item
              title="Temperatura"
              to="/"
              icon={<DeviceThermostatIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Indicadores"
              to="/indicadores"
              icon={<QueryStatsIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Predição de Shelf life"
              to="/ia"
              icon={<AssistantIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Relatórios"
              to="/report"
              icon={<ArticleIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Conectividade"
              to="/RSSI"
              icon={<BluetoothIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Mapas"
              to="/maps"
              icon={<MapIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
      </Sidebar>
    </Box>
  );
};

export default ProSidebar;
