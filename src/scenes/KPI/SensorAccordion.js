import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionSummary, AccordionDetails, Box, Chip, Typography, useTheme } from "@mui/material";
import AlarmBar from "./AlarmBar";
import PiePlot from "./PieChart";
import useAlarmData from "./useAlarmData";
import useAverageResolutionTime from "./useAverageResolutionTIme";
import useTemperatureStatusData from "./useTemperatureStatus";
import { tokens } from "../../theme";

const SensorAccordion = ({ sensor, startDate, endDate }) => {
  const sensorData = useAlarmData(sensor.notifications, startDate, endDate);
  const sensorStatusData = useTemperatureStatusData(sensor.notifications, startDate, endDate);
  const sensorResolutionData = useAverageResolutionTime(sensor.notifications, startDate, endDate);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const totalAlarms = (sensorData ?? []).reduce((sum, d) => sum + (Number(d.alarms) || 0), 0);

  return (
    <Accordion
      disableGutters
      elevation={0}
      square={false}
      sx={{
        mb: 1.5,
        backgroundColor: colors.primary[400],
        border: `1px solid ${colors.grey[700]}`,
        borderRadius: "12px !important",
        overflow: "hidden",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography variant="h5" fontWeight="600">
            {sensor.name || `Sensor ${sensor.device_id}`}
          </Typography>
          <Chip
            size="small"
            label={totalAlarms === 1 ? "1 alarme" : `${totalAlarms} alarmes`}
            sx={{
              fontWeight: 700,
              color: "#fff",
              backgroundColor: totalAlarms > 0 ? colors.alert : colors.blueAccent[500],
            }}
          />
        </Box>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          p: 2,
          backgroundColor: colors.primary[500],
          borderTop: `1px solid ${colors.grey[700]}`,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          }}
        >
          <AlarmBar data={sensorData} title="Alarmes" height={180} />
          <PiePlot data={sensorStatusData} title="Temperatura" height={180} />
          <AlarmBar
            data={sensorResolutionData}
            title="Tempo de resolução"
            dataKey="avgMinutes"
            unit="min"
            allowDecimals
            height={180}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default SensorAccordion;