import { host } from '../../App'
import { Grid, Typography, Select, MenuItem, FormControl, InputLabel} from "@mui/material";
import { useState, useEffect } from 'react';
import Header from "../../components/Header";
import StatusActuator from './OptionsActuator/StatusActuator';
import SetTemperature from './OptionsActuator/SetTemperature';
import SetTimer from './OptionsActuator/SetTimer';


function ActuatorInfo({room_id, callbackSetSignIn, actuators}) {
  const backend_host = host
  const [idNode, setIdNode] = useState("")
  useEffect(() => {
    if (actuators.length > 0) {
      setIdNode(actuators[0].id);
    }
  }, [actuators]);
  return (
    <Grid container item textAlign='center'>
      <Grid item container xs={12} sm={12} md={12} textAlign="center" justifyContent='center' >
      <Typography variant="h3" sx={{fontWeight: "bold"}}> Actuator Info And Setting Mode </Typography>
      </Grid>
      <Grid item >
        <InputLabel sx={{ fontSize: "12px", color: "black",  marginTop: "10px", textAlign: "center"}}> Node Id </InputLabel>
        <Select
          value={idNode}
          onChange={(e) => setIdNode(e.target.value)}
          sx={{ width: 50, height: 30 }}
        >
          {actuators.map((node)=>
            <MenuItem value={node.id}>{node.id}</MenuItem>
          )}
        </Select>
        </Grid>
        <Grid container xs ={12} sx={{ width: "100%", marginTop: "10px" }}>
          <Grid item xs={6}>
            <Header title = "Actuator Status" fontSize="18px"/>
            <StatusActuator
              room_id={room_id}
              callbackSetSignIn={callbackSetSignIn}
              idNode={idNode}
            />
          </Grid>
          <Grid item xs={6}>
            <Header title = "Set Temperature" fontSize="18px"/>
            <SetTemperature/>
          </Grid>
        </Grid>
        <Grid container xs ={12} sx={{ width: "100%", marginTop: "10px" }} justifyContent="center">
          <Header title = "Set Time" fontSize="18px"/>
          <SetTimer/>
        </Grid>
    </Grid>
  )
}

export default ActuatorInfo