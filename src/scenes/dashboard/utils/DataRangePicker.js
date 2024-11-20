import React from "react";
import { Box } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

const DateRangePicker = ({ startDate, setStartDate, endDate, setEndDate }) => (
  <Box display="flex" justifyContent="space-between" gap="10px">
    <DateTimePicker
      label="Start Date"
      value={startDate}
      onChange={(newValue) => setStartDate(newValue)}
      sx={{
        "& .MuiInputBase-root": { fontSize: "0.9rem" }, // Adjust input font size
        "& .MuiFormLabel-root": { fontSize: "0.8rem" }, // Adjust label font size
        "& .MuiSvgIcon-root": { fontSize: "1rem" }, // Adjust calendar icon size
      }}
    />
    <DateTimePicker
      label="End Date"
      value={endDate}
      onChange={(newValue) => setEndDate(newValue)}
    />
  </Box>
);

export default DateRangePicker;
