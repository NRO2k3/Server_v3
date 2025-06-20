import React, {useState, useEffect} from "react"
import { Box, Stack, Typography } from "@mui/material"
import Grid from "@mui/material/Grid"
import {host} from "../App"
import VictoryLineChart from "../components/VictoryChart/VictoryLineChart"
import Header from "../components/Header"
import SmallFilter from "./SmallFilter";
import Container from "@mui/material/Container";
import FilterNode from "../components/RoomMap/FilterNode";
import FilterParameter from "../components/RoomMap/FilterParameter";
import verify_and_get_data from "../function/fetchData"
import { useTranslation } from "react-i18next"

const Chart = ({room_id, callbackSetSignIn, timedelay, optionData, apiInformationTag}) => {
    const {t} = useTranslation()
    const [isLoading, setIsLoading] = useState(true)
    const [numberOfData, setNumberOfData] = useState(1);
    const [dataChart, setDataChart] = useState({co2: null, hum: null, temp: null, tvoc: null, light: null, dust: null, time: null});
    const para_filter_dict = {0: "all", 1: "temp", 2: "hum", 3: "co2", 4: "tvoc", 5: "light", 6: "dust"};
    const backend_host = host;
    const [paraFilter, setParaFilter] = useState(1);
    const [nodeIdFilter, setNodeIdFilter] = useState(0);
    const url = `http://${backend_host}/api/enviroment_chart?room_id=${room_id}&filter=${numberOfData}&node_id=${nodeIdFilter}`;

    const get_chart_data = async (url, access_token) => 
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
        if(response.status === 200)
        {
            const data = await response.json();
            const key = ["co2", "temp", "hum", "light", 
            "dust", "sound", "red", "green", 
            "blue", "tvoc", "motion", "time",];
            let newDataChart = {};
            key.forEach((i) => {
                if(i in data)
                {
                    newDataChart[i] = data[i]; 
                }
                else
                {
                    newDataChart[i] = [0];
                }
            })
            setDataChart(newDataChart);
            setIsLoading(false)
        }
        else
        {
            const key = ["co2", "temp", "hum", "light", 
            "dust", "sound", "red", "green", 
            "blue", "tvoc", "motion", "time",];
            let newDataChart = {};
            key.forEach((i) => {
                newDataChart[i] = [0]; 
            })
            setDataChart(newDataChart);
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if(timedelay === 0)
        {
            verify_and_get_data(get_chart_data, callbackSetSignIn, host, url);
        }
        else
        {
            if(dataChart.temp === null)
            {
                verify_and_get_data(get_chart_data, callbackSetSignIn, host, url);
            }
            else
            {
                const timer = setTimeout(()=>{
                    verify_and_get_data(get_chart_data, callbackSetSignIn, host, url);
                }, timedelay);
                return () => clearTimeout(timer);
            }
        }
    },[isLoading, dataChart])

    return (
        <>
        <Grid container textAlign='center' justifyContent='center'>
            <Grid container display='flex' flexDirection='column' justifyContent='center' xs={12} marginY={1}>
                <Grid item>
                    <Typography component='span' textAlign='center' fontSize='20px' >
                        {t("titlechartenv")}
                    </Typography>
                </Grid>
                <Grid item marginX={4}>
                    <Stack justifyContent='space-between' alignItems='center' direction='row'>
                        <Stack spacing={1} direction='row' justifyContent='flex-start'>
                            <Box>
                                <FilterNode setNodeIdFilter={setNodeIdFilter}
                                        apiInformationTag={apiInformationTag} 
                                        callbackSetSignIn={callbackSetSignIn}
                                        backend_host={backend_host}
                                        setIsLoadingChart={setIsLoading}
                            />
                            </Box>
                            <FilterParameter setParaFilter={setParaFilter}/>
                        </Stack>
                        <Stack direction='row' justifyContent='flex-end' alignItems='center' pr={2} spacing={1}>
                            <SmallFilter setNumberOfData={setNumberOfData} setDataChart={setDataChart} setIsLoading={setIsLoading}/>
                        </Stack>
                    </Stack>
                </Grid>
            </Grid>
            <Grid style={{ width: '100%'}}>
                {
                    isLoading ? <h1>Loading chart...</h1> :
                    <VictoryLineChart 
                        data_x={dataChart["time"]}
                        data_y={dataChart[para_filter_dict[paraFilter]]}
                        option_data={optionData}
                        parameter_type={paraFilter}
                    />
                }
            </Grid>
        </Grid>
        </>
    );
}

export default Chart;