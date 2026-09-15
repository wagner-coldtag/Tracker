import {
  Box, useTheme,
  Typography,
  Button,
  Popper,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  ClickAwayListener,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PDFDownloadLink } from "@react-pdf/renderer";
import React, { useState, useRef, useEffect } from "react";
import TemperatureReport from "./Report";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import DateRangePicker from "../dashboard/utils/DataRangePicker";
import useFetchSensorData from "../dashboard/utils/useFetchSensorData";

const ReportPage = () => {
  const [isLoadingData, setIsLoadingData] = useState(true);

  const { devices, setSelectedDevice, selectedDevice, data, startDate, setStartDate, endDate, setEndDate } = useFetchSensorData();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const [reportDevice, setReportDevice] = useState(null);

  const handleToggle = () => setOpen((prev) => !prev);
  const handleSelect = (device) => {
    setReportDevice(device);
    setSelectedDevice(device.device_id);
    setOpen(false);
  };
  const handleClickAway = () => setOpen(false);

  const transformedData = data[0]?.data.map((tempPoint) => {
    const time = tempPoint.x; // keep it as number
    const temp = typeof tempPoint.y === "number" ? parseFloat(tempPoint.y.toFixed(1)) : 0;
    return { time, temp };
  }) || [];
  React.useEffect(() => {
    if (selectedDevice && data && data.length > 0 && data[0]?.data?.length > 0) {
      setIsLoadingData(false);
    } else {
      setIsLoadingData(true);
    }
  }, [data, selectedDevice]);
  useEffect(() => {
    if (selectedDevice && startDate && endDate) {
      setIsLoadingData(true);
    }
  }, [startDate, endDate, selectedDevice]);

  // Desativa o loading quando os dados chegam
  useEffect(() => {
    if (selectedDevice && data && data.length > 0 && data[0]?.data?.length > 0) {
      setIsLoadingData(false);
    }
  }, [data, selectedDevice]);


  return (
    <Box m="20px">
      <Header title="RELATÓRIOS" subtitle="Geração de relatórios" />

      <Typography variant="h6" mt={4} mb={2}>
        Selecione um dispositivo e intervalo de datas:
      </Typography>

      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        alignItems="start"
        gap={2}
        mb={3}
      >
        {/* Device Selector */}
        <ClickAwayListener onClickAway={handleClickAway}>
          <Box>
            <Button
              variant="outlined"
              ref={anchorRef}
              onClick={handleToggle}
              sx={{ width: 250, height: 54, justifyContent: "space-between", backgroundColor: colors.primary[400], color: colors.grey[100]}}
            >
              {selectedDevice
                ? selectedDevice
                : "Selecionar Dispositivo"}
            </Button>

            <Popper
              open={open}
              anchorEl={anchorRef.current}
              placement="bottom-start"
              style={{ zIndex: 1300 }}
            >
              <Paper sx={{ mt: 1, maxHeight: 250, overflowY: "auto", width: 250 }}>
                <List dense>
                  {devices?.length > 0 ? (
                    devices.map((device) => (
                      <ListItemButton
                        key={device.device_id}
                        onClick={() => handleSelect(device)}
                        selected={selectedDevice?.id === device.device_id}
                      >
                        <ListItemText
                          primary={device.name || device.device_id}
                          secondary={`${device?.company} / ${device?.type}`}
                        />
                      </ListItemButton>
                    ))
                  ) : (
                    <ListItemText primary="Nenhum dispositivo encontrado." />
                  )}
                </List>
              </Paper>
            </Popper>
          </Box>
        </ClickAwayListener>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateRangePicker
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        </LocalizationProvider>
      </Box>

      <Typography variant="h6" mb={2}>
        Gerar Relatório
      </Typography>
      {selectedDevice && startDate && endDate ? (
        isLoadingData ? (
          <Button
            variant="contained"
            disabled
            sx={{
              mr: "10px",
              color: "rgb(42, 180, 234)",
              backgroundColor: colors.primary[400],
              borderColor: colors.grey[100],
              width: "170px",
              height: "30px",
            }}
          >
      Carregando dados...
          </Button>
        ) : (
          <PDFDownloadLink
            document={
              <TemperatureReport
                device={reportDevice}
                startDate={startDate}
                endDate={endDate}
                data={transformedData}
              />
            }
            fileName={`relatorio-${selectedDevice}.pdf`}
            style={{ textDecoration: "none" }}
          >
            {({ loading }) => (
              <Button
                variant="contained"
                disabled={loading}
                sx={{
                  mr: "10px",
                  color: "rgb(42, 180, 234)",
                  backgroundColor: colors.primary[400],
                  borderColor: colors.grey[100],
                  "&:hover": {
                    backgroundColor: colors.primary[900],
                  },
                  width: "170px",
                  height: "30px",
                }}
              >
                {loading ? "Gerando..." : "Baixar Relatório PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        )
      ) : (
        <Typography variant="body1" color="textSecondary">
    Selecione o dispositivo e o intervalo de datas para gerar o relatório.
        </Typography>
      )}
    </Box>
  );
};

export default ReportPage;
  