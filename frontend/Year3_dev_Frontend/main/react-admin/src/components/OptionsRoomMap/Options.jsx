import { Box, Button, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import Grid from '@mui/material/Grid';
import {host} from "../../App";
import RoomMap2D from "../Map2D/RoomMap2D";
import RoomMap from "../RoomMap/RoomMap2";
import RoomMapConnections from "../RoomMap/RoomMapConnections";

function Options({ room_id, callbackSetSignIn, configurationNodeAll, setListNode, setSeparate}) {
    const theme = useTheme();
    const [status, setStatus] = useState(true);
    const [statusConnections, setStatusConnections] = useState(false);
    const [image, setImage] = useState(localStorage.getItem("uploadedImage") || "/room2.png");

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const base64 = await convertToBase64(file);
            setImage(base64);
            localStorage.setItem("uploadedImage", base64);
        }
    };

    return (
        <Box
            sx={{
                boxShadow: 0,
                borderRadius: '5px',
                backgroundColor: theme.palette.background.paper
            }}
            width="100%" height="100%"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
        >
            <Grid>
                <Button sx={{
                    width: "150px",
                    height: "60px",
                    backgroundColor: "white",
                    fontSize: "20px",
                    fontWeight: "bold",
                    padding: "5px 12px",
                    margin: "5px",
                    border: "2px solid black",
                    borderRadius: "5px",
                    "&:hover": { backgroundColor: "#EEEEEE" }
                }}
                    onClick={() => {
                        setStatus(true)
                        setStatusConnections(false)
                        }}>
                    ROOM
                </Button>
                <Button sx={{
                    width: "150px",
                    height: "60px",
                    backgroundColor: "white",
                    fontSize: "20px",
                    fontWeight: "bold",
                    padding: "5px 12px",
                    margin: "5px",
                    border: "2px solid black",
                    borderRadius: "5px",
                    "&:hover": { backgroundColor: "#EEEEEE" }
                }}
                    onClick={() => {
                        setStatus(false)
                        setStatusConnections(false)
                    }}>
                    HEAT MAP
                </Button>
                <Button sx={{
                    width: "150px",
                    height: "60px",
                    backgroundColor: "white",
                    fontSize: "20px",
                    fontWeight: "bold",
                    padding: "5px 12px",
                    margin: "5px",
                    border: "2px solid black",
                    borderRadius: "5px",
                    "&:hover": { backgroundColor: "#EEEEEE" }
                }}
                    onClick={() => {
                        setStatus(false)
                        setStatusConnections(true) 
                        }}>
                    Connections
                </Button>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                    id="upload-button"
                />
                <label htmlFor="upload-button">
                    <Button component="span"
                        sx={{
                            width: "150px",
                            height: "60px",
                            backgroundColor: "white",
                            fontSize: "20px",
                            fontWeight: "bold",
                            padding: "5px 12px",
                            margin: "5px",
                            border: "2px solid black",
                            borderRadius: "5px",
                            "&:hover": { backgroundColor: "#EEEEEE" }
                        }}>
                        IMPORT
                    </Button>
                </label>

            </Grid>
            {status? (
                <RoomMap2D url={image} configurationNodeAll={configurationNodeAll} setListNode={setListNode}
                callbackSetSignIn = {callbackSetSignIn} setSeparate = {setSeparate}/>
            ) : (statusConnections ?
                <RoomMapConnections
                room_id={room_id}
                callbackSetSignIn={callbackSetSignIn}
                backend_host={host}
                setSeparate = {setSeparate}
                />
                :
                <RoomMap
                room_id={room_id}
                callbackSetSignIn={callbackSetSignIn}
                backend_host={host}
                setSeparate = {setSeparate}
            />
            )}
        </Box>
    );
}

export default Options;
