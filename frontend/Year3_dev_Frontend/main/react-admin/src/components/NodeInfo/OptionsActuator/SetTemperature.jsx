import { useState, useEffect } from "react";
import { Box, Grid, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from "@mui/material";
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';

function SetTemperature({room_id, callbackSetSignIn, idNode, status}) {

  const [temperature, setTemperature] = useState(16);
  const [open, setOpen] = useState(false);
  const handleIncreTemp = () => {
    if (temperature === 30) setTemperature(30);
    else setTemperature(temperature + 1);
  }
  const handleDecreTemp = () => {
    if (temperature === 16) setTemperature(16);
    else setTemperature(temperature - 1);
  }

  const handleAccept = () => {
      setOpen(false);
      alert("Temperature accepted!");
  };
  
  return (
    <Grid container xs={12} sx={{ mt: 3.5 }} alignItems="center" justifyContent="center" spacing={1}>
      <Grid item xs={6} display="flex" justifyContent="center">
        <Button sx={{
          height:'60px',
          borderRadius: '50%',
          border: "2px solid",
          borderColor: "black",
          background: "aqua"
        }}>
          <h2 style={{ margin: 0}}>{temperature}&nbsp;°C</h2>
        </Button>
      </Grid>
      <Grid item xs={6} display="flex" flexDirection="column" justifyContent="center" gap={1}>
        <Button sx={{
          width: "5px",
          height: "40px",
        }}
          onClick={handleIncreTemp}
        >
          <ArrowCircleUpIcon sx={{ fontSize: "2.5rem" }}/>
        </Button>
        <Button sx={{
          width: "5px",
          height: "40px",
        }}
        onClick={handleDecreTemp}
        >
          <ArrowCircleDownIcon sx={{ fontSize: "2.5rem" }}/>
        </Button>
      </Grid>
        { status === true
        ?
        <>
          <Button
          sx={{
                mt:2.5,
                borderRadius: 2,
                width: "10px",
                height: "40px",
              }}
          variant="contained"
          onClick={()=> setOpen(true)}
          >
          Send
        </Button>
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth='xs'
            fullWidth
            PaperProps={{
              sx: {
                position: "absolute",
                right: 20,
                top: "50%",
                transform: "translateY(-50%)",
                width: "300px",
                borderRadius: "10px"
              }
            }}
        >
            <DialogTitle id="alert-dialog-title" variant="h4" fontWeight='bold'>
            {"Confirm set temperature"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description" variant="h5">
                    {`Are you sure to set temperature at ${temperature}°C ?`}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button style={{fontSize: '14px'}} onClick={() => setOpen(false)}>Disagree</Button>
                <Button style={{fontSize: '14px'}} onClick={handleAccept} autoFocus>Agree</Button>
            </DialogActions>
        </Dialog>
        </>
        : <h3>Actuator is OFF</h3>}
    </Grid>
  )
}
export default SetTemperature
