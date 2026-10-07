import { Box, Typography, alpha, useTheme } from "@mui/material";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { tokens } from "../../theme";

const PiePlot = ({ data, title, height = 200 }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const okColor = colors.blueAccent[500];

  // Same order as before: 1st slice coral, 2nd blue, 3rd a lighter blue
  const palette = [colors.alert, okColor, alpha(okColor, 0.45), colors.grey[400]];

  const items = data ?? [];
  const total = items.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
  const isEmpty = total === 0;
  const percentOf = (v) => (total > 0 ? Math.round((v / total) * 100) : 0);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    const color = payload[0].payload.fill;
    return (
      <Box
        sx={{
          backgroundColor: colors.primary[400],
          border: `1px solid ${colors.grey[700]}`,
          borderLeft: `4px solid ${color}`,
          borderRadius: 2,
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          px: 1.5,
          py: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          {name}
        </Typography>
        <Typography variant="h5" fontWeight="bold" sx={{ color }}>
          {percentOf(value)}%
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
        <>
          <ResponsiveContainer width="100%" height={height - 30}>
            <PieChart>
              <Pie
                data={items}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={items.length > 1 ? 2 : 0}
                stroke="none"
                isAnimationActive={false}
              >
                {items.map((_, idx) => (
                  <Cell key={idx} fill={palette[idx % palette.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 1.5,
              mt: 1,
            }}
          >
            {items.map((item, idx) => (
              <Box key={item.name ?? idx} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: palette[idx % palette.length],
                  }}
                />
                <Typography variant="caption">
                  {item.name} · {percentOf(item.value)}%
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default PiePlot;