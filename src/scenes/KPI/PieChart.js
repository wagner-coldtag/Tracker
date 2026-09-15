import { Card, CardContent, Typography, Box , useTheme} from "@mui/material";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { tokens } from "../../theme";

const COLORS = ["#ef5350", "#42a5f5", "rgba(42,180,234,0.6)"];

const PiePlot = ({ data, title, height = 150 }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Card elevation={5} sx={{ backgroundColor: colors.primary[400] }}>
      <CardContent>
        <Typography variant="h5" gutterBottom align="center"
          sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 600, mt: -1, mb: 1, 
          }}>         
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={75} dataKey="value">
              {data.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const total = data.reduce((acc, item) => acc + item.value, 0);
                  const { name, value } = payload[0];
                  const percent = ((value / total) * 100).toFixed(0);
                  return (
                    <Box sx={{ backgroundColor: "#fff", p: 1, border: "1px solid #ccc" }}>
                      <Typography variant="body2">
                        {name}: {percent}%
                      </Typography>
                    </Box>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PiePlot;