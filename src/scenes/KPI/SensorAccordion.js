import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Typography, Grid, Accordion, AccordionSummary, AccordionDetails, useTheme } from "@mui/material";
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
  return (
    <Accordion sx={{ mb: 2, backgroundColor: colors.primary[400],
    }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight={500}>{sensor.name || `Sensor ${sensor.device_id}`}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <AlarmBar
              data={sensorData}
              title="Alarmes"
              barColor="rgba(42,180,234,0.6)"
              height={150}

            />
          </Grid>
          <Grid item xs={12} md={4}>
            <PiePlot
              data={sensorStatusData}
              title="Temperatura"
              height={150}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <AlarmBar
              data={sensorResolutionData}
              title="Tempo de resolução"
              barColor="rgba(42,180,234,0.6)"
              dataKey="avgMinutes"
              height={150}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default SensorAccordion;