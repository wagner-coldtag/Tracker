import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsNone from "@mui/icons-material/NotificationsNone";
import SaveIcon from "@mui/icons-material/Save";
import SwapVert from "@mui/icons-material/SwapVert";
import WarningAmber from "@mui/icons-material/WarningAmber";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  FormControlLabel,
  IconButton,
  TablePagination,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useState, useEffect } from "react";
import { tokens } from "../../theme";
import useFetchSensorData from "./utils/useFetchSensorData";

// Same soft red used across the sensor UI
const ALERT_COLOR = "#e5695a";

const NotificationItem = ({
  notification,
  dirty,
  isLoading,
  onMeasureChange,
  onSolvedChange,
  onSave,
  formatTimestamp,
  colors,
}) => {
  const okColor = colors.blueAccent[500];
  const details = notification.details;
  const solved = !!details.solved;
  const accent = solved ? okColor : ALERT_COLOR;

  const temperature =
    typeof details.currentTemperature === "number"
      ? details.currentTemperature.toFixed(1)
      : details.currentTemperature;

  return (
    <Box
      sx={{
        border: `1px solid ${colors.grey[700]}`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 3,
        backgroundColor: colors.primary[400],
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      {/* Top row: reason, date, temperature */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          {solved ? (
            <CheckCircleOutline sx={{ color: accent }} />
          ) : (
            <WarningAmber sx={{ color: accent }} />
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight="bold" noWrap>
              {notification.type}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.grey[300] }}>
              {formatTimestamp(details.triggeredAt)}
            </Typography>
          </Box>
        </Box>

        {temperature !== undefined && temperature !== null && (
          <Chip
            label={`${temperature}°C`}
            sx={{
              flexShrink: 0,
              fontWeight: 700,
              color: "#fff",
              backgroundColor: accent,
            }}
          />
        )}
      </Box>

      {/* Bottom row: corrective action, solved, save */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: 1.5,
        }}
      >
        <TextField
          size="small"
          placeholder="Descreva a ação corretiva"
          value={details.correctiveMeasures || ""}
          onChange={(e) => onMeasureChange(e.target.value)}
          disabled={isLoading}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "& fieldset": { borderColor: colors.grey[700] },
              "&:hover fieldset": { borderColor: okColor },
              "&.Mui-focused fieldset": { borderColor: okColor, borderWidth: 1 },
              "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(okColor, 0.2)}` },
            },
          }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <FormControlLabel
            sx={{ m: 0 }}
            control={
              <Checkbox
                size="small"
                checked={solved}
                onChange={onSolvedChange}
                disabled={isLoading}
                sx={{ "&.Mui-checked": { color: okColor } }}
              />
            }
            label={<Typography variant="body2">Solucionada</Typography>}
          />

          <Button
            onClick={onSave}
            disabled={isLoading || !dirty}
            variant="contained"
            size="small"
            disableElevation
            startIcon={
              isLoading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SaveIcon />
            }
            sx={{
              backgroundColor: okColor,
              color: "#fff",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              "&:hover": { backgroundColor: alpha(okColor, 0.85) },
              "&.Mui-disabled": {
                backgroundColor: alpha(okColor, 0.25),
                color: alpha("#fff", 0.8),
              },
            }}
          >
            Salvar
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const NotificationsTable = ({
  sensorData,
  setSensorData,
  handleSaveSensorType,
  open,
  handleClose,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const okColor = colors.blueAccent[500];
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState("desc"); // newest first
  const { formatTimestamp } = useFetchSensorData();
  const [filterSolved, setFilterSolved] = useState("both"); // "both", "true", or "false"
  const [loadingIndex, setLoadingIndex] = useState(null); // index (in localNotifications) being saved

  // Local state to edit notifications
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

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleToggleOrder = () => {
    setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setPage(0);
  };

  const handleFilterChange = (event, value) => {
    if (value !== null) {
      setFilterSolved(value);
      setPage(0);
    }
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

  const handleSaveNewMeasure = async (index) => {
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

  // A notification is "dirty" when its editable fields differ from what's saved
  const isDirty = (index) => {
    const original = sensorData.notifications?.[index]?.details;
    const local = localNotifications[index]?.details;
    if (!original || !local) return false;
    return (
      (original.correctiveMeasures || "") !== (local.correctiveMeasures || "") ||
      !!original.solved !== !!local.solved
    );
  };

  const pendingCount = localNotifications.filter((n) => !n.details.solved).length;
  const solvedCount = localNotifications.length - pendingCount;

  // Keep each item's index in localNotifications, so edits hit the right notification
  // even after sorting, filtering, and paginating.
  const items = localNotifications
    .map((notification, index) => ({ notification, index }))
    .filter(
      ({ notification }) =>
        filterSolved === "both" || String(!!notification.details.solved) === filterSolved
    )
    .sort((a, b) =>
      order === "asc"
        ? a.notification.details.timestamp - b.notification.details.timestamp
        : b.notification.details.timestamp - a.notification.details.timestamp
    );

  const paginatedItems = items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: colors.primary[500],
          backgroundImage: "none",
          border: `1px solid ${colors.grey[700]}`,
          m: 2,
          width: "100%",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: `1px solid ${colors.grey[700]}`,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Notificações
          </Typography>
          <Typography variant="body2" sx={{ color: colors.grey[300] }}>
            {pendingCount} pendente{pendingCount === 1 ? "" : "s"} · {localNotifications.length} no
            total
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: colors.grey[300] }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Filter + sort */}
      {localNotifications.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
            px: 3,
            py: 1.5,
            borderBottom: `1px solid ${colors.grey[700]}`,
          }}
        >
          <ToggleButtonGroup
            exclusive
            size="small"
            value={filterSolved}
            onChange={handleFilterChange}
            sx={{
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 600,
                px: 1.5,
                color: colors.grey[300],
                borderColor: colors.grey[700],
                "&.Mui-selected": {
                  color: okColor,
                  backgroundColor: alpha(okColor, 0.15),
                },
              },
            }}
          >
            <ToggleButton value="both">Todas ({localNotifications.length})</ToggleButton>
            <ToggleButton value="false">Pendentes ({pendingCount})</ToggleButton>
            <ToggleButton value="true">Solucionadas ({solvedCount})</ToggleButton>
          </ToggleButtonGroup>

          <Button
            onClick={handleToggleOrder}
            startIcon={<SwapVert />}
            size="small"
            sx={{ color: okColor, textTransform: "none", fontWeight: 600 }}
          >
            {order === "desc" ? "Mais recentes" : "Mais antigas"}
          </Button>
        </Box>
      )}

      {/* List */}
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {items.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {paginatedItems.map(({ notification, index }) => (
              <NotificationItem
                key={`${notification.details.timestamp}-${index}`}
                notification={notification}
                dirty={isDirty(index)}
                isLoading={loadingIndex === index}
                onMeasureChange={(value) => handleCorrectiveMeasureChange(index, value)}
                onSolvedChange={() => handleSolvedChange(index)}
                onSave={() => handleSaveNewMeasure(index)}
                formatTimestamp={formatTimestamp}
                colors={colors}
              />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 6,
              color: colors.grey[300],
            }}
          >
            <NotificationsNone sx={{ fontSize: 48 }} />
            <Typography variant="h6">
              {localNotifications.length === 0
                ? "Sem notificações no momento."
                : "Nenhuma notificação neste filtro."}
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Pagination */}
      {items.length > 0 && (
        <Box sx={{ borderTop: `1px solid ${colors.grey[700]}` }}>
          <TablePagination
            component="div"
            rowsPerPageOptions={[5, 10, 25]}
            count={items.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Por página"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            disabled={loadingIndex !== null}
          />
        </Box>
      )}
    </Dialog>
  );
};

export default NotificationsTable;