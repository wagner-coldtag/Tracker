import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTheme, Box, Typography } from "@mui/material";
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { tokens } from "../theme";

// Same soft red used in SensorCard / SensorDetailsPage
const ALERT_COLOR = "#e5695a";

const isValidLimit = (v) => v !== undefined && v !== null && v !== "" && !Number.isNaN(Number(v));

const clamp01 = (n) => Math.min(1, Math.max(0, n));

const formatTick = (value) =>
  new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatFull = (value) =>
  new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const Chart = ({ data, tempMin, tempMax }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const okColor = colors.blueAccent[500];
  const axisColor = theme.palette.text.secondary;

  const hasMin = isValidLimit(tempMin);
  const hasMax = isValidLimit(tempMax);
  const min = hasMin ? Number(tempMin) : null;
  const max = hasMax ? Number(tempMax) : null;

  const isOut = (v) => (hasMax && v > max) || (hasMin && v < min);

  // Convert to the format Recharts expects (Temperatura is a real number)
  const transformedData = (data?.[0]?.data ?? [])
    .filter((p) => typeof p.y === "number")
    .map((p) => ({ time: p.x * 1000, Temperatura: Number(p.y.toFixed(1)) }));

  if (transformedData.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100%"
        minHeight="200px"
        p={2}
      >
        <ErrorOutlineIcon sx={{ fontSize: 48, color: ALERT_COLOR, mb: 1 }} />
        <Typography variant="h6" align="center">
          Este sensor não possui dados de temperatura no período informado.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" mt={1}>
          Verifique se o dispositivo está conectado ou ativo.
        </Typography>
      </Box>
    );
  }

  // Data extent (loop avoids stack issues with Math.min(...bigArray))
  let dataLow = Infinity;
  let dataHigh = -Infinity;
  for (const d of transformedData) {
    if (d.Temperatura < dataLow) dataLow = d.Temperatura;
    if (d.Temperatura > dataHigh) dataHigh = d.Temperatura;
  }

  // Y domain: cover both the readings and the ideal range
  let low = dataLow;
  let high = dataHigh;
  if (hasMin) low = Math.min(low, min);
  if (hasMax) high = Math.max(high, max);
  const yDomain = [Math.floor(low) - 1, Math.ceil(high) + 1];

  // Stroke gradient: where the limits fall along the line's vertical extent (0 = top, 1 = bottom)
  const dataRange = dataHigh - dataLow;
  const isFlat = dataRange === 0; // a gradient can't render on a perfectly flat line
  const offMax = !isFlat && hasMax ? clamp01((dataHigh - max) / dataRange) : 0;
  const offMin = !isFlat && hasMin ? clamp01((dataHigh - min) / dataRange) : 1;
  const lineStroke = isFlat
    ? isOut(dataHigh) ? ALERT_COLOR : okColor
    : "url(#temperatureStroke)";

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const value = payload[0].value;
    const out = isOut(value);
    return (
      <Box
        sx={{
          backgroundColor: colors.primary[400],
          border: `1px solid ${out ? ALERT_COLOR : colors.grey[700]}`,
          borderLeft: `4px solid ${out ? ALERT_COLOR : okColor}`,
          borderRadius: 2,
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          px: 1.5,
          py: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: axisColor }}>
          {formatFull(label)}
        </Typography>
        <Typography variant="h5" fontWeight="bold" sx={{ color: out ? ALERT_COLOR : okColor }}>
          {value}°C
        </Typography>
        {out && (
          <Typography variant="caption" sx={{ color: ALERT_COLOR }}>
            Fora da faixa
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={transformedData} margin={{ top: 20, right: 24, bottom: 8, left: 0 }}>
        <defs>
          {/* Soft fade under the line */}
          <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={okColor} stopOpacity={0.35} />
            <stop offset="100%" stopColor={okColor} stopOpacity={0} />
          </linearGradient>

          {/* Line color: blue inside the range, coral above max / below min */}
          <linearGradient id="temperatureStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset={0} stopColor={ALERT_COLOR} />
            <stop offset={offMax} stopColor={ALERT_COLOR} />
            <stop offset={offMax} stopColor={okColor} />
            <stop offset={offMin} stopColor={okColor} />
            <stop offset={offMin} stopColor={ALERT_COLOR} />
            <stop offset={1} stopColor={ALERT_COLOR} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grey[700]} opacity={0.5} />

        <XAxis
          dataKey="time"
          type="number"
          domain={["dataMin", "dataMax"]}
          scale="time"
          tickFormatter={formatTick}
          tick={{ fill: axisColor, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          minTickGap={48}
          tickMargin={8}
        />

        <YAxis
          domain={yDomain}
          tickFormatter={(v) => `${v}°`}
          tick={{ fill: axisColor, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={44}
        />

        {/* Ideal range band */}
        {hasMin && hasMax && <ReferenceArea y1={min} y2={max} fill={okColor} fillOpacity={0.08} />}

        {/* Limit lines */}
        {hasMax && (
          <ReferenceLine
            y={max}
            stroke={ALERT_COLOR}
            strokeDasharray="6 4"
            strokeOpacity={0.8}
            label={{ value: `Máx ${max}°`, position: "insideTopRight", fill: ALERT_COLOR, fontSize: 11 }}
          />
        )}
        {hasMin && (
          <ReferenceLine
            y={min}
            stroke={ALERT_COLOR}
            strokeDasharray="6 4"
            strokeOpacity={0.8}
            label={{ value: `Mín ${min}°`, position: "insideBottomRight", fill: ALERT_COLOR, fontSize: 11 }}
          />
        )}

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.grey[500], strokeDasharray: "4 4" }} />

        <Area
          type="monotone"
          dataKey="Temperatura"
          stroke={lineStroke}
          strokeWidth={2.5}
          fill="url(#temperatureGradient)"
          dot={false}
          activeDot={({ cx, cy, payload }) => (
            <circle
              cx={cx}
              cy={cy}
              r={5}
              fill={isOut(payload.Temperatura) ? ALERT_COLOR : okColor}
              stroke={colors.primary[400]}
              strokeWidth={2}
            />
          )}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default Chart;