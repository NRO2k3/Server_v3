import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { LineChartApex } from "../../components/ApexChart/LineChartApex";
import { BarChartApex } from "../../components/ApexChart/BarChartApex";
import { useState } from "react";
import Control  from "../../components/GaugeChart/Control";

const Welcome = ({image}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Box m="20px">
            {/* HEADER */}
            <Box display="flex" justifyContent="center" alignItems="center">
                <Typography
                        variant="h1"
                        fontWeight="800"
                        sx={{ padding: "30px 30px 0 30px" }}
                    >
                        Hello there 
                </Typography>
            </Box>    
        </Box>
    )
}

export default Welcome;