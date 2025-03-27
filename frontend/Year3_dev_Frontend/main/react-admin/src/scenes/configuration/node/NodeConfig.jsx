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
import { Grid, Tooltip, Typography, useTheme } from "@mui/material";
import { host } from '../../../App';
import { UserContext } from '../../../App';
import DeleteIcon from '@mui/icons-material/Delete';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import DetailsIcon from '@mui/icons-material/Details';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DialogConfirmDeleteNode from './DialogConfirmDeleteNode';
import NodeChange from './NodeChange';
import DialogConfirmSettingNode from './DialogConfirmSettingNode';
import verify_and_get_data from '../../../function/fetchData';
import RoomMap from '../../../components/RoomMap/RoomMap2';
import { TableContainer } from "@mui/material";
import verifyAccessToken from '../../../function/verifyAccessToken';
import verifyRefreshToken from '../../../function/verifyRefreshToken';
import ScanDevice from './ScanDevice';
import Options from '../../../components/OptionsRoomMap/Options';

export default function NodeConfig({roomIdForNodeConfig, setConfig, roomSize}) {
    
    const callbackSetSignIn = useContext(UserContext);
    const backend_host = host;
    const api = `http://${host}/api/configuration_node?room_id=${roomIdForNodeConfig}`
    const [configurationNodeAll, setConfigurationNodeAll] = useState([]);
    const [isLoadingNodeConfig, setIsLoadingNodeConfig] = useState(true);

    const dict_function = {
        "sensor": "Sensor",
        "air": "Air conditioner",
        "fan": "Fan",
        "actuator": "Actuator",
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
                setIsLoadingNodeConfig(false);
            }
        }
        else
        {
            alert("Some error happened, try to reload page!");
        }
    }

    const handleButtonClick = async(url) => {

        const scan_device = async(url, access_token)=>{

            console.log("Sent request");
            alert("Please wait! Gateway is scanning");

            const headers =
            {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`,
            }
            const body = JSON.stringify({
                "operator": "scan_device",
                "status": 1,
                "info": {
                    "room_id": roomIdForNodeConfig,
                    "protocol": "ble_mesh"
                }
            })

            const option_fetch =
            {
                "method": "POST",
                "headers": headers,
                "body": body,
            }
            const response = await fetch(url, option_fetch);
            
            if(response.status === 200){
                alert("Scan Processing in 60s");
            } else{
                alert("Try again!")
            }
        }

        const token = {access_token: null, refresh_token: null}
        if(localStorage.getItem("access") !== null && localStorage.getItem("refresh") !== null){
            token.access_token = localStorage.getItem("access");
            token.refresh_token = localStorage.getItem("refresh");
        } else {
            throw new Error("There is no access token and refresh token ....");
        }

        if( await verifyAccessToken(backend_host, token) === true){
            scan_device(url, token["access_token"])
        } else {
            if(await verifyRefreshToken(backend_host, token) === true){
                scan_device(url, token["access_token"]);
            } else {
                callbackSetSignIn(false);
            }
        }
        
    };

    useEffect(()=>{
        verify_and_get_data(getConfigurationNodeAllData, callbackSetSignIn, backend_host, api);
        const timer = setInterval(() => {
            verify_and_get_data(getConfigurationNodeAllData, callbackSetSignIn, backend_host, api);
        }, 10000);
        return () => clearInterval(timer);
    },[isLoadingNodeConfig])


    return (
        <>
        {

        isLoadingNodeConfig === true ?
            <h1>Loading ...</h1>
            :
            <Container sx={{ p: 0, m: 0, width: "100%" }} maxWidth="xl" >
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
                {/* Protocol Wifi*/}
                {/* <NodeChange configurationNodeAll={configurationNodeAll} 
                            callbackSetSignIn={callbackSetSignIn} 
                            nodeConfigLoading={{0: isLoadingNodeConfig, 1: setIsLoadingNodeConfig}}
                            roomIdForNodeConfig={roomIdForNodeConfig}
                            roomSize={roomSize}
                /> */}
                <Grid container>
                    <Grid item xs = {5}>
                        <TableContainer sx={{ maxWidth: "90%", overflowX: "auto", backgroundColor: "white"}}>
                            <Header title={`All node records in room ${roomIdForNodeConfig}`} fontSize="20px"/>
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
                                                NodeConfigLoading={{0: isLoadingNodeConfig, 1: setIsLoadingNodeConfig}}
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
                                                <DialogConfirmDeleteNode callbackSetSignIn={callbackSetSignIn} NodeConfigLoading={{0: isLoadingNodeConfig, 1: setIsLoadingNodeConfig}} id={row.node_id}/>
                                                :
                                                <></>
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                            {/* <Link color="primary" href="#" onClick={preventDefault} sx={{ mt: 3 }}>
                                See more orders
                            </Link> */}

                        </TableContainer>
                    </Grid>
                    <Grid item xs = {7}>
                        {/* <RoomMap
                            room_id={roomIdForNodeConfig} callbackSetSignIn={callbackSetSignIn} backend_host={backend_host}
                        /> */}
                        <div>
                            <Options room_id={roomIdForNodeConfig} callbackSetSignIn={callbackSetSignIn}/>
                        </div>
                        <Button
                            sx={{
                                backgroundColor: "#2319b4",
                                fontSize: "20px",
                                fontWeight: "bold",
                                padding: "5px 12px",
                                margin: "5px",
                                "&:hover": { backgroundColor: "#6d65ea" }
                                }}
                            variant="contained"

                            onClick={()=>{handleButtonClick(`http://${host}/api/scan_device`)}}
                        >
                            SCAN DEVICE
                        </Button>
                        <ScanDevice roomIdForNodeConfig={roomIdForNodeConfig}/>
                    </Grid>
                </Grid>

            </Container>
            }
            </>
    );
}