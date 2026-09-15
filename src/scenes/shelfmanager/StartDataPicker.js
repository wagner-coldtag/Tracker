import { Box } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import React from "react";

const StartDatePicker = ({ startDate, setStartDate }) => {
  const today = new Date();

  const handleStartDateChange = (newValue) => {
    if (!newValue) return;
    // Arredonda para a hora cheia
    const rounded = new Date(newValue);
    rounded.setMinutes(0, 0, 0); // zera minutos, segundos e ms
    setStartDate(rounded);
  };

  return (
    <Box display="flex" justifyContent="flex-start">
      <DateTimePicker
        label="Hora de Entrada"
        value={startDate}
        onChange={handleStartDateChange}
        maxDateTime={today}
        ampm={false}
        views={["year", "month", "day", "hours"]}
        sx={{
          "& .MuiInputBase-root": { fontSize: "0.9rem" },
          "& .MuiFormLabel-root": { fontSize: "0.8rem" },
          "& .MuiSvgIcon-root": { fontSize: "1rem" },
        }}
      />
    </Box>
  );
};

export default StartDatePicker;
