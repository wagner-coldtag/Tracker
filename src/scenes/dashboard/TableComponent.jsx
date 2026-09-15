import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Dialog,
  DialogContent,
  MenuItem,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  Paper,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Checkbox,
  IconButton,
  TextField,
  Typography,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { useState, useEffect } from "react";
import { tokens } from "../../theme";
import useFetchSensorData from "./utils/useFetchSensorData";

const NotificationsTable = ({
  sensorData,
  setSensorData,
  handleSaveSensorType,
  open,
  handleClose,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState("asc");
  const { formatTimestamp } = useFetchSensorData();
  const [filterSolved, setFilterSolved] = useState("both"); // "both", "true", or "false"
  const [loadingIndex, setLoadingIndex] = useState(null); // índice do item que está salvando

  // Estado local para editar notificações
  const [localNotifications, setLocalNotifications] = useState([]);

  useEffect(() => {
    if (sensorData.notifications) {
      const clone = sensorData.notifications.map((n) => ({
        ...n,
        details: { ...n.details },
      }));
      setLocalNotifications(clone);
      setPage(0);
    } else {
      setLocalNotifications([]);
    }
  }, [sensorData.notifications]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = () => {
    setOrder(order === "asc" ? "desc" : "asc");
  };

  const handleCorrectiveMeasureChange = (index, value) => {
    setLocalNotifications((prev) =>
      prev.map((n, i) =>
        i === index ? { ...n, details: { ...n.details, correctiveMeasures: value } } : n
      )
    );
  };

  const handleSolvedChange = (index) => {
    setLocalNotifications((prev) =>
      prev.map((n, i) =>
        i === index ? { ...n, details: { ...n.details, solved: !n.details.solved } } : n
      )
    );
  };

  const handleSaveNewMeasure = async(index) => {
    setLoadingIndex(index);
    try {
      setSensorData({ ...sensorData, notifications: localNotifications });
      localStorage.setItem(
        "selectedDevice",
        JSON.stringify({ ...sensorData, notifications: localNotifications })
      );
      await handleSaveSensorType();
    } catch (error) {
      console.error("Erro ao salvar notificações:", error);
    } finally {
      setLoadingIndex(null);
    }
  };

  const sortedNotifications = [...localNotifications].sort((a, b) => {
    return order === "asc"
      ? a.details.timestamp - b.details.timestamp
      : b.details.timestamp - a.details.timestamp;
  });

  const filteredNotifications = sortedNotifications.filter((notification) => {
    if (filterSolved === "both") return true;
    return String(notification.details.solved) === filterSolved;
  });

  const paginatedNotifications = filteredNotifications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      sx={{
        "& .MuiDialog-paper": {
          padding: "10px",
          borderRadius: "8px",
          width: "800px",
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Typography fontWeight="bold">Notificações</Typography>

          <Box sx={{ minWidth: 200 }}>
            <TextField
              select
              label="Filtrar por Solucionada"
              value={filterSolved}
              onChange={(e) => setFilterSolved(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="both">Todas</MenuItem>
              <MenuItem value="true">Solucionadas</MenuItem>
              <MenuItem value="false">Não solucionadas</MenuItem>
            </TextField>
          </Box>

          <IconButton onClick={handleClose} sx={{ color: "rgb(42, 180, 234)" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {localNotifications && localNotifications.length > 0 ? (
          <TableContainer
            component={Paper}
            sx={{ backgroundColor: colors.primary[400], ml: "20px", maxWidth: "95%" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ height: "35px" }}>
                  <TableCell><Typography fontWeight="bold">Razão</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Temperatura (°C)</Typography></TableCell>
                  <TableCell>
                    <TableSortLabel active direction={order} onClick={handleRequestSort}>
                      <Typography fontWeight="bold">Data</Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell><Typography fontWeight="bold">Ação corretiva</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Solucionada</Typography></TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedNotifications.map((notification, index) => {
                  const globalIndex = page * rowsPerPage + index;
                  const isLoading = loadingIndex === globalIndex;

                  return (
                    <TableRow key={`${notification.details.timestamp}-${globalIndex}`} sx={{ height: "30px" }}>
                      <TableCell>{notification.type}</TableCell>
                      <TableCell>
                        {typeof notification?.details?.currentTemperature === "number"
                          ? notification.details.currentTemperature.toFixed(1)
                          : notification.details.currentTemperature}
                      </TableCell>
                      <TableCell>{formatTimestamp(notification.details.triggeredAt)}</TableCell>
                      <TableCell>
                        <TextField
                          sx={{ "& .MuiInputBase-root": { height: "25px" } }}
                          fullWidth
                          size="small"
                          placeholder="Descreva a ação"
                          value={localNotifications[globalIndex]?.details.correctiveMeasures || ""}
                          onChange={(e) =>
                            handleCorrectiveMeasureChange(globalIndex, e.target.value)
                          }
                          name={`corrective-${notification.details.timestamp}-${globalIndex}`}
                          disabled={isLoading}
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          sx={{
                            transform: "scale(0.8)",
                            height: "10px",
                            "&.Mui-checked": { color: "rgb(42, 180, 234)" },
                          }}
                          checked={localNotifications[globalIndex]?.details.solved || false}
                          onChange={() => handleSolvedChange(globalIndex)}
                          name={`solved-${notification.details.timestamp}-${globalIndex}`}
                          disabled={isLoading}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleSaveNewMeasure(globalIndex)}
                          disabled={isLoading}
                          aria-label="Salvar alterações"
                        >
                          {isLoading ? (
                            <CircularProgress size={24} sx={{ color: "rgb(42, 180, 234)" }} />
                          ) : (
                            <SaveIcon sx={{ color: "rgb(42, 180, 234)" }} />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredNotifications.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              disabled={loadingIndex !== null} // bloqueia paginação só se estiver salvando algum item
            />
          </TableContainer>
        ) : (
          <Typography color="white" sx={{ ml: "20px" }}>
            Sem notificações no momento.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsTable;
