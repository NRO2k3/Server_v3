import { Box, Button, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import Grid from '@mui/material/Grid';
import {host} from "../../App";
import RoomMap from "../../components/RoomMap/RoomMap2";
import RoomMap2D from "../Map2D/RoomMap2D";

function Options({ room_id, callbackSetSignIn, configurationNodeAll}) {
    const theme = useTheme();
    const [status, setStatus] = useState(true);
    const [image, setImage] = useState(localStorage.getItem("uploadedImage") || "/room.png");

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
                    backgroundColor: "white",
                    fontSize: "20px",
                    fontWeight: "bold",
                    padding: "5px 12px",
                    margin: "5px",
                    border: "2px solid black",
                    borderRadius: "5px",
                    "&:hover": { backgroundColor: "#EEEEEE" }
                }}
                    onClick={() => { setStatus(true) }}>
                    ROOM
                </Button>
                <Button sx={{
                    backgroundColor: "white",
                    fontSize: "20px",
                    fontWeight: "bold",
                    padding: "5px 12px",
                    margin: "5px",
                    border: "2px solid black",
                    borderRadius: "5px",
                    "&:hover": { backgroundColor: "#EEEEEE" }
                }}
                    onClick={() => { setStatus(false) }}>
                    HEAT MAP
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
            {status ? (
                <RoomMap2D url={image} configurationNodeAll={configurationNodeAll}/>
            ) : (
                <RoomMap
                    room_id={room_id}
                    callbackSetSignIn={callbackSetSignIn}
                    backend_host={host}
                />
            )}
        </Box>
    );
}

export default Options;
