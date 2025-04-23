import { host } from '../../App'
import { Grid, Typography, Select, MenuItem, Paper, InputLabel} from "@mui/material";
import { useState, useEffect } from 'react';
import Header from "../../components/Header";
import StatusActuator from './OptionsActuator/StatusActuator';
import SetTemperature from './OptionsActuator/SetTemperature';
import SetTimer from './OptionsActuator/SetTimer';


function ActuatorInfo({room_id, callbackSetSignIn, actuators}) {
  const [status, setStatus] = useState(false);
  const [idNode, setIdNode] = useState("")
  useEffect(() => {
    if (actuators.length > 0) {
      setIdNode(actuators[0].id);
    }
  }, [actuators]);
  return (
    <Grid container textAlign='center'>
      <Grid container xs={12} sm={12} md={12} textAlign="center" justifyContent='center' >
      <Typography variant="h3" sx={{fontWeight: "bold"}}> Actuator Info And Setting Mode </Typography>
      </Grid>
      <Grid item sx={{mt:1}}>
        <InputLabel sx={{ fontSize: "14px", color: "black",  marginTop: "0px", textAlign: "center", justifyContent: "center", fontWeight: "bold"}}> Node Id </InputLabel>
        <Select
          value={idNode}
          onChange={(e) => setIdNode(e.target.value)}
          sx={{ width: 50, height: 30, fontWeight: "bold" }}
        >
          {actuators.map((node)=>
            <MenuItem value={node.id}>{node.id}</MenuItem>
          )}
        </Select>
        </Grid>
        <Grid container xs ={12} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <Header title = "Actuator Status" fontSize="18px"/>
              <StatusActuator
                room_id={room_id}
                callbackSetSignIn={callbackSetSignIn}
                idNode={idNode}
                status={status}
                setStatus={setStatus}
              />
          </Grid>
          <Grid item xs={6}>
            <Header title = "Set Temperature" fontSize="18px"/>
            <SetTemperature
              room_id={room_id}
              callbackSetSignIn={callbackSetSignIn}
              idNode={idNode}
              status={status}
            />
          </Grid>
        </Grid>
        <Grid container xs ={12} sx={{ marginTop: "20px" }} justifyContent="center">
          <Header title = "Set Time Air Conditioner" fontSize="20px"/>
          <SetTimer/>
        </Grid>
    </Grid>
  )
}

export default ActuatorInfo