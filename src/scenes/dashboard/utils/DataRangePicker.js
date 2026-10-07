import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, useTheme } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import React from "react";
import { tokens } from "../../../theme";

const FIELD_WIDTH = 210;

const DateRangePicker = ({ startDate, setStartDate, endDate, setEndDate }) => {
  const today = new Date();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const okColor = colors.blueAccent[500];

  // Shared style for both fields
  const fieldSx = {
    // Phone: share the row equally. sm and up: fixed width.
    width: { xs: "auto", sm: FIELD_WIDTH },
    flex: { xs: "1 1 0", sm: "0 0 auto" },
    minWidth: 0,
    "& .MuiOutlinedInput-root": {
      backgroundColor: colors.primary[400],
      borderRadius: 3,
      fontSize: { xs: "0.75rem", sm: "0.9rem" },
      transition: "box-shadow 0.2s ease",
      "& fieldset": { borderColor: colors.grey[700] },
      "&:hover fieldset": { borderColor: okColor },
      "&.Mui-focused fieldset": { borderColor: okColor, borderWidth: 1 },
      "&.Mui-focused": { boxShadow: `0 0 0 3px ${okColor}33` },
      "& .MuiInputBase-input": { px: { xs: 1, sm: 1.75 } },
    },
    "& .MuiInputLabel-root": { fontSize: { xs: "0.75rem", sm: "0.85rem" } },
    "& .MuiInputLabel-root.Mui-focused": { color: okColor },
    "& .MuiSvgIcon-root": { fontSize: { xs: "1rem", sm: "1.2rem" }, color: okColor },
  };

  const commonProps = {
    format: "dd/MM/yyyy HH:mm",
    ampm: false,
    slotProps: {
      textField: { size: "small", sx: fieldSx },
      openPickerButton: { size: "small" },
    },
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      flexWrap="nowrap"
      gap={1}
      sx={{ width: { xs: "100%", sm: "auto" } }}
    >
      <DateTimePicker
        {...commonProps}
        label="Início"
        value={startDate}
        onChange={(newValue) => {
          setStartDate(newValue);
          // Prevents endDate from being earlier than startDate
          if (endDate && newValue && new Date(endDate) < new Date(newValue)) {
            setEndDate(newValue);
          }
        }}
        maxDateTime={today}
      />

      <ArrowForwardIcon sx={{ fontSize: 18, color: colors.grey[400], flexShrink: 0 }} />

      <DateTimePicker
        {...commonProps}
        label="Fim"
        value={endDate}
        onChange={(newValue) => setEndDate(newValue)}
        minDateTime={startDate || undefined}
        maxDateTime={today}
      />
    </Box>
  );
};

export default DateRangePicker;