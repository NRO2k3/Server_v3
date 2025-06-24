import { React, useEffect, useState } from "react";
import { Grid, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import verify_and_get_data from "../../function/fetchData";
import { useTranslation } from "react-i18next";

const Energy = ({room_id, callbackSetSignIn, time_delay, backend_host}) =>{
    const url = `http://${backend_host}/api/energy_data?room_id=${room_id}`;
    const [isLoading, setIsLoading] = useState(true);
    const [energyData, setEnergyData] = useState(null);
    const colors = ['white', 'red', 'blue', 'green', 'orange', 'magenta', 'deepskyblue', 'black'];
    const preferMd = useMediaQuery('(max-width:900px)');    
    const theme = useTheme();
    const {t} = useTranslation()

    const define_energy_data = {
        'node_id': {'name': 'null', 'unit': null},
        'voltage': {'name': 'voltage', 'unit': 'V'},
        'current': {'name': 'current', 'unit': 'A'},
        'active_power': {'name': 'active_power', 'unit': 'W'},
        'power_factor': {'name': 'power_factor', 'unit': null},
        'frequency': {'name': 'frequency', 'unit': 'Hz'},
        'active_energy': {'name': 'active_energy', 'unit': 'kWh'},
        'time': {'name': null, 'unit': null},
    }
    const energy_data_property_array = Object.keys(define_energy_data);

    const get_energy_data = async (url, access_token) => 
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
        if (!response.ok) {
            console.error("HTTP Error:", response.status);
            return;
        }
        const data = await response.json();
        if (data) {
            let newEnergyData = {
                'voltage': null,
                'current': null,
                'active_power': null,
                'power_factor': null,
                'frequency': null,
                'active_energy': null,
                'time': null
            }
            energy_data_property_array.forEach((each_key, index) => {
                let fetch_data = data[index];
                // if data is invaild, send get data API request again
                switch (index) {
                    case 0: return; // skip node id
                    case 1: 
                        if (fetch_data > 240 || fetch_data < 200) {
                            fetch_data = 'NULL';
                        }
                        break;
                    case 2:
                    case 3:
                    case 6:
                        if (fetch_data < 0) {
                            fetch_data = 'NULL';
                        }
                        break;
                    case 4:
                        if (fetch_data < 0 || fetch_data > 1) {
                            fetch_data = 'NULL';
                        }
                        break;
                    case 5:
                        if (fetch_data < 0 || fetch_data > 100) {
                            fetch_data = 'NULL';
                        }
                        break;
                    case 7:
                        if (fetch_data < 0) {
                            fetch_data = 'NULL';
                        }
                        else fetch_data = parseInt(fetch_data);
                        break;
                }
                newEnergyData[each_key] = fetch_data;
            })
            setIsLoading(false);
            setEnergyData(newEnergyData);
        }
        else {
            console.log("Some error happened, try to reload page!");
        }
        setIsLoading(false);
    }

    useEffect(() => {
        if(time_delay !== 0)
        {
            if(energyData === null)            //!< this is for the total component always render the first time and then the next time will be setTimeOut
            {
                verify_and_get_data(get_energy_data, callbackSetSignIn, backend_host, url);
            }
            else
            {
                const timer = setTimeout(()=>{
                        verify_and_get_data(get_energy_data, callbackSetSignIn, backend_host, url); 
                    }, time_delay);
                return () => clearTimeout(timer);
            }
        }
        else
        {
            verify_and_get_data(get_energy_data, callbackSetSignIn, backend_host, url); 
        }
    },[energyData])

    return (
        <>
        {
            isLoading ? <h1>Loading...</h1> :
            <Grid container item textAlign='center' paddingTop={preferMd ? 0 : 0.5} 
            justifyContent='center'>
                <Grid item xs={12} sm={12} md={12} textAlign="center" my={0.25} >
                    <Typography fontWeight="bold" fontSize='24px'>
                        {t("energydata")}
                    </Typography>
                </Grid>
                <Grid item container spacing={1} px='10px' marginBottom={0.5} justifyContent='center'>
                    {energy_data_property_array.map((value, index) => {
                        if (index !== 0 && index !==7)
                        return (
                            <Grid item xs={4}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxShadow: 0 }}>
                            <Paper style={{ flex: 1, backgroundColor: theme.palette.background.paper, padding: '10px'}} sx={{ boxShadow: "0px 0px 0px 0px", border: `1px solid ${theme.palette.grey[400]}`}}>
                                <Grid container display="flex" flexDirection="column" justifyItems='center' textAlign='center'>
                                    <Grid container item justifyContent='center' alignContent='center'>
                                        <Typography variant='h5'>{t(define_energy_data[value]['name'])}</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant='h4' fontWeight='bold'>
                                            {((temp) => {
                                                if (energyData[value] == 'NULL' || index == 4) temp = energyData[value];
                                                else temp = `${energyData[value]} ${define_energy_data[value]['unit']}`
                                                return temp;
                                            })()}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                            </div>
                        </Grid>
                        )
                    })}
                </Grid>
                <Grid xs={12} textAlign='center' spacing={1} marginY={1}>
                    <Typography textAlign='center' variant='h5'>updated on {
                                            (()=>{
                                                const new_time = energyData["time"];
                                                const utcDate = new Date(new_time * 1000); // Convert seconds to milliseconds
                                                const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
                                                const formattedDateTime = utcDate.toLocaleDateString('en-US', options);

                                                return formattedDateTime;
                                            })()   //run this function
                                        }
                    </Typography>
                </Grid>
            </Grid>
        }
        </>
    );
}

export default Energy;