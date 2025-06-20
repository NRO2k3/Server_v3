import { React, useEffect, useState } from "react";

import { Grid, Paper, Tooltip, Typography, useTheme } from "@mui/material";
import ThermostatIcon from '@mui/icons-material/Thermostat';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import SpeedIcon from '@mui/icons-material/Speed';
import Divider from '@mui/material/Divider';
import { host } from "../../App";
import verify_and_get_data from "../../function/fetchData";
import { useTranslation } from "react-i18next";
import  "../../utils/i18n";

export default function AqiRef({ callbackSetSignIn, time_delay }) {
    const url = `http://${host}/api/aqi_ref`;
    const theme = useTheme();
    const {t} = useTranslation()
    const [isLoading, setIsLoading] = useState(true);

    const [data, setData] = useState(null);

    const rating_index = {
        1: { level: "good", colour: "green" },
        2: { level: "moderate", colour: "yellow" },
        3: { level: "poor", colour: "orange" },
        4: { level: "unhealthy", colour: "red" },
        5: { level: "veryUnhealthy", colour: "purple" },
        6: { level: "hazardous", colour: "maroon" },
    };

    const rating_array = [
        { "key": 1, "min": 0, "max": 50 },
        { "key": 2, "min": 51, "max": 100 },
        { "key": 3, "min": 101, "max": 150 },
        { "key": 4, "min": 151, "max": 200 },
        { "key": 5, "min": 201, "max": 300 },
        { "key": 6, "min": 301, "max": 500 },
    ];

    const fetch_data_function = async (api, access_token) => {

        const headers =
        {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token}`,
        }
        const option_fetch =
        {
            "method": "GET",
            "headers": headers,
            "body": null,
        }
        const response = await fetch(api, option_fetch);
        if (response.status == 200) {
            const data = await response.json();
            const new_data = data["Response"]
            let index = 0;
            for (let i = 0; i < rating_array.length; ++i) {
                if (rating_array[i]["min"] <= new_data["aqi"] && new_data["aqi"] <= rating_array[i]["max"]) {
                    index = rating_array[i]["key"];
                    break;
                }
            }
            if (rating_index.hasOwnProperty(index)) {
                new_data["rating"] =
                {
                    "color": rating_index[index]["colour"],
                    "rate": rating_index[index]["level"],
                }
            }
            else {
                new_data["rating"] =
                {
                    "color": "white",
                    "rate": "No data",
                }
            }
            setData(new_data);
        }
        else {
            let new_data;
            new_data["rating"] =
            {
                "color": "white",
                "rate": "No data",
            }
            setData(new_data);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        if (data === null)            //!< this is for the total component always render the first time and then the next time will be setTimeOut
        {
            verify_and_get_data(fetch_data_function, callbackSetSignIn, host, url);
        }
        else {
            const timer = setTimeout(() => {
                verify_and_get_data(fetch_data_function, callbackSetSignIn, host, url);
            }, time_delay);
            return () => clearTimeout(timer);
        }
    }, [data])
    return (
        <>
            {   isLoading ?
                    <h1>Loading...</h1>
                :
                <Grid container item textAlign='center'>
                    <Grid xs={12} sm={12} md={12} textAlign="center">
                        <Typography fontSize='24px' fontWeight="bold">
                            {t("hanoiaqi")}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} >
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}`, m:2, borderRadius: "15px" }}>
                            <Grid container spacing={2} marginY={0.5} px='10px'>
                                <Grid item xs={5.5} container display="flex" flexDirection="column" justifyItems='center' textAlign='center'>
                                    <Grid container item justifyContent='center' alignContent='center'>
                                        <Tooltip style={{
                                            fontSize: theme.typography.pxToRem(24),
                                            backgroundColor: theme.palette.common.white,
                                            border: '1px solid #eeeeee',
                                            maxWidth: 220,
                                        }}
                                            title={
                                                <Grid>
                                                    <Typography color="inherit">{`PM2.5: ${data['pm25']}`}</Typography>
                                                    <Typography color="inherit">{`PM10: ${data['pm10']}`}</Typography>
                                                    <Typography color="inherit">{`O3: ${data['o3']}`}</Typography>
                                                    <Typography color="inherit">{`NO2: ${data['no2']}`}</Typography>
                                                    <Typography color="inherit">{`SO2: ${data['so2']}`}</Typography>
                                                    <Typography color="inherit">{`CO: ${data['co']}`}</Typography>
                                                </Grid>
                                            }
                                        >
                                            <div style={{
                                                width: '100px', // Adjust as needed
                                                height: '100px', // Adjust as needed
                                                border: '10px solid', // Border makes the circle hollow
                                                borderColor: `${data['rating']['color']}`,
                                                borderRadius: '50%', // Makes the div a circle
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                                position: 'relative',
                                                marginTop: "16px"
                                            }}>
                                                <span style={{
                                                    position: 'relative',
                                                    color: theme.palette.text.primary,
                                                    fontSize: '28px',
                                                    fontWeight: 'bold',
                                                }}>
                                                    {data['aqi']}
                                                </span>
                                            </div>
                                        </Tooltip>
                                    </Grid>
                                    <Grid item marginY={0.5} />
                                    <Grid item>
                                        <Typography fontWeight='bold' variant='h3'>{t(data['rating']['rate'])}</Typography>
                                    </Grid>
                                </Grid>
                                <Divider
                                    orientation="vertical"
                                    flexItem
                                    sx={{
                                    borderColor: theme.palette.grey[600],
                                    }}
                                />
                                <Grid item xs={5.5}>
                                    <Typography
                                        variant="h5"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        gap="5px"
                                    >
                                        <ThermostatIcon sx={{ fontSize: '3rem', color: theme.palette.primary.main }} />
                                        <span style={{ flexGrow: 1 }}> {t("temperature")}: {data['t'] === 'No data' ? 'No data' : `${data['t']} °C`}</span>
                                    </Typography>
                                    
                                    <Typography
                                        variant="h5"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        gap="5px"
                                    >
                                        <InvertColorsIcon sx={{ fontSize: '3rem', color: theme.palette.primary.main }} /> 
                                        <span style={{ flexGrow: 1 }}> {t("hudminity")}: {data['h'] === 'No data' ? 'No data' : `${data['h']} %`}</span>
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        gap="10px"
                                    >
                                        <SpeedIcon sx={{ fontSize: '3rem', color: theme.palette.primary.main }} /> 
                                        <span style={{ flexGrow: 1 }}>{t("pressure")}: {data['p'] === 'No data' ? 'No data' : `${data['p']} hPa`}</span>
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        gap="10px"
                                    >
                                        <FilterDramaIcon sx={{ fontSize: '3rem', color: theme.palette.primary.main }} /> 
                                        <span style={{ flexGrow: 1 }}>{t("wind")}: {data['w'] === 'No data' ? 'No data' : `${data['w']} m/s`}</span>
                                    </Typography>
                                </Grid>
                            </Grid>
                            </Paper>
                        </div>
                    </Grid>
                    <Grid xs={12} textAlign='center' margin={1}>
                        <Typography textAlign='center' variant='h5' component='span'>updated on {
                            (() => {
                                const new_time = data["time"] - 7 * 60 * 60;
                                const utcDate = new Date(new_time * 1000); // Convert seconds to milliseconds
                                const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
                                const formattedDateTime = utcDate.toLocaleDateString('en-US', options);

                                return formattedDateTime;
                            })()   //run this function
                        } from { }
                        </Typography>
                        <Typography variant='h5' component='a' color='darkgray' href="https://aqicn.org/city/vietnam/hanoi/">https://aqicn.org/city/vietnam/hanoi/</Typography>
                    </Grid>
                </Grid>
        }
    </>
    );
}