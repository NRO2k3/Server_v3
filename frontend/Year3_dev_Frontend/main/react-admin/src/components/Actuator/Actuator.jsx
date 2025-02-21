import SetTimer from "./SetTimer";
import Control from "./GaugeChart/Control";
import ActuatorStatus from "./ActuatorStatus";
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useState, useEffect } from "react";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { host } from "../../App";
import SetTemperature from "./SetTemperature";

export default function Actuator({room_id, callbackSetSignIn})
{


    /*
     *
    actuatorInfoOfRoom has this form
    {"sensor":[{"id":1,"node_id":1,"x_axis":2,"y_axis":17,"function":"sensor","mac":"BNM:OURT:AR","status":"sync","time":1,"room_id":1},
            {"id":2,"node_id":2,"x_axis":13,"y_axis":6,"function":"sensor","mac":"BNM:OURT:TYY","status":"sync","time":1,"room_id":1}
        ],
        "actuator":[]} 

        => just the value of key "actuator"
     */
    
    const [actuatorStatus, setActuatorStatus] = useState(null);
    const [actuatorInfoOfRoom, setActuatorInfoOfRoom] = useState(null);
    const theme = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    
    const url = `http://${host}/api/room/information_tag?room_id=${room_id}`;

    const get_information_data = async (url, access_token) => 
    {
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
        if(response.status === 200)
        {
            let newActuatorNodeData = data["node_info"]["actuator"];
            let newActuatorStatus = {};
            newActuatorNodeData.forEach(element => {
                newActuatorStatus[element["node_id"]] = 0;
            });
            setActuatorInfoOfRoom(newActuatorNodeData);
            setActuatorStatus(newActuatorStatus);
        }
        else
        {
            console.log("Some error happened, try to reload page!");
        }
        setIsLoading(false);
    }

    const verify_and_get_data = async (fetch_data_function, callbackSetSignIn, backend_host) => 
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

    useEffect(() => {
        verify_and_get_data(get_information_data, callbackSetSignIn, host, url); 
    },[]);

    return (
        <>
        {
        isLoading ?
        <h1>Loading ...</h1>
        :
            <>
            {
                actuatorInfoOfRoom.length !== 0 ?
                <>
                    {
                        actuatorInfoOfRoom.map(e=>{
                            return(
                                <Grid
                                container
                                alignItems="stretch"
                                style={{
                                        display: "flex", 
                                        height: "100%", 
                                        // backgroundColor: "red"
                                    }}
                                justify="space-between" 
                            >
                                <Grid
                                    xs={12}
                                    sm={12}
                                    md={12}
                                    lg={12}
                                    container="true"
                                    display="flex"
                                    direction="column"
                                >
                                    <Box 
                                        sx={{boxShadow: 0,
                                            borderRadius: '5px', 
                                            backgroundColor: theme.palette.background.paper}}
                                        width="100%"
                                        height="100%"
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <h1>Actuator node id: {e["node_id"]}</h1>
                                    </Box>
                                </Grid>

                                <Grid
                                    p="10px"
                                    xs={12}
                                    sm={12}
                                    md={12}
                                    lg={4}
                                    container="true"
                                    display="flex"
                                    direction="column"
                                >
                                    <Box 
                                        sx={{boxShadow: 0,
                                            borderRadius: '5px', 
                                            backgroundColor: theme.palette.background.paper}}
                                        width="100%"
                                        height="100%"
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Box mt="10px" mb="15px">
                                            <SetTimer actuatorStatus={actuatorStatus}
                                                    room_id={room_id}
                                                    callbackSetSignIn={callbackSetSignIn}
                                                    node_id={e["node_id"]}
                                                    />
                                        </Box>
                                    </Box>
                                    
                                </Grid>
                                <Grid
                                        p="10px"
                                        item={true}
                                        xs={12}
                                        sm={12}
                                        lg={4}
                                        display="flex"
                                        direction="column"
                                        alignItems="center"
                                        justify="center"
                                        
                                    >
                                        <Box 
                                            sx={{boxShadow: 0,
                                                borderRadius: '5px', 
                                                backgroundColor: theme.palette.background.paper}}
                                            width="100%"
                                            height="100%"
                                            display="flex"
                                            flexDirection="column"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <Box mt="10px" mb="10px">
                                                {/* <Header title="Set temperature:" fontSize="20px"/> */}
                                                {/* <Control room_id={room_id} callbackSetSignIn={callbackSetSignIn} actuatorStatus={actuatorStatus}/> */}
                                                <SetTemperature actuatorStatus={actuatorStatus} node_id={e["node_id"]} callbackSetSignIn={callbackSetSignIn} room_id={room_id}/>
                                            </Box>
                                        </Box>
                                </Grid>
                                <Grid
                                    p="10px"
                                    xs={12}
                                    sm={12}
                                    md={12}
                                    lg={4}
                                    container="true"
                                    display="flex"
                                    direction="column"
                                >
                                    <Box
                                        sx={{boxShadow: 0,
                                            borderRadius: '5px', 
                                            backgroundColor: theme.palette.background.paper}}
                                        width="100%"
                                        height="100%"
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Box mt="10px" mb="15px"
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="center"
                                        justify="center">

                                            <Header title="Actuator Status:" fontSize="20px"/>
                                            <ActuatorStatus room_id={room_id} setActuatorStatus={setActuatorStatus} callbackSetSignIn={callbackSetSignIn}
                                                node_id={e["node_id"]}
                                                actuatorStatus={actuatorStatus}    
                                            />
                                        </Box>
                                    </Box>

                                </Grid>
                            </Grid>
                            )
                        })
                    }
                </>
                
                :
                <Grid
                    container
                    alignItems="stretch"
                    style={{
                            display: "flex", 
                            height: "100%", 
                            // backgroundColor: "red"
                        }}
                    justify="space-between" 
                >
                    <Grid
                        p="10px"
                        xs={12}
                        sm={12}
                        md={12}
                        lg={12}
                        container="true"
                        display="flex"
                        direction="column"
                    >
                        <Box 
                            sx={{boxShadow: 1,
                                borderRadius: '5px', 
                                backgroundColor: "white"}}
                            width="100%"
                            height="100%"
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <h1>No actuator is available!</h1>
                        </Box>
                    </Grid>
                </Grid>
            }
            </>
        }
        </>
    )
}