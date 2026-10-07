import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

const Header = ({ title, subtitle, mb = "30px" }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box mb={mb}>
      <Typography
        variant="h2"
        color={colors.grey[100]}
        fontWeight="bold"
        sx={{ m: 0, lineHeight: 1.2 }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="h5" color={colors.greenAccent[400]} sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default Header;