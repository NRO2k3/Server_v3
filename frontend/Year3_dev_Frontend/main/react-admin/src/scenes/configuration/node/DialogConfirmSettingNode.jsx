import * as React from 'react';
import { useState } from 'react';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import DialogConfirmSettingNewNode from './DialogConfirmSettingNewNode';
import DialogConfirmSettingNewNodeConfirm from './DialogConfirmSettingNewNodeConfirm';
import CloseIcon from '@mui/icons-material/Close';
import verifyAccessToken from '../../../function/verifyAccessToken';
import verifyRefreshToken from '../../../function/verifyRefreshToken';
import { host } from '../../../App';

const steps = ['Setting Node', 'Confirm'];

function getStepContent(step, setDataNodeSetting, dataNodeSetting) {
  switch (step) {
    case 0:
      return <DialogConfirmSettingNewNode setDataNodeSetting={setDataNodeSetting} 
                                        dataNodeSetting= {dataNodeSetting} 
                                        />;
    case 1:
      return <DialogConfirmSettingNewNodeConfirm dataNodeSetting={dataNodeSetting}/>;
    default:
      throw new Error('Unknown step');
  }
}

export default function DialogConfirmSettingNode({callbackSetSignIn, 
    NodeConfigLoading, 
    row, 
    configurationNodeAll, roomSize,
    }) 
{

    let remain_node_id_configurationNodeAll = [];

    if(configurationNodeAll !== undefined && configurationNodeAll.length > 0)
    {
        for(let i=0; i<configurationNodeAll.length; ++i)
        {
            if(configurationNodeAll[i].node_id != row.node_id)
            {
                remain_node_id_configurationNodeAll.push(configurationNodeAll[i].node_id);
            }
        }
    }

    const [dataNodeSetting, setDataNodeSetting] = useState({...row});
    const api = `http://${host}/api/configuration_node?node_id=${row.node_id}&room_id=${row.room_id}`;

    const settingNode = async (url, access_token, dataRoomSetting, NodeConfigLoading) => 
    {
        const headers = 
        {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token}`,
        }
        const option_fetch = 
        {
            "method": "PUT",
            "headers": headers,
            "body": JSON.stringify(dataRoomSetting),
        }
        const response = await fetch(url, option_fetch);
        if(response.status == 200)
        {
            const data_response = await response.json();
            alert("Update Successfully")
            NodeConfigLoading[1](!NodeConfigLoading[0]);
        }
        else
        {
            const data_response = await response.json();
            alert(data_response.Response)
            NodeConfigLoading[1](!NodeConfigLoading[0]);
        }
    }

    const verify_and_get_data = async (fetch_data_function, callbackSetSignIn, backend_host, url, dataRoomSetting, NodeConfigLoading) => 
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
            fetch_data_function(url, token["access_token"], dataRoomSetting, NodeConfigLoading)
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
                fetch_data_function(url, token["access_token"], dataRoomSetting, NodeConfigLoading);
            }
            else
            {
                callbackSetSignIn(false);
            }
        }

    }

    const [open, setOpen] = React.useState(false);

    const handleOpen = ()=> {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirm = () => {
        verify_and_get_data(settingNode, callbackSetSignIn, host, api, dataNodeSetting, NodeConfigLoading)
        setOpen(false);
    }


    const [activeStep, setActiveStep] = React.useState(0);
    const name_lookup = {
        node_id: "Node id",
        x_axis: "Position X",
        y_axis: "Position Y",
        function: "Funtion",
    }
    const handleNext = () => {
        let flag = 1;
        if(activeStep === 0 )
        {   console.log(dataNodeSetting)
            for(const prop in dataNodeSetting)
            {
                // if(dataNodeSetting[prop] === null)
                // {   
                //     alert(`You have to fill in ${name_lookup[prop]}!`);
                //     flag = 0;
                //     break;
                // }
                
                if(prop === "x_axis")
                {
                    if(parseInt(dataNodeSetting[prop]) < 0 || parseInt(dataNodeSetting[prop]) > roomSize.x)
                    {
                        alert(`Position x must be in range. Room size is (${roomSize.x}, ${roomSize.y})`);
                        flag = 0;
                        break;
                    }
                }
                if(prop === "y_axis")
                {
                    if(parseInt(dataNodeSetting[prop]) < 0 || parseInt(dataNodeSetting[prop]) > roomSize.y)
                    {
                        alert(`Position y must be in range. Room size is (${roomSize.x}, ${roomSize.y})`);
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
            verify_and_get_data(settingNode, callbackSetSignIn, host, api, dataNodeSetting, NodeConfigLoading);
            setActiveStep(0);
            handleClose();
        }
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    return (
        <div>
        <Button
                startIcon={<PermDataSettingIcon />}
                sx={{
                    backgroundColor: "#ed6c02",
                    fontSize: "10px",
                    fontWeight: "bold",
                    padding: "5px 12px",
                    }}
                variant="contained"

                onClick={()=>{
                    setOpen(true);
                }}
        >
            Setting
        </Button>
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            sx={{
                "& .MuiDialog-container": {
                    alignItems: "center",
                    justifyContent: "flex-start",
                },
            }}
        
        >
            <DialogTitle id="alert-dialog-title">
                <Box
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                >
                    <h2>Setting room record!</h2>
                    <Button onClick={handleClose}><CloseIcon/></Button>
                </Box>
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
                    {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                    ))}
                </Stepper>
                <React.Fragment>

                {getStepContent(activeStep, setDataNodeSetting, dataNodeSetting)}

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
            </DialogContentText>
            </DialogContent>
            
        </Dialog>
        </div>
    );
}
