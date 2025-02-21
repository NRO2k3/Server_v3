import React from "react";
import GaugeChart from "react-gauge-chart";
import { useState } from "react";
import { memo } from "react";
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import Header from "../../Header";
import { json } from "react-router-dom";
import { Slider } from '@mui/material';
import { host } from "../../../App";

const Control = ({room_id, callbackSetSignIn, actuatorStatus}) =>
{
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [speed, setSpeed] = useState(0);

    const Increase = () => {
        setSpeed(speed < 100 ? (speed + 1) : 100);
    };

    const Decrease = () => {
        setSpeed(speed > 0 ? (speed - 1) : 0);
    };

    const handleChange = (event, newValue) =>
    {
        setSpeed(newValue)
    }

    const url = `http://${host}/api/v1.1/control/fans`;

    const fetch_data_function = async (api, access_token) =>
    {


        const speed_monitor_data = {
            "option": "manual",
            "speed": speed,
            "room_id": room_id,
        }

        const headers = 
        {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token}`,
        }
        const option_fetch = 
        {
            "method": "POST",
            "headers": headers,
            "body": JSON.stringify(speed_monitor_data),
        }
        const response = await fetch(api, option_fetch);
        if(response.status === 200)
        {
            const new_data = await response.json();
            alert(new_data['Result']);
        }
        else
        {
            const new_data = await response.json();
            alert(`${new_data['Result']} Error: ${response.status} ${response.statusText}`);
        }
    }

    const verify_and_get_data = async (fetch_data_function, callbackSetSignIn, backend_host, url) => 
    {

        const token = {access_token: null, refresh_token: null}
        // const backend_host = host;
        if(localStorage.getItem("access") !== null && localStorage.getItem("refresh") !== null)
        {
            token.access_token = localStorage.getItem("access"); 
            token.refresh_token = localStorage.getItem("refresh");
        }
        else
        {
            throw new Error("There is no access token and refresh token ....");
        }

        const verifyAccessToken  = async () =>
        {
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
            if(verify_access_token_API_response.status !== 200)
            {
                return false;
            }
            return true;
        }

        /*
        *brief: this function is to verify the refresh-token and refresh the access-token if the refresh-token is still valid
        */
        const verifyRefreshToken  = async () =>
        {
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
            if(verify_refresh_token_API_response.status !== 200)
            {
                return false;
            }
            else if(verify_refresh_token_API_response.status === 200 &&  verify_refresh_token_API_response_data.hasOwnProperty("access"))
            {
                localStorage.setItem("access", verify_refresh_token_API_response_data["access"]);
                localStorage.setItem("refresh", verify_refresh_token_API_response_data["refresh"]);
                return true
            }
            else
            {
                throw new Error("Can not get new access token ....");
            }
        }

        const  verifyAccessToken_response = await verifyAccessToken();

        if(verifyAccessToken_response === true)
        {
            // const response = await fetch(url)
            // const data = await response.json()
            fetch_data_function(url, token["access_token"])
        }
        else
        {
            let verifyRefreshToken_response = null;
            try
            {
                verifyRefreshToken_response = await verifyRefreshToken();
            }
            catch(err)
            {
                alert(err);
            }
            if(verifyRefreshToken_response === true)
            {
                fetch_data_function(url, token["access_token"]);
            }
            else
            {
                callbackSetSignIn(false);
            }
        }

    }

    return (
        <Box 
            // container
            // display="flex"
            // direction="row"
            // justifyContent="center"
            width="250px"
        > 
            
                <GaugeChart id="gauge control" 
                            nrOfLevels={20} 
                            percent={speed/100} 
                            colors={['#5BE12C', '#F5CD19', '#EA4228']} 
                            textColor={"#888888"}
                            formatTextValue={value => value + "%"}
                            // width="400%"
                />
                {/* Slider */}
                <Box 
                    // sx={{ width: 200 }}
                    // paddingLeft="100px"
                    display="flex" 
                    justifyContent="center" 
                    alignItems="center"
                    >
                    <Slider
                        size="lager"
                        aria-label="Volume" value={speed} onChange={handleChange}
                        sx={{
                            width: 200,
                            color: "#050505",
                          }} 
                    />
                </Box>

                <Box
                    display="flex" 
                    justifyContent="center" 
                    alignItems="center"
                    // height="50%"
                    gap="5px">
                    {/* <Button
                        sx={{
                        backgroundColor: colors.blueAccent[400],
                        color: colors.grey[100],
                        fontSize: "14px",
                        fontWeight: "bold",
                        }}
                        onClick={Increase}
                    >
                                +
                    </Button> */}
                    {
                    actuatorStatus !== 0 ? 
                    <Button
                        sx={{
                            backgroundColor: "black",
                            fontSize: "14px",
                            fontWeight: "bold",
                            padding: "8px 18px",
                            }}
                        variant="contained"
                        onClick={
                            ()=>{verify_and_get_data(fetch_data_function, callbackSetSignIn, host, url);}
                        }
                    >
                        {/* <DownloadOutlinedIcon sx={{ mr: "10px" }} /> */}
                        Submit
                    </Button>
                    :
                    <></>
                    }
                    

                    {/* <Button
                        sx={{
                        backgroundColor: colors.blueAccent[400],
                        color: colors.grey[100],
                        fontSize: "14px",
                        fontWeight: "bold",
                        }}
                        onClick={Decrease}
                    >
                                -
                    </Button> */}
                    
                </Box>

                <Box display="flex" justifyContent="center" alignItems="center">
                    
                {/* <button className="col" onClick={
                                                async(e) => {
                                                    const url_sending_set_point = `http://127.0.0.1:8000/api/set/${speed}`;
                                                    const response = await fetch(url_sending_set_point,{
                                                    'method':'GET',
                                                    headers: {
                                                        'Content-Type':'application/json',
                                                        }
                                                    });
                                                    const new_data = await response.json();
                                                    alert(new_data['data']);
                                                }
                                                }> 
                        SEND 
                    </button> */}
                </Box>
            </Box>
    );
}

export default React.memo(Control);
