import { Box, Button, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import Grid from '@mui/material/Grid';
import {host} from "../../App";
import RoomMap2D from "../Map2D/RoomMap2D";
import RoomMap from "../RoomMap/RoomMap2";
import RoomMapConnections from "../RoomMap/RoomMapConnections";
import { useTranslation } from "react-i18next";
import "../../utils/i18n"

function Options({ room_id, callbackSetSignIn, configurationNodeAll, setListNode, setSeparate, isImageFetched, widthMap, heightMap, data_passed_from_landingpage}) {
    const {t} = useTranslation()
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

    useEffect(() => {
        if (!isImageFetched) {
            setImage(localStorage.getItem("uploadedImage") || "/room2.png");
        } else {
            setImage(localStorage.getItem("uploadedImage"));
        }
    }, [isImageFetched]);

    return (
        <Box
            sx={{
                boxShadow: 0,
                border: "1px solid black",
                borderRadius: '15px',
                backgroundColor: theme.palette.background.paper,
                p:1,
                mb : 6
            }}
            width="100%" height="100%"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
        >
            <Grid sx={{ mb:2}}>
                <Button sx={{
                    width: "140px",
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
                    {t("room")}
                </Button>
                <Button sx={{
                    width: "140px",
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
                    {t("heatmap")}
                </Button>
                <Button sx={{
                    width: "140px",
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
                    {t("connections")}
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
                            width: "140px",
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
                        {t("import")}
                    </Button>
                </label>

            </Grid>
            {status? (
                <RoomMap2D url={image} configurationNodeAll={configurationNodeAll} setListNode={setListNode}
                callbackSetSignIn = {callbackSetSignIn} setSeparate = {setSeparate} widthMap={widthMap} heightMap={heightMap} data_passed_from_landingpage={data_passed_from_landingpage}/>
            ) : (statusConnections ?
                // <RoomMapConnections
                // room_id={room_id}
                // callbackSetSignIn={callbackSetSignIn}
                // backend_host={host}
                // setSeparate = {setSeparate}
                // />
                <RoomMap2D
                    url={image}
                    configurationNodeAll={configurationNodeAll}
                    setListNode={setListNode}
                    callbackSetSignIn = {callbackSetSignIn}
                    setSeparate = {setSeparate}
                    widthMap={widthMap}
                    heightMap={heightMap}
                    statusConnections={statusConnections}
                    data_passed_from_landingpage={data_passed_from_landingpage}
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
