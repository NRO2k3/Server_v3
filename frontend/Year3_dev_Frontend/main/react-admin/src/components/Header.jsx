import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

const Header = ({ title, subtitle, variant = "h2", fontSize, color="black", fontWeight="bold" }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const subtractPixel = (fontSize, value) => 
  {
    const origin_value_fontSize = parseInt(fontSize);
    return `${origin_value_fontSize-value}px`;
  }
  return (
    <Box 
      // mb="10px"
    >
      <Typography
        // variant= {variant}
        fontWeight={fontWeight}
        fontSize={{ xs: subtractPixel(fontSize,10), md: subtractPixel(fontSize,5), lg: fontSize}} // Adjust font size based on screen size
        sx={{ m: "0 0 0 0" }}
      >
        {title}
      </Typography>
      <Typography variant="h5" color={colors.greenAccent[400]}>
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Header;
