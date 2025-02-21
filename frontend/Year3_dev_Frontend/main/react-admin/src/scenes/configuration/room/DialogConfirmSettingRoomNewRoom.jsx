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
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export default function DialogConfirmSettingRoomNewRoom({setDataSettingRoom, dataSettingRoom}) {
  return (
    <React.Fragment>
        <Typography component="h1" variant="h3" align="center">
            Setting Room
        </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <TextField
            required
            id="room_id"
            name="room_id"
            label="Room id"
            fullWidth
            autoComplete="room_id"
            variant="standard"
            value={dataSettingRoom.room_id}
            onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9]/g, '')}}
            onChange={(e)=>setDataSettingRoom({...dataSettingRoom, room_id: e.target.value})}
          />
        </Grid>

        <Grid item xs={12} sm={12}>
            <FormControl variant="standard" sx={{minWidth: 120 }}>
                <InputLabel id="demo-simple-select-standard-label">Construction type</InputLabel>
                <Select
                    labelId="demo-simple-select-standard-label"
                    id="demo-simple-select-standard"
                    value={dataSettingRoom.construction_name}
                    onChange={(e)=>setDataSettingRoom({...dataSettingRoom, construction_name: e.target.value})}
                    label="Construction type"
                >
                    <MenuItem value={"building"}>Building</MenuItem>
                    <MenuItem value={"farm"}>Farm</MenuItem>
                </Select>
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
            value={dataSettingRoom.x_length}
            onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9]/g, '')}}
            onChange={(e)=>setDataSettingRoom({...dataSettingRoom, x_length: e.target.value})}
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
            value={dataSettingRoom.y_length}
            onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9]/g, '')}}
            onChange={(e)=>setDataSettingRoom({...dataSettingRoom, y_length: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
            <TextField
                required
                id="information"
                name="information"
                label="Information"
                fullWidth
                autoComplete="information"
                variant="standard"
                value={dataSettingRoom.information}
                onChange={(e)=>setDataSettingRoom({...dataSettingRoom, information: e.target.value})}
            />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}