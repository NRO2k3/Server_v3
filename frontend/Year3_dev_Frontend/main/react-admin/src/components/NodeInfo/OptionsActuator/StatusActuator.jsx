import { useState, useEffect } from "react";
import verify_and_get_data from "../../../function/fetchData";
import { host } from "../../../App";
import { Box, Grid, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from "@mui/material";
import ThermostatIcon from '@mui/icons-material/Thermostat';
import Header from "../../Header";
import { accessToken } from "mapbox-gl";

function StatusActuator({room_id, callbackSetSignIn, idNode, status, setStatus, selectFunction}) {
  const [speed, setSpeed] = useState(0);
  const [open, setOpen] = useState(false);

  const url = idNode ? `http://${host}/api/actuator_status?room_id=${room_id}&node_id=${idNode}` : null;

  const handleAgree = async() => {
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
          "status": status ? 0 : 1
        }),
    }
    await fetch(`http://${host}/api/set_actuator`, fetch_option);
};
  const getStatusActuator = async (url, access_token) => {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access_token}`,
    }
    const fetch_option = {
        "method": "GET",
        "headers": headers,
        "body": null,
    }
    const response = await fetch(url, fetch_option);

    if(response.status === 200){
      const data = await response.json()
      if(data["state"] === 1 && data["current_value"] > 0){
        setStatus(true);
        setSpeed(data["current_value"])
      }
    }
    else{
        alert("Some error happened, try to reload page!");
    }
  }

  useEffect(()=>{
        if (!url) return;
        verify_and_get_data(getStatusActuator, callbackSetSignIn, host, url);
        const timer = setTimeout(()=>{
            verify_and_get_data(getStatusActuator, callbackSetSignIn, host, url);
        }, 10000);
        return () => clearTimeout(timer)
    },[url]);

  return (
      <Grid container item xs={12} alignItems="center" justifyContent="center" spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={6} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Button
            sx={{
              width: '50px',
              height: '60px',
              borderRadius: '50%',
              border: "solid 2px",
              backgroundColor: status === 0 ? 'red' : "green",
            }}
            onClick={()=>setOpen(true)}
          >
            <h3>{status === 0 ? "Off" : "On"}</h3>
          </Button>
        </Grid>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="xs"
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
          <DialogTitle id="alert-dialog-title" variant="h5" fontWeight="bold">
            {status ? "Confirm Turn OFF" : "Confirm Turn ON"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {status ? "Are you sure to turn off?" : "Are you sure to turn on?"}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button sx={{ fontSize: 14 }} onClick={() => setOpen(false)}>Disagree</Button>
            <Button sx={{ fontSize: 14 }} onClick={handleAgree} autoFocus>Agree</Button>
          </DialogActions>
        </Dialog>
        <Grid item xs={6} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <ThermostatIcon style={{ fontSize: '3rem' }} />
            <Header title={`Temperature ${speed}\u00B0C`} fontSize="13px"/>
          </Box>
        </Grid>
      </Grid>

  )
}

export default StatusActuator
