import { Card, CardContent, Typography, useTheme } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { tokens } from "../../theme";

const AlarmBar = ({ data, title, barColor, height = 150, dataKey = "alarms" }) => { 
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Card elevation={5} sx={{ backgroundColor: colors.primary[400]}}>
      <CardContent>
        <Typography variant="h5" gutterBottom align="center"
          sx={{
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 600,
            mt: -1,
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 0, right: 10, left: -42, bottom: -12 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={{ stroke: "#000", strokeWidth: 2 }}
              axisLine={{ stroke: "#000", strokeWidth: 2 }}
              tick={{ fill: "#000", fontWeight: "bold" }}
            />
            <YAxis
              tickLine={{ stroke: "#000", strokeWidth: 2 }}
              axisLine={{ stroke: "#000", strokeWidth: 2 }}
              tick={{ fill: "#000", fontWeight: "bold" }}
            />
            <Tooltip
              content={({ payload, label }) => {
                if (!payload || payload.length === 0) return null;

                const barData = payload[0]; // Assume a única barra é o primeiro item
                const value = barData.value;

                return (
                  <div
                    style={{
                      backgroundColor: colors.primary[500],
                      color: "white",
                      border: "1px solid white",
                      padding: "5px 8px",
                      borderRadius: "5px",
                      lineHeight: "1.2",
                      minWidth: "100px",
                    }}
                  >
                    <p style={{ margin: 2 }}>{`Dia: ${label}`}</p>
                    <p style={{ margin: 0 }}>{`${title}: ${value}`}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey={dataKey} fill={barColor} radius={[5, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
  
export default AlarmBar;