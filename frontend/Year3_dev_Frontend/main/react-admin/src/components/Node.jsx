import Header from "./Header";
import { Box } from "@mui/material";
import plan from "../assets/plan.svg";
import {Button, useMediaQuery} from "@mui/material";
import { host } from "../App";
import { useState, useEffect, useRef } from "react";

export default function Node({node, imageWidth, imageHeight})
{
    const description = node["function"];
    console.log(node);
    const [popUp, setPopUp] = useState(false);
    const { node_left, node_above } = node;

    const absoluteLeft = (node_left / 100) * imageWidth;
    const absoluteTop = (node_above / 100) * imageHeight;
    return (
        <Button
            style={{
                position: 'absolute',
                left: absoluteLeft,
                top: absoluteTop,
                borderRadius: '50%',
                width: '50px',
                height: '60px',
                backgroundColor: node.function === 'sensor' ? 'red' : 'orange',
                zIndex: 1,
                fontSize: '30px',
                border: '1px solid',
            }}
            onMouseOver={(e)=>
                {
                    setPopUp(true);
                }}
            onMouseOut={(e)=>
                {
                    setPopUp(false);
                }}
        >
            {
            popUp && (
                <div
                style={{
                    borderRadius: "0%",
                    display: "block",
                    position: "absolute",
                    top: "0px",
                    left: "0px",
                    padding: "10px",
                    backgroundColor: "#f1f1f1",
                    border: "1px solid #ccc",
                    zIndex: 2,
                    fontSize: "15px",
                    // width: "20px", height: "20px"
                }}
                >
                    {description}
                </div>
                )
            } 
                {node["node_id"]}
        </Button>
    )
}