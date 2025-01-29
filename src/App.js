import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Account from "./scenes/auth/Account";
import Sensors from "./scenes/sensors";
import Line from "./scenes/line";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import RSSI from "./scenes/dashboard/RSSI";
import SensorDetailsPage from "./scenes/dashboard/SensorDetailsPage"; // Import the new sensor details page

import Auth from "./scenes/auth/Auth";
import { UserState } from "./context/UserProvider";
import ChangePassword from "./scenes/auth/ChangePassword";

function App () {
  const { loggedIn } = UserState();
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {loggedIn? (
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

                <Route path="/rssi" element={<RSSI />} />
                <Route path="/change-password" element={<ChangePassword />} />  {/* Add this route */}

              </Routes>
            </main>
          </div>
        ):(
          <Auth />
        )}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;