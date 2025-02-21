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

export default function DialogConfirmSettingNewChart({dataChartSetting, setDataChartSetting}) {
  return (
    <React.Fragment>
        <Typography component="h1" variant="h3" align="center">
            Setting
        </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            id="x_axis"
            name="x_axis"
            label="Position X"
            fullWidth
            autoComplete="x_axis"
            variant="standard"
            value={dataChartSetting.x_axis}
            onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9]/g, '')}}
            onChange={(e)=>setDataChartSetting({...dataChartSetting, x_axis: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="y_axis"
            name="y_axis"
            label="Position Y"
            fullWidth
            autoComplete="y_axis"
            variant="standard"
            value={dataChartSetting.y_axis}
            onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9]/g, '')}}
            onChange={(e)=>setDataChartSetting({...dataChartSetting, y_axis: e.target.value})}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
            <FormControl variant="standard" sx={{minWidth: 120 }}>
                <InputLabel id="demo-simple-select-standard-label">Function</InputLabel>
                <Select
                    labelId="demo-simple-select-standard-label"
                    id="demo-simple-select-standard"
                    value={dataChartSetting.function}
                    onChange={(e)=>setDataChartSetting({...dataChartSetting, function: e.target.value})}
                    label="Function"
                >
                    <MenuItem value={"sensor"}>Sensor</MenuItem>
                    <MenuItem value={"air"}>Air conditioning</MenuItem>
                    <MenuItem value={"fan"}>Fan</MenuItem>
                </Select>
            </FormControl>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}