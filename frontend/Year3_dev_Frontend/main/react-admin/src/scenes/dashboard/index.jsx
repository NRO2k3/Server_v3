import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { useState, useContext } from "react";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Energy from "../../components/AqiRef/Energy2";
import { UserContext } from "../../App";
import Chart from "../../data/Chart2";
import {host} from "../../App";
import InformationTag from "../../components/InformationTag2";
import { useLocation } from "react-router-dom"; 
import RoomMap from "../../components/RoomMap/RoomMap2";
import AqiRef from "../../components/AqiRef/AqiRef2";
import Actuator from "../../components/Actuator/Actuator";
import EnergyChart from "../../components/EnergyChart/EnergyChart2";

const Dashboard = () => {
    const backend_host = host;
    const location = useLocation(); /*!< This is used to get the "state" component that is passed into <Link> */
    const data_passed_from_landingpage = location.state;
    let room_id = data_passed_from_landingpage == null ? 1 : data_passed_from_landingpage.room_id
    const theme = useTheme();
    const callbackSetSignIn = useContext(UserContext);
    const [id, setId] = useState(1);
    const [optionData, setOptionData] = useState("now");        //change option to show different Chart
    const [optionChartData, setOptionChartData] = useState("now")
    // const apiHistoryChart = `http://${backend_host}/api/v1.1/monitor/data/history?room_id=${room_id}&node_id=${nodeIdFilter}&time_start=${unixTimestampStart}&time_end=${unixTimestampEnd}&option=${optionChartData}`;
    // const [apiHistoryChartState, setApiHistoryChartState] = useState(apiHistoryChart);
    const apiInformationTag = `http://${backend_host}/api/room/information_tag?room_id=${room_id}`;
    const [actuatorInfoOfRoom, setActuatorInfoOfRoom] = useState([]);
    
    return (
    <>
    <Box 
        component="main"
        sx={{
            flexGrow: 1,
            bgcolor: theme.palette.background.default
        }}
    >
        <Box m={2}/>
        {/* Container of all componment */}
        <Container 
            maxWidth="false"
            disableGutters='true'
        >
        {/* <Box> */}
            {/* Container of Information, overall quality, controlling, image of room  */}
            <Grid
                container alignItems="stretch" spacing={2} p='10px'
                style={{
                        display: "flex", 
                        height: "100%", 
                        // backgroundColor: "red"
                    }}
            >
                <Grid item xs={12} sm={12} md={12} lg={12} xl={4.5} container>
                    <Box                   
                        width="100%" height="100%" display="flex"
                        flexDirection="column" alignItems="center" justifyContent="center"
                    >
                        <Box 
                            sx={{boxShadow: 0,
                                borderRadius: '5px', 
                                backgroundColor: theme.palette.background.paper}}
                            width="100%" height="100%" display="flex"
                            flexDirection="column" alignContent="center" justifyContent="center"
                        >
                            <AqiRef callbackSetSignIn={callbackSetSignIn} time_delay={60000}/>
                        </Box>
                        <Box 
                            sx={{boxShadow: 0,
                                borderRadius: '5px', 
                                backgroundColor: theme.palette.background.paper}}
                            width="100%" height="100%"
                            display="flex"
                            flexDirection="row"
                            alignSelf='center'
                            alignContent="center"
                            justify="center"
                            marginTop={2}
                        >
                            <Energy room_id={room_id} callbackSetSignIn={callbackSetSignIn} time_delay={15000} backend_host={backend_host} />  
                        </Box>
                    </Box>
                </Grid>
                {/* Container of everything except image of room, this is set to the most left */}
                <Grid item xs={12} sm={12} md={12} lg={6} xl={4.5} container>
                    <Box 
                        sx={{boxShadow: 0,
                            borderRadius: '5px', 
                            backgroundColor: theme.palette.background.paper}}
                        width="100%"
                        height="100%"
                        alignContent="center"
                    >   
                        <InformationTag 
                            url={apiInformationTag} 
                            callbackSetSignIn={callbackSetSignIn} 
                            time_delay={10000}
                            room_id={room_id}
                            setActuatorInfoOfRoom={setActuatorInfoOfRoom}
                        />
                    </Box>
                </Grid>

                {/* Container of image */}
                <Grid item xs={12} sm={12} md={12} lg={6} xl={3} container
                    direction="column"
                    alignItems="center"
                    justify="center"
                >
                    <Box 
                        sx={{boxShadow: 0,
                            borderRadius: '5px', 
                            backgroundColor: theme.palette.background.paper}}
                        width="100%" height="100%"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justify="center"
                    >
                        <RoomMap 
                            room_id={room_id} callbackSetSignIn={callbackSetSignIn} backend_host={host}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                    <Box 
                        sx={{boxShadow: 0,
                            borderRadius: '5px', 
                            backgroundColor: theme.palette.background.paper}}
                        width="100%" height="100%"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justify="center"
                    >
                        <EnergyChart room_id={room_id} callbackSetSignIn={callbackSetSignIn} time_delay={15000} backend_host={backend_host}/>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={6}>
                    <Box 
                        sx={{boxShadow: 0,
                            borderRadius: '5px', 
                            backgroundColor: theme.palette.background.paper}}
                        width="100%" height="100%"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justify="center"
                    >
                        {   // bo phan optionChartData
                            optionChartData === "now" ?
                            <Chart 
                                    room_id={room_id}
                                    callbackSetSignIn={callbackSetSignIn} 
                                    timedelay={5000} 
                                    optionData={optionChartData}
                                    apiInformationTag={apiInformationTag}
                            />
                            :
                            <Chart 
                                    room_id={room_id} 
                                    callbackSetSignIn={callbackSetSignIn} 
                                    timedelay={5000} 
                                    optionData={optionChartData}
                                    apiInformationTag={apiInformationTag}
                            />
                        }
                    </Box>
                </Grid>

            </Grid>

            {/* COntainer of data option and charts */}
            {/* <Container maxWidth="xl"> */}
            <Actuator 
                room_id={room_id} 
                callbackSetSignIn={callbackSetSignIn}
            />  
        </Container>    
    </Box>
    </>
    );
}

export default Dashboard;

