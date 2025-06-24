import { Grid } from "@mui/material";
import { host } from "../../App";
import { React, useState, useEffect } from "react";
import verify_and_get_data from "../../function/fetchData";
import RoomMapConnectionsComponent from "./RoomMapConnectionsComponent";
import { data_max_min } from "../Map2D/RoomMap2D";

const RoomMap = ({ room_id, callbackSetSignIn, backend_host, setSeparate}) => {
    setSeparate(false)
    const [nodeData, setNodeData] = useState([]);
    const [nodeList, setNodeList] = useState([]);
    const [nodeFunction, setNodeFunction] = useState([]);
    const [sizeRoom, setSizeRoom] =  useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const api_to_fetch = `http://${backend_host}/api/heatmap?room_id=${room_id}`;
    const image = localStorage.getItem("uploadedImage") || "/room2.png";
    const offset = -25
    const fetch_data_function = async (url, access_token) => {
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

        let response;
        try {
            response = await fetch(url, option_fetch);
        }
        catch (err) {
            console.log("Error happend while getting data. Error: " + err);
        }
        if (response && response.status === 200) {
            const data_response = await response.json();
            let newNodePosition = [];
            setSizeRoom(data_response[0])
            setNodeList(data_response[1]);
            setNodeFunction(data_response[2]);
            for (let i = 0; i < data_response[3].length; i++) {
                const newObj = {
                    x: Math.round(((data_response[3][i]-data_max_min[0])/(data_max_min[1]-data_max_min[0])) * 1100) - offset,
                    y: Math.round((1- (data_response[4][i]-data_max_min[2])/(data_max_min[3]-data_max_min[2])) *800) - offset,
                    value: Math.round(data_response[5][i]),
                    radius: 500,
                };
                newNodePosition.push(newObj);
            }
            setNodeData(newNodePosition);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (nodeData === null)            //!< this is for the total component always render the first time and then the next time will be setTimeOut
        {
            verify_and_get_data(fetch_data_function, callbackSetSignIn, host, api_to_fetch);
        }
        else {
            const timer = setTimeout(() => {
                verify_and_get_data(fetch_data_function, callbackSetSignIn, host, api_to_fetch);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <>
            {
                isLoading ? <h1>Loading...</h1> :
                    <Grid container justifyContent='center' sx={{mt : 6, mb: 6}}>
                        <Grid item xs={12} p={1} />
                        <Grid container justifyContent='center' >
                            <RoomMapConnectionsComponent
                                sizeRoom = {sizeRoom}
                                nodeData={nodeData}
                                nodeList={nodeList}
                                nodeFunction={nodeFunction}
                                pic_src={image}
                                offset = {offset}
                            />
                        </Grid>
                    </Grid>
            }
        </>
    );
}


export default RoomMap;
