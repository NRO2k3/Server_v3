import * as React from 'react';
import { useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NewRoom from './NewRoom';
import Confirm from './Confirm';
import { host } from '../../../App';

const steps = ['Create Room', 'Confirm'];

function getStepContent(step, setDataCreateRoom, dataCreateRoom) {
  switch (step) {
    case 0:
      return <NewRoom setDataCreateRoom={setDataCreateRoom} dataCreateRoom= {dataCreateRoom}/>;
    case 1:
      return <Confirm dataCreateRoom={dataCreateRoom}/>;
    default:
      throw new Error('Unknown step');
  }
}




export default function RoomChange({configurationRoomAll, callbackSetSignIn, RoomConfigLoading}) {
    const api = `http://${host}/api/configuration_room`;
    const createNewRoom = async (url, access_token, data, RoomConfigLoading) => 
    {
        const headers = 
        {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token}`,
        }
        const option_fetch = 
        {
            "method": "POST",
            "headers": headers,
            "body": JSON.stringify(data),
        }
        const response = await fetch(url, option_fetch);
        if(response.status == 201)
        {
            const data_response = await response.json();
            alert(data_response.Response)
            RoomConfigLoading[1](!RoomConfigLoading[0]);
        }
        else
        {
            const data_response = await response.json();
            alert(data_response.Response)
            RoomConfigLoading[1](!RoomConfigLoading[0]);
        }
    }

    const verify_and_get_data = async (fetch_data_function, callbackSetSignIn, backend_host, url, data, RoomConfigLoading) => 
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
            fetch_data_function(url, token["access_token"], data, RoomConfigLoading)
        }
        else
        {
            let verifyRefreshToken_response = null;
            try
            {
                verifyRefreshToken_response = await verifyRefreshToken();
            }
            catch(err)
            {
                alert(err);
            }
            if(verifyRefreshToken_response === true)
            {
                fetch_data_function(url, token["access_token"], data, RoomConfigLoading);
            }
            else
            {
                callbackSetSignIn(false);
            }
        }

    }
    const [dataCreateRoom, setDataCreateRoom] = useState({
                                                        "room_id": null, 
                                                        "construction_name": null,
                                                        "x_length": null,
                                                        "y_length": null, 
                                                        "information": null,
                                                        });
    const [activeStep, setActiveStep] = React.useState(0);
    const name_lookup = {
        room_id: "Room id",
        construction_name: "Construction name",
        x_length: "Width",
        y_length: "Length",
        information: "Information",
    }
    const handleNext = () => {
        let flag = 1;
        if(activeStep === 0 )
        {
            for(const prop in dataCreateRoom)
            {
                if(dataCreateRoom[prop] === null)
                {   
                    alert(`You have to fill in ${name_lookup[prop]}!`);
                    flag = 0;
                    break;
                }
                if(prop === "room_id")
                {
                    for(let i=0; i<configurationRoomAll.length; ++i)
                    {
                        if((configurationRoomAll[i].room_id).toString() === dataCreateRoom[prop].toString())
                        {
                            alert("Room id've already existed!");
                            flag = 0;
                            break;
                        }
                    }
                }
                if(prop === "x_length" || prop === "y_length")
                {
                    if(parseInt(dataCreateRoom[prop]) < 0 || parseInt(dataCreateRoom[prop]) > 1000)
                    {
                        alert("Size must be lower than 100 and greater than 0");
                        flag = 0;
                        break;
                    }
                }
            }
            if(flag === 1)
            {
                setActiveStep(activeStep + 1);
            }
        }
        else if(activeStep === steps.length - 1)
        {
            verify_and_get_data(createNewRoom, callbackSetSignIn, host, api, dataCreateRoom, RoomConfigLoading);
            setActiveStep(0);
            setDataCreateRoom({
                "room_id": null, 
                "construction_name": null,
                "x_length": null,
                "y_length": null, 
                "information": null,
                });
        }
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };


    return (
        <React.Fragment>
        <CssBaseline />
        <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
            <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
            <Typography component="h1" variant="h3" align="center">
                New Room
            </Typography>
            <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
                {steps.map((label) => (
                <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                </Step>
                ))}
            </Stepper>
                <React.Fragment>

                {getStepContent(activeStep, setDataCreateRoom, dataCreateRoom)}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {activeStep !== 0 && (
                    <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                        Back
                    </Button>
                    )}

                    <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 3, ml: 1 }}
                    >
                    {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                    </Button>
                </Box>
                </React.Fragment>
            </Paper>
        </Container>
        </React.Fragment>
    );
}