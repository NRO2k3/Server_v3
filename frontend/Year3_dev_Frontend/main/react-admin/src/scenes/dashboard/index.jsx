import { Box, useTheme } from "@mui/material";
import { useState, useContext, useEffect } from "react";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Energy from "../../components/AqiRef/Energy2";
import { UserContext } from "../../App";
import Chart from "../../data/Chart2";
import {host} from "../../App";
import InformationTag from "../../components/InformationTag2";
import { useLocation } from "react-router-dom"; 
import AqiRef from "../../components/AqiRef/AqiRef3";
import EnergyChart from "../../components/EnergyChart/EnergyChart2";
import Options from "../../components/OptionsRoomMap/Options";
import verify_and_get_data from "../../function/fetchData";
import DetailNode from "../../components/NodeInfo/DetailNode";


const Dashboard = () => {
    const backend_host = host;
    const location = useLocation();
    const data_passed_from_landingpage = location.state;
    let room_id = data_passed_from_landingpage == null ? 1 : data_passed_from_landingpage.room_id
    const url_image = data_passed_from_landingpage.image_url
    const theme = useTheme();
    const callbackSetSignIn = useContext(UserContext);
    const [id, setId] = useState(1);
    const [optionData, setOptionData] = useState("now");        //change option to show different Chart
    const [optionChartData, setOptionChartData] = useState("now")
    const apiInformationTag = `http://${backend_host}/api/room/information_tag?room_id=${room_id}`;
    const [actuatorInfoOfRoom, setActuatorInfoOfRoom] = useState([]);
    const [configurationNodeAll, setConfigurationNodeAll] = useState([]);
    const api = `http://${host}/api/configuration_node?room_id=${room_id}`
    const [listNode, setListNode] = useState([])
    const [separate, setSeparate] = useState(false)
    const [isImageFetched, setIsImageFetched] = useState(false);
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
            }
        }
        else
        {
            alert("Some error happened, try to reload page!");
        }
    }

    const fetchAndEncodeImage = async () => {
        try {
            const response = await fetch(url_image);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onload = () => {
                const base64 = reader.result;
                localStorage.setItem("uploadedImage", base64);
                setIsImageFetched(true)
            };
        } catch (error) {
            console.error("Error:", error);
            }
        };

    useEffect(()=>{
        fetchAndEncodeImage()
        verify_and_get_data(getConfigurationNodeAllData, callbackSetSignIn, backend_host, api);
        const timer = setInterval(() => {
            verify_and_get_data(getConfigurationNodeAllData, callbackSetSignIn, backend_host, api);
        }, 20000);
        return () => clearInterval(timer);
    },[])
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
            <Container
                maxWidth="false"
                disableGutters='true'
            >
                <Grid
                    container alignItems="stretch" spacing={2} p='10px'
                    style={{
                            display: "flex",
                            height: "100%",
                            // backgroundColor: "red"
                        }}
                >
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={3.5} >
                        <Box
                            width="100%" height="100%" display="flex"
                            flexDirection="column" alignItems="center" justifyContent="center"
                        >
                            <Box 
                                sx={{boxShadow: 0,
                                    border: "1px solid black",
                                    borderRadius: '15px', 
                                    backgroundColor: theme.palette.background.paper}}
                                width="100%" height="100%" display="flex"
                                flexDirection="column" alignContent="center" justifyContent="center"
                            >
                                <AqiRef callbackSetSignIn={callbackSetSignIn} time_delay={60000}/>
                            </Box>
                            <Box
                                sx={{boxShadow: 0,
                                    border: "1px solid black",
                                    borderRadius: '15px',
                                    backgroundColor: theme.palette.background.paper}}
                                width="100%" height="100%"
                                display="flex"
                                flexDirection="row"
                                alignSelf='center'
                                alignContent="center"
                                justify="center"
                                marginTop={2}
                            >
                            <InformationTag
                                url={apiInformationTag}
                                callbackSetSignIn={callbackSetSignIn}
                                time_delay={20000}
                                room_id={room_id}
                                setActuatorInfoOfRoom={setActuatorInfoOfRoom}
                            />
                            </Box>
                            <Box 
                                sx={{boxShadow: 0,
                                    border: "1px solid black",
                                    borderRadius: '15px', 
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

                    <Grid item xs={12} sm={12} md={12} lg={12} xl={separate > 0 ? 5.5 : 8.5} sx={{height:"1150px"}}
                        direction="column"
                        alignItems="center"
                        justify="center"
                    >
                        <Options
                            room_id={room_id}
                            callbackSetSignIn={callbackSetSignIn}
                            configurationNodeAll={configurationNodeAll}
                            setListNode = {setListNode}
                            setSeparate = {setSeparate}
                            isImageFetched = {isImageFetched}
                            widthMap= {separate?null:"920px"}
                            data_passed_from_landingpage={data_passed_from_landingpage}
                        />
                    </Grid>

                    {separate && (
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={3} container display='flex' direction="column" alignItems="center" justify="center">
                        <DetailNode
                            room_id={room_id}
                            callbackSetSignIn={callbackSetSignIn}
                            listNode={listNode}
                        />
                    </Grid>
                    )}
                </Grid>

                <Grid
                    container alignItems="stretch" spacing={2} p='10px'
                    style={{
                            display: "flex", 
                            height: "100%", 
                            // backgroundColor: "red"
                        }}
                >
                    <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                        <Box 
                            sx={{boxShadow: 0,
                                border: "1px solid black",
                                borderRadius: '15px', 
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
                                borderRadius: '15px',
                                border: "1px solid black",
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
                                        timedelay={10000} 
                                        optionData={optionChartData}
                                        apiInformationTag={apiInformationTag}
                                />
                                :
                                <Chart
                                        room_id={room_id} 
                                        callbackSetSignIn={callbackSetSignIn} 
                                        timedelay={10000} 
                                        optionData={optionChartData}
                                        apiInformationTag={apiInformationTag}
                                />
                            }
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    </>
    );
}

export default Dashboard;

