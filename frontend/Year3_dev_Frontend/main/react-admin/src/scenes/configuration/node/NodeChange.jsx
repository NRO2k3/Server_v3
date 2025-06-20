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
import NewNode from './NewNode';
import ConfirmNode from './ConfirmNode';
import { host } from '../../../App';
import verifyAccessToken from '../../../function/verifyAccessToken';
import verifyRefreshToken from '../../../function/verifyAccessToken';

const steps = ['Create Node', 'Confirm'];

function getStepContent(step, setDataCreateNode, dataCreateNode) {
  switch (step) {
    case 0:
      return <NewNode setDataCreateNode={setDataCreateNode} dataCreateNode= {dataCreateNode}/>;
    case 1:
      return <ConfirmNode dataCreateNode={dataCreateNode}/>;
    default:
      throw new Error('Unknown step');
  }
}




export default function NodeChange({configurationNodeAll, callbackSetSignIn, nodeConfigLoading, roomIdForNodeConfig, roomSize}) {
    const api = `http://${host}/api/configuration_node`;
    const createNewNode = async (url, access_token, data, nodeConfigLoading) => 
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
            "body": JSON.stringify({...data, "room_id": roomIdForNodeConfig, "z_axis": '2'}),
        }
        const response = await fetch(url, option_fetch);
        if(response.status == 200)
        {
            const data_response = await response.json();
            alert(`${data_response.Response}`);
            nodeConfigLoading[1](!nodeConfigLoading[0]);
        }
        else
        {
            const data_response = await response.json();
            alert(`${data_response.Response} Error code: ${response.status} ${response.statusText}`);
            nodeConfigLoading[1](!nodeConfigLoading[0]);
        }
    }

    const verify_and_get_data = async (fetch_data_function, callbackSetSignIn, backend_host, url, data, NodeConfigLoading) => 
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

        const  verifyAccessToken_response = await verifyAccessToken(backend_host, token);

        if(verifyAccessToken_response === true)
        {
            // const response = await fetch(url)
            // const data = await response.json()
            fetch_data_function(url, token["access_token"], data, NodeConfigLoading)
        }
        else
        {
            let verifyRefreshToken_response = null;
            try
            {
                verifyRefreshToken_response = await verifyRefreshToken(backend_host, token);
            }
            catch(err)
            {
                console.log(err);
            }
            if(verifyRefreshToken_response === true)
            {
                fetch_data_function(url, token["access_token"], data, NodeConfigLoading);
            }
            else
            {
                callbackSetSignIn(false);
            }
        }

    }
    const [dataCreateNode, setDataCreateNode] = useState({
                                                        "x_axis": null,
                                                        "y_axis": null,
                                                        "function": null,
                                                        "mac": null,
                                                        });
    const [activeStep, setActiveStep] = React.useState(0);
    const name_lookup = {
        "x_axis": "Position X",
        "y_axis": "Position Y",
        "function": "Function",
        "mac": "Mac address",
    }
    const handleNext = () => {
        let flag = 1;
        if(activeStep === 0 )
        {
            for(const prop in dataCreateNode)
            {
                if(dataCreateNode[prop] === null)
                {   
                    alert(`You have to fill in ${name_lookup[prop]}!`);
                    flag = 0;
                    break;
                }
                if(prop === "mac")
                {
                    for(let i=0; i<configurationNodeAll.length; ++i)
                    {
                        if((configurationNodeAll[i].node_id).toString() === dataCreateNode[prop].toString())
                        {
                            alert("Mac address've already existed!");
                            flag = 0;
                            break;
                        }
                    }
                }
                if(prop === "x_axis")
                {
                    if(parseInt(dataCreateNode[prop]) < 0 || parseInt(dataCreateNode[prop]) > roomSize.x)
                    {
                        alert(`Position x must be in range! Room size is (${roomSize.x}, ${roomSize.y})`);
                        flag = 0;
                        break;
                    }
                }if(prop === "y_axis")
                {
                    if(parseInt(dataCreateNode[prop]) < 0 || parseInt(dataCreateNode[prop]) > roomSize.y)
                    {
                        alert(`Position y must be in range! Room size is (${roomSize.x}, ${roomSize.y})`);
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
            verify_and_get_data(createNewNode, callbackSetSignIn, host, api, {...dataCreateNode, room_id: roomIdForNodeConfig}, nodeConfigLoading);
            setActiveStep(0);
            setDataCreateNode({
                "x_axis": null,
                "y_axis": null,
                "function": null,
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
                New Node
            </Typography>
            <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
                {steps.map((label) => (
                <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                </Step>
                ))}
            </Stepper>
                <React.Fragment>

                {getStepContent(activeStep, setDataCreateNode, dataCreateNode)}

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