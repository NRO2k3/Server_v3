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

import RoomChange from './RoomChange';
import { host } from '../../../App';
import { UserContext } from '../../../App';
import DeleteIcon from '@mui/icons-material/Delete';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import DetailsIcon from '@mui/icons-material/Details';
import DialogConfirmSettingRoom from './DialogConfirmSettingRoom';
import DialogConfirmDeleteRoom from './DialogConfirmDeleteRoom';


function preventDefault(event) {
  event.preventDefault();
}

export default function RoomConfig({setConfig, setRoomIdForNodeConfig, setRoomSize}) {
    const [reloadRoomConfig, setReloadRoomConfig] = useState(false);
    const callbackSetSignIn = useContext(UserContext);
    const api = `http://${host}/api/configuration_room`
    const [configurationRoomAll, setConfigurationRoomAll] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const getConfigurationRoomAllData = async (url, access_token) => 
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
                setConfigurationRoomAll(data);
                setIsLoading(false);
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
        verify_and_get_data(getConfigurationRoomAllData, callbackSetSignIn, host, api);
    },[reloadRoomConfig, isLoading])


    return (
        <>
        {

        isLoading === true ?
            <h1>Loading ...</h1>
            :
            <Container>
                <RoomChange configurationRoomAll={configurationRoomAll} callbackSetSignIn={callbackSetSignIn} RoomConfigLoading={{0: isLoading, 1: setIsLoading}}/>

                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                    <Header title="All room records" fontSize="20px"/>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Room id</TableCell>
                                <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Construction name</TableCell>
                                <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Width</TableCell>
                                <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Length</TableCell>
                                <TableCell sx={{"font-weight": "600", "font-size": "15px"}}>Information</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {configurationRoomAll.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.room_id}</TableCell>
                                <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.construction_name}</TableCell>
                                <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.x_length}</TableCell>
                                <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.y_length}</TableCell>
                                <TableCell sx={{"font-weight": "400", "font-size": "13px"}}>{row.information}</TableCell>
                                <TableCell 
                                    sx={{
                                        width: { xs:"100px", sm: "100px", md: "100px", lg: "100px" },
                                              "& .MuiInputBase-root": {
                                                  height: 35
                                              },
                                            }}
                                >
                                    <Button
                                        startIcon={<DetailsIcon />}
                                        sx={{
                                            backgroundColor: "#1976d2",
                                            fontSize: "10px",
                                            fontWeight: "bold",
                                            padding: "5px 12px",
                                            }}
                                        variant="contained"

                                        onClick={()=>{
                                            setRoomIdForNodeConfig(row.room_id);
                                            setRoomSize({x: row.x_length, y: row.y_length})
                                            setConfig(1);
                                        }}
                                    >
                                        Detail
                                    </Button>
                                </TableCell>
                                <TableCell 
                                sx={{
                                    width: { xs:"100px", sm: "100px", md: "100px", lg: "100px" },
                                          "& .MuiInputBase-root": {
                                              height: 35
                                          },
                                        }}
                                >
                                    <DialogConfirmSettingRoom callbackSetSignIn={callbackSetSignIn} 
                                                            RoomConfigLoading={{0: isLoading, 1: setIsLoading}} 
                                                            row={row} 
                                                            configurationRoomAll={configurationRoomAll}/>
                                </TableCell>
                                <TableCell
                                sx={{
                                    width: { xs:"100px", sm: "100px", md: "100px", lg: "100px" },
                                          "& .MuiInputBase-root": {
                                              height: 35
                                          },
                                        }}
                                >
                                    <DialogConfirmDeleteRoom callbackSetSignIn={callbackSetSignIn} RoomConfigLoading={{0: isLoading, 1: setIsLoading}} id={row.id}/>
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    {/* <Link color="primary" href="#" onClick={preventDefault} sx={{ mt: 3 }}>
                        See more orders
                    </Link> */}
                </Paper>

            </Container>
            }
            </>
    );
}