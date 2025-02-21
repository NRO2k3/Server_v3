import React, {useState} from "react"
import { Box, useTheme } from "@mui/material"
import {Button} from "@mui/material";

const SmallFilter = ({setNumberOfData, setDataChart, setIsLoading}) => 
{
    const array_filter = [{"name": "1D", "value": 1},
                        {"name": "1W", "value": 2},
                        {"name": "1M", "value": 3},
                        {"name": "6M", "value": 4},
                        {"name": "1Y", "value": 5},]
    let time  = new Date().toLocaleTimeString()
    const theme = useTheme();
    const [ctime,setTime] = useState(time)
    const UpdateTime=()=>{
        time =  new Date().toLocaleTimeString()
        setTime(time)
    }
    setInterval(UpdateTime)
    return (
        <>
        {
            array_filter.map((i)=>{
                return (
                    <Button
                        sx={{
                            // backgroundColor: "black",
                            // padding: "5px 8px",
                            "min-width": "30px",
                            fontSize: "18px",
                            fontWeight: "bold",
                            }}
                            style={{
                                borderColor: theme.palette.text.primary,
                                color: theme.palette.text.primary,
                            }} 
                        value={i.value}
                        onClick={(e)=>{
                            setNumberOfData(e.target.value);
                            // setDataChart({co2: null, hum: null, temp: null, tvoc: null, light: null});
                            setIsLoading(true);
                            }}
                        variant="outlined"
                        size="small"
                        >{i.name}
                        </Button>
                );
            })
        }   
        <Box
        sx={{
            fontSize: "20px",
            fontWeight: 800,
            }}>{ctime}
        </Box>
        </>
    );
}

export default SmallFilter;