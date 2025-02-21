import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

export default function NewRoom({setDataCreateRoom, dataCreateRoom}) {
  return (
    <React.Fragment>
      <Typography variant="h4" gutterBottom>
        Detail
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <TextField
            required
            id="room_id"
            name="room_id"
            label="Room Id"
            fullWidth
            autoComplete="room_id"
            variant="standard"
            value={dataCreateRoom.room_id}
            onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9]/g, '')}}
            onChange={(e)=>setDataCreateRoom({...dataCreateRoom, room_id: e.target.value})}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
            <FormControl>
                <FormLabel id="demo-controlled-radio-buttons-group">Construction type</FormLabel>
                <RadioGroup
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    row
                    value={dataCreateRoom.construction_name}
                    onChange={(e)=>setDataCreateRoom({...dataCreateRoom, construction_name: e.target.value})}
                >
                    <FormControlLabel value="building" control={<Radio />} label="Building" />
                    <FormControlLabel value="farm" control={<Radio />} label="Farm" />
                </RadioGroup>
            </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="x_length"
            name="x_length"
            label="Width"
            fullWidth
            autoComplete="x_length"
            variant="standard"
            value={dataCreateRoom.x_length}
            onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9]/g, '')}}
            onChange={(e)=>setDataCreateRoom({...dataCreateRoom, x_length: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="y_length"
            name="y_length"
            label="Length"
            fullWidth
            autoComplete="y_length"
            variant="standard"
            value={dataCreateRoom.y_length}
            onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9]/g, '')}}
            onChange={(e)=>setDataCreateRoom({...dataCreateRoom, y_length: e.target.value})}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextField
            required
            id="information"
            name="information"
            label="Information"
            fullWidth
            autoComplete="information"
            variant="standard"
            value={dataCreateRoom.information}
            onChange={(e)=>setDataCreateRoom({...dataCreateRoom, information: e.target.value})}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}