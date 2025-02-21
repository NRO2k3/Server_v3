import * as React from 'react';
import { useState, useContext, useEffect } from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Header from '../../../components/Header';
import { Container,Button } from '@mui/material';
import Paper from '@mui/material/Paper';

import { host } from '../../../App';
import { UserContext } from '../../../App';
import DeleteIcon from '@mui/icons-material/Delete';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import DetailsIcon from '@mui/icons-material/Details';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DialogConfirmDeleteNode from './DialogConfirmDeleteNode';
import NodeChange from './NodeChange';
import DialogConfirmSettingNode from './DialogConfirmSettingNode';

function preventDefault(event) {
  event.preventDefault();
}

export default function ChartConfig({roomIdForChartConfig, setConfig, roomSize}) {
    
    const callbackSetSignIn = useContext(UserContext);
    const api = `http://${host}/api/configuration/node/command?room_id=${roomIdForChartConfig}`
    const [configurationNodeAll, setConfigurationNodeAll] = useState([]);
    const [isLoadingChartConfig, setIsLoadingChartConfig] = useState(true);

    const dict_function = {
        "sensor": "Sensor",
        "air": "Air conditioner",
        "fan": "Fan",
    }

    const getConfigurationNodeAllData = async (url, access_token) => 
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
        const response = await fetch(url, option_fetch);

        const data = await response.json()
        if(data)
        {
            if(response.status === 200)
            {
                setConfigurationNodeAll(data);
                setIsLoadingChartConfig(false);
            }
        }
        else
        {
            alert("Some error happened, try to reload page!");
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

    useEffect(()=>{
        verify_and_get_data(getConfigurationNodeAllData, callbackSetSignIn, host, api);
    },[isLoadingChartConfig])


    return (
        <>
        {

        isLoadingChartConfig === true ?
            <h1>Loading ...</h1>
            :
            <Container>
                <Button
                    startIcon={<ArrowBackIcon />}
                    sx={{
                        backgroundColor: "black",
                        fontSize: "10px",
                        fontWeight: "bold",
                        padding: "5px 12px",
                        }}
                    variant="contained"

                    onClick={()=>{
                        setConfig(0);
                    }}
                >
                    Go Back
                </Button>

                <NodeChange configurationNodeAll={configurationNodeAll} 
                            callbackSetSignIn={callbackSetSignIn} 
                            ChartConfigLoading={{0: isLoadingChartConfig, 1: setIsLoadingChartConfig}}
                            roomIdForChartConfig={roomIdForChartConfig}
                            roomSize={roomSize}
                />

                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                    <Header title={`All node records in room ${roomIdForChartConfig}`} fontSize="20px"/>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Node id</TableCell>
                                <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Position x</TableCell>
                                <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Position y</TableCell>
                                <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Funtion</TableCell>
                                <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Mac Address</TableCell>
                                <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {configurationNodeAll.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.node_id}</TableCell>
                                <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.x_axis}</TableCell>
                                <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.y_axis}</TableCell>
                                <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{dict_function[row.function]}</TableCell>
                                <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.mac}</TableCell>
                                <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.status === "sync" ? "Active" : "Deleted"}</TableCell>


                                <TableCell 
                                sx={{
                                    width: { xs:"100px", sm: "100px", md: "100px", lg: "100px" },
                                          "& .MuiInputBase-root": {
                                              height: 35
                                          },
                                        }}
                                >
                                    <DialogConfirmSettingNode callbackSetSignIn={callbackSetSignIn} 
                                        ChartConfigLoading={{0: isLoadingChartConfig, 1: setIsLoadingChartConfig}}
                                        row={row} 
                                        configurationNodeAll={configurationNodeAll}
                                        roomSize={roomSize}
                                        />
                                </TableCell>
                                <TableCell
                                sx={{
                                    width: { xs:"100px", sm: "100px", md: "100px", lg: "100px" },
                                          "& .MuiInputBase-root": {
                                              height: 35
                                          },
                                        }}
                                >
                                    {
                                        row.status === "sync" ?
                                        <DialogConfirmDeleteNode callbackSetSignIn={callbackSetSignIn} ChartConfigLoading={{0: isLoadingChartConfig, 1: setIsLoadingChartConfig}} id={row.id}/>
                                        :
                                        <></>
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </Paper>

            </Container>
            }
            </>
    );
}