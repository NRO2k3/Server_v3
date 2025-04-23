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
import verify_and_get_data from '../../../function/fetchData';

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