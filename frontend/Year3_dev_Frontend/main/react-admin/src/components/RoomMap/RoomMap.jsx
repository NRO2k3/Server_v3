import Header from "../Header";
import { Box, Grid } from "@mui/material";
import plan from "../../assets/plan.svg";
import plan_409 from "../../assets/409.svg";
import plan_410 from "../../assets/410.svg";
import plan_411 from "../../assets/411.svg";

import {Button, useMediaQuery} from "@mui/material";
import { host } from "../../App";
import { React, useState, useEffect, useRef } from "react";
import h337 from "heatmap.js";
import Node from "../Node";

/**
 * @brief This component RoomMap will render out the image room with all node 
 *          sticks to it in real position according to the x and y axises provided
 *          in database backend.
 */
const RoomMap = ({room_id, callbackSetSignIn}) => 
{
    const [imageWidth, setImageWidth] = useState(0);
    const boxRef = useRef(null);
    const [nodePosition, setNodePosition] = useState(null);
    
    /**
     * @brief nodePosition is an array of all node in this room with informations,
     *        the information will contains whether it is sensor or actuator, the positions
     *        of it according to the real size of the box it is gonna be rendered, which is    
     *        the "px" from left and the "px" from above.
     *        The image of the room will be positioned so that the main door will facing above,
     *        the left of the room will be the x_axis and the bottom of the room will be the y_axis.
     *        The array will be like:
     *        [{"node_id": ..., "function": ..., "node_left": ..., "node_above": ...}, ...]
     */
    const[isLoading, setIsLoading] = useState(true);
    const backend_host = host;
    const api_to_fetch = `http://${backend_host}/api/room/information_tag?room_id=${room_id}`;
    const api_to_fetch_heatmap_data = `http://${backend_host}/api/room/kriging?room_id=${room_id}`;

    const dict_plan = {
        1: plan_409,
        2: plan_410,
        3: plan_409,
        4: plan_411,
    }

    const fetch_data_function = async (api, access_token, size_object, loadImage) =>
    {
        function render_size(room_x, room_y, node_x, node_y)
        {
            // 1. Get the real percentage center out in x and y axis, negative mean that node is in the left or above, positive is in contrast
            const real_center_x = room_x/2;
            const real_center_y = room_y/2;
            let real_percentage_x;
            let real_percentage_y; 
            real_percentage_x = node_x <= real_center_x ? Math.round(-100*(real_center_x-node_x)/real_center_x) : Math.round(100*(node_x-real_center_x)/real_center_x);
            real_percentage_y = node_y >= real_center_y ? Math.round(-100*(node_y-real_center_y)/real_center_y) : Math.round(100*(real_center_y-node_y)/real_center_y);
            // 2. Get the percentage of node when it is rendered, from left and from above, we adjust according to image_x and room_y
            let render_percentage_x;
            let render_percentage_y;
            render_percentage_x = real_percentage_x <= 0 ? Math.round((100 - (-1)*real_percentage_x)/2) : Math.round(50 + real_percentage_x/2);
            render_percentage_y = real_percentage_y <= 0 ? Math.round((100 - (-1)*real_percentage_y)/2) : Math.round(50 + real_percentage_y/2);
            return {render_percentage_x, render_percentage_y}
        }

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
        let data_response;
        try
        {
            response = await fetch(api, option_fetch);
        }
        catch(err)
        {
            console.log("Error happend while getting data. Error: " + err);
        }
        if(response && response.status === 200)
        {   
            data_response = await response.json();
            console.log(data_response);
            const {boxWidth, boxHeigth, currentImageWidth, currentImageHeigth} = size_object;
            const {x_length, y_length} = data_response["room_size"];
            let node_array_to_iterate = []
            node_array_to_iterate = data_response["node_info"]["sensor"].concat(data_response["node_info"]["actuator"])
            let new_nodePosition = [];
            node_array_to_iterate.forEach(node => {
                // [{"node_id": ..., "function": ..., "node_left": "...%", "node_above": "...%"}, ...]
                let new_item = {};
                new_item["node_id"] = node["node_id"];
                new_item["function"] = node["function"];
                let {render_percentage_x, render_percentage_y} = render_size(x_length, y_length, node["x_axis"], node["y_axis"]);
                new_item["node_left"] = render_percentage_x;
                new_item["node_above"] = render_percentage_y;
                new_item["node_id"] = node["node_id"];
                new_nodePosition.push(new_item);
            });
            setNodePosition(new_nodePosition);
            setIsLoading(false);
        }

        let data_heatmap = {};
        try
        {
            const heatmap_response = await fetch(api_to_fetch_heatmap_data, option_fetch);
            if(heatmap_response.status === 200)
            {
                data_heatmap = await heatmap_response.json();
            }
        }
        catch(err)
        {
            // alert("Error: <<<<<< " + err);
        }
        loadImage(data_heatmap);
    }


    const verify_and_get_data = async (fetch_data_function, callbackSetSignIn, backend_host, api_to_fetch, loadImage, size_object) => 
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
            fetch_data_function(api_to_fetch, token["access_token"], size_object, loadImage)
        }
        else
        {
            let verifyRefreshToken_response = null;
            verifyRefreshToken_response = await verifyRefreshToken();
            if(verifyRefreshToken_response === true)
            {
                fetch_data_function(api_to_fetch, token["access_token"], size_object, loadImage);
            }
            else
            {
                callbackSetSignIn(false);
            }
        }

    }

    useEffect(() => {
        let boxWidth;
        let boxHeigth;
        let currentImageWidth;
        let currentImageHeight;

        const handleResize = () => {
          const windowWidth = window.innerWidth;
          let width;
    
          if (windowWidth >= 1280) {
            width = 350; // Adjust the width for large screens
          } else if (windowWidth >= 960) {
            width = 350; // Adjust the width for medium screens
          } else {
            width = 300; // Adjust the width for small screens
          }
    
          setImageWidth(width);
          currentImageWidth = width;
          currentImageHeight = width;
        };
    
        handleResize(); // Initial resize check
    
        window.addEventListener("resize", handleResize);

        if(boxRef.current)
        {
            boxWidth = boxRef.current.offsetWidth;
            boxHeigth = boxRef.current.offsetHeight;
        }
        // alert(boxWidth);
        // alert(currentImageWidth);
        
        const loadImage = (heatmap_data) => {
            const imageElement = document.getElementById("heatmap-image");
            if(imageElement.complete) 
            {
                createHeatmap(imageElement, heatmap_data);
            } 
            else 
            {
                imageElement.addEventListener("load", () => {
                createHeatmap(imageElement);
                });
            }
        };
        
        const createHeatmap = (imageElement, heatmap_data) => {
        let heatmapInstance = h337.create({
            container: document.getElementById("heatmap-container"),
        });
        
        /**
         * @brief the x_axis and y_axis of heatmap point wil be filled from left to right and up to bot 
         */

        // Generate random data or use your own data
        let points = [];
        let [point_values, resolutionX, resolutionY] = [heatmap_data["data"], heatmap_data["resolutionX"], heatmap_data["resolutionY"]];
        let max = Math.round(Math.max(...point_values));
        let width_space = Math.round(imageElement.width/resolutionX);
        let height_space = Math.round(imageElement.height/resolutionY);
        let count = 0;
        for(let i=0; i<resolutionY; ++i){
            for(let j=0; j<resolutionX; ++j)
            {
                let val = Math.round(point_values[count]);
                ++count;
                let point = {
                    x: Math.floor(width_space*j) + 11,
                    y: Math.floor(imageElement.height-height_space*i)-25,
                    value: val,
                    };
                points.push(point);
            }
        }
        let data = {
            max: 40,
            data: points,
        };    
        heatmapInstance.setData(data);
        };

        verify_and_get_data(fetch_data_function, callbackSetSignIn, backend_host, api_to_fetch, loadImage,
            {boxWidth: boxWidth, boxHeigth: boxHeigth, currentImageWidth: currentImageWidth, currentImageHeight: currentImageHeight})
        // Clean up the event listener on component unmount
        return () => {
          window.removeEventListener("resize", handleResize);
        };
      },[]);

    return (
        <>
        {
            isLoading ? <h1>Loading...</h1> :
            <Box
            sx={{ 
                width: "100%", height: "100%", 
                position: "relative",
                }}
            // id="box_of_room_image"
            
            display="flex" 
            justifyContent="center" 
            >
                <Box
                    id="heatmap-container"
                    ref={boxRef}
                    sx={{ maxWidth: '100%'}}
                    justifyContent='center'
                >
                    <img
                        alt="profile-room"
                        src={dict_plan[room_id]}
                        style={{ 
                            rotate: '180deg',
                            maxWidth: `${imageWidth}px`,
                            height: 'auto',
                            cursor: "pointer", borderRadius: "0%" 
                        }}
                        id="heatmap-image"
                    />
                    {
                        nodePosition.map((node) => {
                            return (
                                    <Node node={node} imageWidth={imageWidth * 3/4 } imageHeight={imageWidth}/>
                            );
                        })
                    }
                </Box>
            </Box>
        }
        </>
        
    );
}


export default RoomMap;
