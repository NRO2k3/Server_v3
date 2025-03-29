import React from 'react'
import { Grid, Typography } from '@mui/material'
import { GiClick } from "react-icons/gi";
import SensorInfo from './SensorInfo';
import ActuatorInfo from './ActuatorInfo';

function DetailNode({room_id, callbackSetSignIn, listNode}) {

  const sensors = listNode.filter((node) => node.type === "sensor")
  const actuators = listNode.filter((node) => node.type === "actuator")
  const sensor_exists = sensors.length > 0
  const actuator_exists = actuators.length > 0
  console.log(sensors, actuators)
  return (
    <Grid container direction="column" spacing={2} style={{ height: "100%" }}>

      { sensor_exists ?
        <Grid item xs={6}>
          <SensorInfo
            room_id = {room_id}
            callbackSetSignIn = {callbackSetSignIn}
            sensors = {sensors}
          />
        </Grid> :
          <Grid item xs={6}
          style={{
            border: "1px solid gray",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            textAlign: "center",
            borderRadius: "15px",
          }}
        >
          <Typography variant="h2" color="error" fontWeight="bold">
            No Sensor Node has been selected.
          </Typography>
          <Typography variant="h2" color="textSecondary">
            Loading... Please wait!
          </Typography>
          <GiClick size={150} style={{ marginTop: "100px", color: "#d32f2f" }} />
          </Grid>
      }

      { actuator_exists ?
        <Grid item xs={6}>
          <ActuatorInfo/>
        </Grid>:
          <Grid item xs={6}
          style={{
            border: "1px solid gray",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            textAlign: "center",
            borderRadius: "15px",
          }}
        >
          <Typography variant="h2" color="error" fontWeight="bold">
            No Actuator Node has been selected.
          </Typography>
          <Typography variant="h2" color="textSecondary">
            Loading... Please wait!
          </Typography>
          <GiClick size={150} style={{ marginTop: "100px", color: "#d32f2f" }} />
          </Grid>
      }
      
  </Grid>
  )
}

export default DetailNode