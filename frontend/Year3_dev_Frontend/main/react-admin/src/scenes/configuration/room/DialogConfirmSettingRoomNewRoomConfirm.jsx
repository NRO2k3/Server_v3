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

export default function DialogConfirmSettingRoomNewRoomConfirm({setDataSettingRoom, dataSettingRoom}) {
  return (
    <React.Fragment>
        <Typography component="h1" variant="h3" align="center">
                Confirm
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
            InputProps={{
                readOnly: true,
              }}
          />
        </Grid>

        <Grid item xs={12} sm={12}>
            <FormControl variant="standard" sx={{minWidth: 120 }}>
            <TextField
                required
                id="construction_name"
                name="construction_name"
                label="Construction type"
                fullWidth
                autoComplete="construction_name"
                variant="standard"
                value={dataSettingRoom.construction_name}
                InputProps={{
                    readOnly: true,
                }}
            />
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
            InputProps={{
                readOnly: true,
              }}
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
            InputProps={{
                readOnly: true,
              }}
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
                InputProps={{
                    readOnly: true,
                  }}
            />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}