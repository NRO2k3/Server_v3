import { Box, Button, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import DetailsIcon from '@mui/icons-material/Details';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import {host, UserContext} from "../../App";
import plan_409 from "../../assets/409.svg";
import plan_410 from "../../assets/410.svg";
import plan_411 from "../../assets/411.svg";
import verify_and_get_data from "../../function/fetchData";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
const Landing = () => {
    const callbackSetSignIn = useContext(UserContext);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [room_data, setRoom_data] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const image_room =
    {
        1: plan_409,
        2: plan_410,
        3: plan_411,
        4: plan_409,
        407: plan_409,
        507: plan_409,
    }

    const backend_host = host;
    const api_room_data = `http://${backend_host}/api/configuration_room`;

    const get_room_data = async (url, access_token) =>
    {
        const headers = {
            'Content-Type':'application/json',
            "Authorization": `Bearer ${access_token}`
            };
        const option_room_data = {
            'method':'GET',
            "headers": headers,
            "body": null,
            };
        const response_room_data = await fetch(url, option_room_data);
        if(response_room_data.status === 200)   /*!< if the fetch is successful*/  
        {
            const response_room_data_json_dispatch = await response_room_data.json();
            if(response_room_data_json_dispatch) /*!< if there is data in response */
            {
                const new_room_data = [];
                const all_keys_in_response_room_data_json_dispatch = Object.keys(response_room_data_json_dispatch);
                all_keys_in_response_room_data_json_dispatch.forEach((each_key) => 
                {
                        const room = response_room_data_json_dispatch[each_key]
                        const key = `room_${room["id"]}_${room["construction_name"]}`;
                        new_room_data.push({
                            "name": `room ${room["room_id"]} ${room["construction_name"]}`,
                            "image": image_room[room["room_id"]],
                            "room_id": room["room_id"],
                            "info": room["information"],
                            "image_url": room["image"],
                            "x_length":room["x_length"],
                            "y_length":room["y_length"],
                        })
                    
                })
                setRoom_data(new_room_data);
                setIsLoading(false);
            }
            else
            {
                alert("No room data!");
            }
        }
        else
        {
            alert(`Can not call to server! Error code: ${response_room_data.status}`);
        }
    }

    const handleExportData = async (room_id)=>{
        const headers = {
            'Content-Type':'application/json',
            };
        const option_data = {
            'method':'GET',
            "headers": headers,
            "body": null,
            };
        const response_data = await fetch(`http://${backend_host}/api/data_all_node?room_id=${room_id}`, option_data);
        if(response_data.status === 200){
            const response_data_json = await response_data.json();
            const worksheet = XLSX.utils.json_to_sheet(response_data_json);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(blob, "data.xlsx");
        }
        
    }

    useEffect(()=>{
        verify_and_get_data(get_room_data, callbackSetSignIn, backend_host, api_room_data);
    },[]);

    
    return (
        <Box p="20px" sx={{ backgroundColor: theme.palette.background.default}}>
            <main>
            <Container sx={{ py: 6 }} maxWidth="xl">    {/* This container is the most ouside*/}
                <Grid container spacing={5}>            {/* This Grid container is the one that make every child Grid inside in order*/}
                {
                    isLoading ? 
                    <h1>Loading...</h1>
                    :
                    <>
                    {
                    room_data.map((room) => (
                        // This function return an array of Grid component       
                        <Grid item key={room.name} xs={12} sm={12} xl={3}
                                md={
                                    (() => {
                                        const room_data_length = room_data.length;
                                        if (room_data_length === 1) return 12;
                                        else if (room_data_length === 2) return 6;
                                        else return 4;
                                    })()
                                }
                        >
                        {/* xs=collum's width sm={16} md={4} */}
                            <Card
                            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                            >
                            <Box
                                container
                                display="flex"
                                flexDirection="row"
                                // alignItems="center"
                                justifyContent="center"
                                height="350px"
                                sx={{
                                    "object-fit": "cover",
                                    // backgroundColor: "blue",
                                }}
                            >
                                <img src={room.image} alt="" />
                            </Box>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h4" component="h2" sx={{fontWeight: "bold"}}>
                                    {room.name}
                                </Typography>
                                <Typography gutterBottom variant="h5" component="h3" sx={{fontWeight: 600}}>
                                    {room.info}
                                </Typography>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography>
                                        Click the button below for more information!
                                    </Typography>
                                </Box>
                            </CardContent>
                            <CardActions>
                                <Link to="/landing/dashboard" 
                                    state= {room}
                                >
                                    <Button
                                        size="small"
                                        sx={{
                                            backgroundColor: "black",
                                            color: "white",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            padding: "5px 8px",
                                        }}
                                        >
                                        <DetailsIcon sx={{ mr: "10px" }} />
                                        Detail   
                                    </Button>
                                    {/* <Button size="small">View</Button>
                                    <Button size="small">Edit</Button> */}
                                </Link>
                                <Button
                                    size="small"
                                    sx={{
                                        backgroundColor: "black",
                                        color: "white",
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        padding: "5px 8px",
                                    }}
                                    onClick={()=>handleExportData(room.room_id)}
                                    >
                                        <ArrowDownwardIcon sx={{ mr: "10px" }}/>
                                        Export Data
                                </Button>
                            </CardActions>
                            </Card>
                        </Grid>
                    ))
                    }
                    </>
                }
                </Grid>
                </Container>
            </main>
            {/* End body */}

        </Box>
    )
}

export default Landing;