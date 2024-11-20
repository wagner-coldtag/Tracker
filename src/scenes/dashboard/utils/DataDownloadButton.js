import React from "react";
import { Button, IconButton, Box } from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

const DataDownloadButtons = ({ data, refreshDevices, colors }) => (
  <Box display="flex" alignItems="center" gap="10px">
    <IconButton
      onClick={refreshDevices}
      sx={{
        backgroundColor: colors.greenAccent[500],
        "&:hover": { backgroundColor: colors.greenAccent[600] },
      }}
    >
      <RefreshIcon />
    </IconButton>
    <Button
      onClick={() => console.log("Download data", data)}
      sx={{
        backgroundColor: colors.blueAccent[700],
        color: colors.grey[100],
        "&:hover": { backgroundColor: colors.blueAccent[800] },
      }}
    >
      <DownloadOutlinedIcon /> Download Reports
    </Button>
  </Box>
);

export default DataDownloadButtons;
