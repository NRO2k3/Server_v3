import { useState, useEffect } from "react";
import { Box, Grid, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Slider, Typography} from "@mui/material";
import { host } from "../../../App";

function SetLight({room_id, callbackSetSignIn, idNode, status, selectFunction}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(50);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleAccept = async() => {
      setOpen(false);
      const access_token =localStorage.getItem("access");
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`,
      }
      const fetch_option = {
          "method": "POST",
          "headers": headers,
          "body": JSON.stringify({
            "room_id": room_id,
            "node_id": idNode,
            "function": selectFunction,
            "mode": "manual",
            "status": status ? 1 : 0,
            "setpoint": value
          }),
      }
      await fetch(`http://${host}/api/set_actuator`, fetch_option);
  };
  
  return (
    <Grid container xs={12} sx={{ mt: 2 }} alignItems="center" justifyContent="center" spacing={1}>
      <Grid item>
        <Typography sx={{ fontWeight: 'bold' }}>Light Percent: {value}%</Typography>
        <Slider
          value={value}
          onChange={handleChange}
          aria-label="Default"
          valueLabelDisplay="auto"
          min={0}
          max={100}
          step={25}
        />
      </Grid>
      { status === true
        ?
        <Grid item>
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
            {"Confirm set light"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description" variant="h5">
                    {`Are you sure to set light at ${value}% ?`}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button style={{fontSize: '14px'}} onClick={() => setOpen(false)}>Disagree</Button>
                <Button style={{fontSize: '14px'}} onClick={handleAccept} autoFocus>Agree</Button>
            </DialogActions>
        </Dialog>
        </Grid>
        : <h3>Actuator is OFF</h3>}
    </Grid>
  )
}

export default SetLight;