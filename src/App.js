import { CssBaseline, ThemeProvider } from "@mui/material";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { UserState } from "./context/UserProvider";
import Account from "./scenes/auth/Account";
import Auth from "./scenes/auth/Auth";
import ChangePassword from "./scenes/auth/ChangePassword";
import Dashboard from "./scenes/dashboard";
import RSSI from "./scenes/dashboard/RSSI";
import SensorDetailsPage from "./scenes/dashboard/SensorDetailsPage"; // Import the new sensor details page
import Sidebar from "./scenes/global/Sidebar";
import Topbar from "./scenes/global/Topbar";
import KPI from "./scenes/KPI/KPI";
//import LandPage from "./scenes/landpage";
import Landing from "./scenes/landpage/Landing";
import Line from "./scenes/line";
import StoreMap from "./scenes/maps/Maps";
import ReportPage from "./scenes/report/ReportPage";
import Sensors from "./scenes/sensors";
import ShelfLifeManager from "./scenes/shelfmanager/ShelfLifeManager";
import { ColorModeContext, useMode } from "./theme";

function App() {
  const { loggedIn } = UserState();
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {loggedIn ? (
          <div className="app">
            <Sidebar isSidebar={isSidebar} />
            <main className="content">
              <Topbar setIsSidebar={setIsSidebar} />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/auth" element={<Dashboard />} />
                <Route path="/sensor/:sensorId" element={<SensorDetailsPage />} />  {/* New route for sensor details */}
                <Route path="/Tracker" element={<Dashboard />} />
                <Route path="/account" element={<Account />} />
                <Route path="/line" element={<Line />} />
                <Route path="/sensor" element={<Sensors />} />
                <Route path="/maps" element={<StoreMap />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/ia" element={<ShelfLifeManager />} />

                <Route path="/indicadores" element={<KPI />} />


                <Route path="/rssi" element={<RSSI />} />
                <Route path="/change-password" element={<ChangePassword />} />  {/* Add this route */}

              </Routes>
            </main>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Landing/>} />
            <Route path="/auth" element={<Auth/>} />
          </Routes>

        )}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;