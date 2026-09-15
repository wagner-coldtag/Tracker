import { Box, useTheme } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import React from "react";
import { tokens } from "../../../theme";


const DateRangePicker = ({ startDate, setStartDate, endDate, setEndDate }) => {
  const today = new Date();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box display="flex" justifyContent="space-between" gap="10px">
      <DateTimePicker
        label="Data de Início"
        value={startDate}
        onChange={(newValue) => {
          setStartDate(newValue);
          // Evita que endDate fique menor que startDate
          if (endDate && newValue && new Date(endDate) < new Date(newValue)) {
            setEndDate(newValue);
          }
        }}
        maxDateTime={today}
        sx={{
          backgroundColor: colors.primary[400],
          "& .MuiInputBase-root": { fontSize: "0.9rem" },
          "& .MuiFormLabel-root": { fontSize: "0.8rem" },
          "& .MuiSvgIcon-root": { fontSize: "1rem" },
        }}
      />
      <DateTimePicker
        label="Data de Fim"
        value={endDate}
        onChange={(newValue) => setEndDate(newValue)}
        minDateTime={startDate || undefined} // evita datas anteriores à inicial
        maxDateTime={today} // evita datas futuras
        sx={{
          backgroundColor: colors.primary[400],
        }}
      />
    </Box>
  );
};

export default DateRangePicker;
