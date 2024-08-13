import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import ProgressCircle from "./ProgressCircle";

const StatBox = ({ titleColor, title, subtitle, icon, progress, increase, progressColor, subtitleColor }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box width="100%" m="0 30px">
      <Box display="flex" justifyContent="space-between">
        <Box>
          {icon}
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: titleColor }}
            
          >
            {title}
          </Typography>
        </Box>
        <Box>
          <ProgressCircle progress={progress} progressColor={progressColor} />
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="2px">
        <Typography variant="h5" sx={{ color: subtitleColor }}> {/* Use subtitleColor */}
          {subtitle}
        </Typography>
        <Typography
          variant="h5"
          fontStyle="italic"
          sx={{ color: progressColor }} // Change text color based on microbial load
        >
          {increase}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatBox;
