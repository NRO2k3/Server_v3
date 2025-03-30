import { useState, useEffect } from "react";
import verify_and_get_data from "../../../function/fetchData";
import { host } from "../../../App";
import { Box, Grid, Button} from "@mui/material";
import ThermostatIcon from '@mui/icons-material/Thermostat';
import Header from "../../Header";

function StatusActuator({room_id, callbackSetSignIn, idNode}) {
  const [status, setStatus] = useState(false);
  const [speed, setSpeed] = useState(0);
  const url = idNode ? `http://${host}/api/actuator_status?room_id=${room_id}&node_id=${idNode}` : null;

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
      <Grid container xs={12} alignItems="center" justifyContent="center" spacing={2} sx={{ marginTop: "20px" }}>
        <Grid item xs={6} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Button
            sx={{
              width: '50px',
              height: '60px',
              borderRadius: '50%',
              border: "solid 2px",
              backgroundColor: status == 0 ? 'red' : "green",
            }}
          >
            <h3>{status == 0 ? "Off" : "On"}</h3>
          </Button>
        </Grid>

        <Grid item xs={6} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <ThermostatIcon style={{ fontSize: '3rem' }} />
            <Header title={`Temperature ${speed}\u00B0C`} fontSize="15px"/>
          </Box>
        </Grid>
      </Grid>

  )
}

export default StatusActuator
