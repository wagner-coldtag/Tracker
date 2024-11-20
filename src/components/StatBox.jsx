import { Box, Typography } from "@mui/material";
import ProgressCircle from "./ProgressCircle";

const StatBox = ({ titleColor, title, subtitle, icon, progress, increase, progressColor, subtitleColor }) => {

  return (
    <Box width="60%" m="0 10px">
      <Box display="flex" justifyContent="space-between">
        <Box>
          {icon}
          <Typography
            variant="h5"
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
        <Typography variant="h6" sx={{ color: subtitleColor }}> {/* Use subtitleColor */}
          {subtitle}
        </Typography>
        <Typography
          variant="h6"
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
