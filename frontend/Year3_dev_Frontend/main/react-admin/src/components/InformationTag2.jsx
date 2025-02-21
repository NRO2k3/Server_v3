import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Paper,
    Stack,
    SvgIcon,
    Typography,
    useTheme, Tooltip
} from '@mui/material';
import { tokens } from "../theme";
import Header from "./Header";
import { host } from "../App"
import { React, useEffect, useState } from "react";
import temp_icon from "../assets/temperature.svg";
import hum_icon from "../assets/humidity.svg";
import co2_icon from "../assets/co2.svg";
import tvoc_icon from "../assets/tvoc.svg";
import dust_icon from "../assets/dust.svg";
import sound_icon from "../assets/sound.svg";
import light_icon from "../assets/light.svg";
import motion_icon from "../assets/motion.svg";
import ThermostatIcon from '@mui/icons-material/Thermostat';
import Co2Icon from '@mui/icons-material/Co2';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import LightModeIcon from '@mui/icons-material/LightMode';
import BoyIcon from '@mui/icons-material/Boy';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import LensBlurIcon from '@mui/icons-material/LensBlur';
import AQI from './AQI';
import { Boy, VolumeMute } from '@mui/icons-material';

const InformationTag = ({ url, callbackSetSignIn, time_delay, room_id, setActuatorInfoOfRoom }) => {
    const backend_host = host;
    const api_informationtag = url;
    const theme = useTheme();

    const [isLoading, setIsLoading] = useState(true);
    const [infoData, getInfoData] = useState(null);
    const [nodeData, getNodeData] = useState(null);
    const [aqiInfo, setAQIInfo] = useState([]);

    const iconMap = {
        temp: (
            <img height="70px" width="70px" src={temp_icon} />
        ),
        hum: (
            <img height="70px" width="70px" src={hum_icon} />
        ),
        co2: (
            <img height="70px" width="70px" src={co2_icon} />
        ),
        tvoc: (
            <img height="70px" width="70px" src={tvoc_icon} />
        ),
        dust: (
            <img height="70px" width="70px" src={dust_icon} />
        ),
        light: (
            <img height="70px" width="70px" src={light_icon} />
        ),
        sound: (
            <img height="70px" width="70px" src={sound_icon} />
        ),
        motion: (
            <img height="70px" width="70px" src={motion_icon} />
        ),
    };
    const dict_of_enviroment_para_names =
    {
        "temp": { "name": " Temparature", "icon": iconMap["temp"], "unit": "°C" },
        "hum": { "name": "Humidity", "icon": iconMap["hum"], "unit": "%" },
        "co2": { "name": "Co2", "icon": iconMap["co2"], "unit": "ppm" },
        "tvoc": { "name": "TVOC", "icon": iconMap["tvoc"], "unit": "µg/m3" },
        "dust": { "name": "Dust", "icon": iconMap["dust"], "unit": "µm" },
        "sound": { "name": "Sound", "icon": iconMap["sound"], "unit": "dB" },
        "light": { "name": "Light", "icon": iconMap["light"], "unit": "lux" },
        "motion": { "name": "Motion Detection", "icon": iconMap["motion"], "unit": "" },
    };

    const get_information_data = async (url, access_token) => {
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
        const response = await fetch(url, option_fetch)
        const data = await response.json()
        
        if (data) {
            // if(response.status === 200)
            // {
            //     getCo2(data.co2)
            //     getHum(data.hum)
            //     getTemp(data.temp)
            //     getTime(data.time)
            // }
            let newInfoData = {
                "temp": null,
                "hum": null,
                "co2": null,
                "tvoc": null,
                "dust": null,
                "sound": null,
                "light": null,
                "motion": null,
            }

            const array_of_keys_in_dict_of_enviroment_para_names = Object.keys(dict_of_enviroment_para_names);
            array_of_keys_in_dict_of_enviroment_para_names.forEach((each_key) => {
                if (data.hasOwnProperty(each_key) && each_key === "motion")
                // if (data.hasOwnProperty(each_key) && data[each_key][data[each_key].length-1] !== 0) 
                {
                    if (data[each_key][data[each_key].length - 1] > 0) {
                        const motion_data = (data[each_key][data[each_key].length - 1] == 1 ? "Yes" : "No");    //!< data[each_key][data[each_key].length-1] (last element of array)
                        newInfoData[each_key] = {
                            "title": dict_of_enviroment_para_names[each_key]["name"],
                            "icon": dict_of_enviroment_para_names[each_key]["icon"],
                            "value": motion_data,
                            "unit": dict_of_enviroment_para_names[each_key]["unit"],
                        };
                    }
                    else {
                        newInfoData[each_key] = {
                            "title": dict_of_enviroment_para_names[each_key]["name"],
                            "icon": dict_of_enviroment_para_names[each_key]["icon"],
                            "value": "No data",    //last element of array data
                            "unit": "",
                        };
                    }
                }
                else if (data.hasOwnProperty(each_key) && each_key !== "motion")
                // if (data.hasOwnProperty(each_key) && data[each_key][data[each_key].length-1] !== 0) 
                {
                    if (data[each_key][data[each_key].length - 1] > -1) {

                        newInfoData[each_key] = {
                            "title": dict_of_enviroment_para_names[each_key]["name"],
                            "icon": dict_of_enviroment_para_names[each_key]["icon"],
                            "value": data[each_key][data[each_key].length - 1],    //last element of array data
                            "unit": dict_of_enviroment_para_names[each_key]["unit"],
                        };
                    }
                    else {
                        newInfoData[each_key] = {
                            "title": dict_of_enviroment_para_names[each_key]["name"],
                            "icon": dict_of_enviroment_para_names[each_key]["icon"],
                            "value": "No data",    //last element of array data
                            "unit": "",
                        };
                    }
                }
            });

            newInfoData["time"] = parseInt(data["time"]);
            getInfoData(newInfoData);
            let newNodeData = {};
            newNodeData["sensor"] = data["node_info"]["sensor"];
            newNodeData["actuator"] = data["node_info"]["actuator"];
            setActuatorInfoOfRoom(newNodeData["actuator"]);
            getNodeData(newNodeData);
            setIsLoading(false);
        }
        else {
            console.log("Some error happened, try to reload page!");
        }
    }

    const verify_and_get_data = async (fetch_data_function, callbackSetSignIn, backend_host) => {
        const token = { access_token: null, refresh_token: null }
        // const backend_host = host;
        if (localStorage.getItem("access") !== null && localStorage.getItem("refresh") !== null) {
            token.access_token = localStorage.getItem("access");
            token.refresh_token = localStorage.getItem("refresh");
        }
        else {
            throw new Error("There is no access token and refresh token ....");
        }

        const verifyAccessToken = async () => {
            //call the API to verify access-token
            const verify_access_token_API_endpoint = `http://${backend_host}/api/token/verify`
            const verify_access_token_API_data =
            {
                "token": token.access_token,
            }
            const verify_access_token_API_option =
            {
                "method": "POST",
                "headers":
                {
                    "Content-Type": "application/json",
                },
                "body": JSON.stringify(verify_access_token_API_data),

            }
            const verify_access_token_API_response = await fetch(verify_access_token_API_endpoint,
                verify_access_token_API_option,);
            console.log(verify_access_token_API_response);
            if (verify_access_token_API_response.status !== 200) {
                return false;
            }
            return true;
        }

        /*
        *brief: this function is to verify the refresh-token and refresh the access-token if the refresh-token is still valid
        */
        const verifyRefreshToken = async () => {
            //call the API to verify access-token
            const verify_refresh_token_API_endpoint = `http://${backend_host}/api/token/refresh`
            const verify_refresh_token_API_data =
            {
                "refresh": token.refresh_token,
            }
            const verify_refresh_token_API_option =
            {
                "method": "POST",
                "headers":
                {
                    "Content-Type": "application/json",
                },
                "body": JSON.stringify(verify_refresh_token_API_data),

            }
            const verify_refresh_token_API_response = await fetch(verify_refresh_token_API_endpoint,
                verify_refresh_token_API_option,);
            const verify_refresh_token_API_response_data = await verify_refresh_token_API_response.json();
            if (verify_refresh_token_API_response.status !== 200) {
                return false;
            }
            else if (verify_refresh_token_API_response.status === 200 && verify_refresh_token_API_response_data.hasOwnProperty("access")) {
                localStorage.setItem("access", verify_refresh_token_API_response_data["access"]);
                localStorage.setItem("refresh", verify_refresh_token_API_response_data["refresh"]);
                return true
            }
            else {
                throw new Error("Can not get new access token ....");
            }
        }

        const verifyAccessToken_response = await verifyAccessToken();

        if (verifyAccessToken_response === true) {
            // const response = await fetch(url)
            // const data = await response.json()
            fetch_data_function(url, token["access_token"])
        }
        else {
            let verifyRefreshToken_response = null;
            try {
                verifyRefreshToken_response = await verifyRefreshToken();
            }
            catch (err) {
                alert(err);
            }
            if (verifyRefreshToken_response === true) {
                fetch_data_function(url, token["access_token"]);
            }
            else {
                callbackSetSignIn(false);
            }
        }
    }

    useEffect(() => {
        if (time_delay !== 0) {
            if (infoData === null)            //!< this is for the total component always render the first time and then the next time will be setTimeOut
            {
                verify_and_get_data(get_information_data, callbackSetSignIn, backend_host, api_informationtag);
            }
            else {
                const timer = setTimeout(() => {
                    verify_and_get_data(get_information_data, callbackSetSignIn, backend_host, api_informationtag);
                }, time_delay);
                return () => clearTimeout(timer);
            }
        }
        else {
            verify_and_get_data(get_information_data, callbackSetSignIn, backend_host, api_informationtag);
        }
    }, [infoData, nodeData]);

    return (
        <>
            {
                isLoading ?
                    <h1>Loading...</h1>
                    :
                    <Grid container textAlign='center'>
                        <Grid xs={12} sm={12} md={12} textAlign="center" columnSpacing={2}>
                            <Typography fontWeight="bold" fontSize='21px'>
                                Room info
                            </Typography>
                        </Grid>
                        <Grid container spacing={1} marginY={0.5} marginX={1}>
                            <Grid item xs={4}>
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}` }}>
                                        <AQI room_id={room_id} callbackSetSignIn={callbackSetSignIn} />
                                    </Paper>
                                </div>
                            </Grid>
                            <Grid item xs={4}>
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}` }}>
                                        <Grid container display="flex" flexDirection="column" alignContent='center' alignItems='center' textAlign='center'>
                                            <Grid item>
                                                <ThermostatIcon style={{ fontSize: '5.1rem' }} />
                                            </Grid>
                                            <Grid item>
                                                <Typography textAlign='center' variant='h5'>Temperature</Typography>
                                                <Typography textAlign='center' fontWeight='bold' variant='h3'>
                                                    {((temp) => {
                                                        if (infoData["temp"]["value"] == 'No data') temp = infoData["temp"]["value"];
                                                        else temp = `${infoData["temp"]["value"]} ${dict_of_enviroment_para_names['temp']['unit']}`
                                                        return temp;
                                                    })()}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </div>
                            </Grid>
                            <Grid item xs={4}>
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}` }}>
                                        <Grid container display="flex" flexDirection="column" alignContent='center' textAlign='center'>
                                            <Grid item>
                                                <Co2Icon style={{ fontSize: '5.1rem' }} />
                                            </Grid>
                                            <Grid item>
                                                <Typography textAlign='center' variant='h5'>CO2</Typography>
                                                <Typography textAlign='center' fontWeight='bold' variant='h3'>{((temp) => {
                                                    if (infoData["co2"]["value"] == 'No data') temp = infoData["co2"]["value"];
                                                    else temp = `${infoData["co2"]["value"]} ${dict_of_enviroment_para_names['co2']['unit']}`
                                                    return temp;
                                                })()}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </div>
                            </Grid>
                            <Grid item xs={4}>
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}` }}>
                                        <Grid container display="flex" flexDirection="column" alignContent='center' textAlign='center'>
                                            <Grid item>
                                                <InvertColorsIcon style={{ fontSize: '3rem' }} />
                                            </Grid>
                                            <Grid item>
                                                <Typography textAlign='center' variant='h5'>Humidity</Typography>
                                                <Typography textAlign='center' fontWeight='bold' variant='h3'>{((temp) => {
                                                    if (infoData["hum"]["value"] == 'No data') temp = infoData["hum"]["value"];
                                                    else temp = `${infoData["hum"]["value"]} ${dict_of_enviroment_para_names['hum']['unit']}`
                                                    return temp;
                                                })()}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </div>
                            </Grid>
                            <Grid item xs={4}>
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}` }}>
                                        <Grid container display="flex" flexDirection="column" alignContent='center' textAlign='center'>
                                            <Grid item>
                                                <FilterDramaIcon style={{ fontSize: '3rem' }} />
                                            </Grid>
                                            <Grid item>
                                                <Typography textAlign='center' variant='h5'>TVOC</Typography>
                                                <Typography textAlign='center' fontWeight='bold' variant='h3'>{((temp) => {
                                                    if (infoData["tvoc"]["value"] == 'No data') temp = infoData["tvoc"]["value"];
                                                    else temp = `${infoData["tvoc"]["value"]} ${dict_of_enviroment_para_names['tvoc']['unit']}`
                                                    return temp;
                                                })()}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </div>
                            </Grid>
                            <Grid item xs={4}>
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}` }}>
                                        <Grid container display="flex" flexDirection="column" alignContent='center' textAlign='center'>
                                            <Grid item>
                                                <LensBlurIcon style={{ fontSize: '3rem' }} />
                                            </Grid>
                                            <Grid item>
                                                <Typography textAlign='center' variant='h5'>Dust</Typography>
                                                <Typography textAlign='center' fontWeight='bold' variant='h3'>{((temp) => {
                                                    if (infoData["dust"]["value"] == 'No data') temp = infoData["dust"]["value"];
                                                    else temp = `${infoData["dust"]["value"]} ${dict_of_enviroment_para_names['dust']['unit']}`
                                                    return temp;
                                                })()}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </div>
                            </Grid>
                            <Grid item xs={4}>
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}` }}>
                                        <Grid container display="flex" flexDirection="column" alignContent='center' textAlign='center'>
                                            <Grid item>
                                                <LightModeIcon style={{ fontSize: '3rem' }} />
                                            </Grid>
                                            <Grid item>
                                                <Typography textAlign='center' variant='h5'>Light</Typography>
                                                <Typography textAlign='center' fontWeight='bold' variant='h3'>{((temp) => {
                                                    if (infoData["light"]["value"] == 'No data') temp = infoData["light"]["value"];
                                                    else temp = `${infoData["light"]["value"]} ${dict_of_enviroment_para_names['light']['unit']}`
                                                    return temp;
                                                })()}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </div>
                            </Grid>
                            <Grid item xs={4}>
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}` }}>
                                        <Grid container display="flex" flexDirection="column" alignContent='center' textAlign='center'>
                                            <Grid item>
                                                <VolumeUpIcon style={{ fontSize: '3rem' }} />
                                            </Grid>
                                            <Grid item>
                                                <Typography textAlign='center' variant='h5'>Sound</Typography>
                                                <Typography textAlign='center' fontWeight='bold' variant='h3'>{((temp) => {
                                                    if (infoData["sound"]["value"] == 'No data') temp = infoData["sound"]["value"];
                                                    else temp = `${infoData["sound"]["value"]} ${dict_of_enviroment_para_names['sound']['unit']}`
                                                    return temp;
                                                })()}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </div>
                            </Grid>
                            <Grid item xs={4}>
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px' }} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}` }}>
                                        <Grid container display="flex" flexDirection="column" alignContent='center' textAlign='center'>
                                            <Grid item>
                                                <BoyIcon style={{ fontSize: '3rem' }} />
                                            </Grid>
                                            <Grid item>
                                                <Typography textAlign='center' variant='h5'>Motion</Typography>
                                                <Typography textAlign='center' fontWeight='bold' variant='h3'>{infoData["motion"]["value"]}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </div>
                            </Grid>
                        </Grid>
                        <Grid xs={12} textAlign='center' spacing={1} margin={1}>
                            <Typography textAlign='center' variant='h5'>updated on {
                                (() => {
                                    const new_time = infoData["time"];
                                    const utcDate = new Date(new_time * 1000); // Convert seconds to milliseconds
                                    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
                                    const formattedDateTime = utcDate.toLocaleDateString('en-US', options);

                                    return formattedDateTime;
                                })()   //run this function
                            }
                            </Typography>
                        </Grid>
                        {/** save for later */}
                        {/* <Box display="flex" flexDirection="column" justifyContent="center" 
                    alignItems="center"
                    // justify="center"
                    >
                    <span colSpan="2" style={{ textAlign: 'left', fontWeight: 'bold', width: '300px', fontSize: "15px" }} align="center" nowrap="true">
                        {(()=>{
                            let data = "Sensor id: ";
                            nodeData["sensor"].forEach((e)=>{data += e["node_id"]; data+= ", "})
                            return data;
                        })()}
                    </span>
                    <span colSpan="2" style={{ textAlign: 'left', fontWeight: 'bold', width: '300px', fontSize: "15px" }} align="center" nowrap="true">
                        {(()=>{
                            let data = "Actuator id: ";
                            nodeData["actuator"].forEach((e)=>{data += e["node_id"]; data+= ", "})
                            return data;
                        })()}
                    </span>
                    </Box> */}
                    </Grid>
            }
        </>


    );
};

export default InformationTag;
