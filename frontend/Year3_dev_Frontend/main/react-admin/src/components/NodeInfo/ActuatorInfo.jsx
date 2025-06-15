import { host } from '../../App'
import { Grid, Typography, Select, MenuItem, Paper, InputLabel} from "@mui/material";
import { useState, useEffect } from 'react';
import Header from "../../components/Header";
import StatusActuator from './OptionsActuator/StatusActuator';
import SetTemperature from './OptionsActuator/SetTemperature';
import SetTimer from './OptionsActuator/SetTimer';
import { useTranslation } from 'react-i18next';
import SetLight from './OptionsActuator/SetLight';

function ActuatorInfo({room_id, callbackSetSignIn, actuators}) {
  const {t} = useTranslation()
  const [status, setStatus] = useState(false);
  const [idNode, setIdNode] = useState("")
  const [selectFunction, setSelectFunction] = useState("Air")
  const [type, setType] = useState("Panasonic")
  useEffect(() => {
    if (actuators.length > 0) {
      setIdNode(actuators[0].id);
    }
  }, [actuators]);
  return (
    <Grid container item textAlign='center'>

      <Grid item xs={12} sm={12} md={12} textAlign="center" justifyContent='center' >
        <Typography variant="h3" sx={{fontWeight: "bold"}}> Actuator Info And Setting Mode </Typography>
      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={1}>
          <Grid item>
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
          <Grid item>
            <InputLabel sx={{ fontSize: "14px", color: "black",  marginTop: "0px", textAlign: "center", justifyContent: "center", fontWeight: "bold"}}> Function </InputLabel>
            <Select
              value={selectFunction}
              onChange={(e) => setSelectFunction(e.target.value)}
              sx={{ width: 80, height: 30, fontWeight: "bold" }}
            >
                <MenuItem value="Air">Air</MenuItem>
                <MenuItem value="Light">Light</MenuItem>
            </Select>
          </Grid>
          {/* {selectFunction === "Air"?
          <Grid item>
            <InputLabel sx={{ fontSize: "14px", color: "black",  marginTop: "0px", textAlign: "center", justifyContent: "center", fontWeight: "bold"}}> Type </InputLabel>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              sx={{ width: 120, height: 30, fontWeight: "bold" }}
            >
                <MenuItem value="Panasonic">Panasonic</MenuItem>
                <MenuItem value="Daikin">Daikin</MenuItem>
                <MenuItem value="LG">LG</MenuItem>
            </Select>
          </Grid>
          :  null } */}
        </Grid>
      </Grid>

      <Grid item container direction='row' xs ={12} sx={{ mt: 1 }} justifyContent="space-around">
        <Grid item xs={5.5} sx={{
            border: '1px solid black',
            borderRadius: '8px',
            padding: 1,
          }}>
          <Header title = "Actuator Status" fontSize="18px"/>
            <StatusActuator
              room_id={room_id}
              callbackSetSignIn={callbackSetSignIn}
              idNode={idNode}
              status={status}
              setStatus={setStatus}
              selectFunction={selectFunction}
            />
        </Grid>
        {selectFunction === "Air"?
        <Grid item xs={5.5}
        sx={{
          border: '1px solid black',
          borderRadius: '8px',
          padding: 2
        }}>
          <Header title = "Set Temperature" fontSize="18px"/>
          <SetTemperature
            room_id={room_id}
            callbackSetSignIn={callbackSetSignIn}
            idNode={idNode}
            status={status}
            selectFunction={selectFunction}
          />
        </Grid>:
        <Grid item xs={5.5}
        sx={{
          border: '1px solid black',
          borderRadius: '8px',
          padding: 2
        }}
        >
        <Header title = "Set Light" fontSize="18px"/>
        <SetLight
          room_id={room_id}
          callbackSetSignIn={callbackSetSignIn}
          idNode={idNode}
          status={status}
          selectFunction={selectFunction}
        />
        </Grid>
        }
      </Grid>
    
      <Grid container xs ={12} sx={{ mt:1,
              border: '1px solid black',
              borderRadius: '8px',
              padding: 1.5,
              }}
              justifyContent="center">
        <Header title = "Set Time Air Conditioner" fontSize="20px"/>
        <SetTimer
          room_id={room_id}
          callbackSetSignIn={callbackSetSignIn}
          idNode={idNode}
          status={status}
          selectFunction={selectFunction}
        />
      </Grid>
    </Grid>
  )
}

export default ActuatorInfo