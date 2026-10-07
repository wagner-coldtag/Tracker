import { Box, Typography, useTheme } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { tokens } from "../../theme";

const AlarmBar = ({
  data,
  title,
  barColor,
  height = 200,
  dataKey = "alarms",
  unit = "", // shown in the tooltip, e.g. "min"
  allowDecimals = false, // y-axis ticks; true for averages
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const okColor = colors.blueAccent[500];
  const axisColor = theme.palette.text.secondary;
  const fill = barColor || okColor;
  const isEmpty = !data || data.length === 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const raw = Number(payload[0].value);
    const value = Number.isInteger(raw) ? raw : raw.toFixed(1);
    return (
      <Box
        sx={{
          backgroundColor: colors.primary[400],
          border: `1px solid ${colors.grey[700]}`,
          borderLeft: `4px solid ${okColor}`,
          borderRadius: 2,
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          px: 1.5,
          py: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: axisColor }}>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight="bold" sx={{ color: okColor }}>
          {value}
          {unit ? ` ${unit}` : ""}
        </Typography>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        borderRadius: 3,
        backgroundColor: colors.primary[400],
        p: 2,
        height: "100%",
      }}
    >
      <Typography variant="h5" fontWeight="600" sx={{ mb: 1.5 }}>
        {title}
      </Typography>

      {isEmpty ? (
        <Box
          sx={{
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.grey[300],
          }}
        >
          <Typography variant="body2">Sem dados no período</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={colors.grey[700]}
              opacity={0.5}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: axisColor, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              minTickGap={16}
            />
            <YAxis
              allowDecimals={allowDecimals}
              tick={{ fill: axisColor, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: okColor, fillOpacity: 0.08 }} />
            <Bar
              dataKey={dataKey}
              fill={fill}
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default AlarmBar;