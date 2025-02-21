import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export default function NewChart({setDataCreateChart, dataCreateChart}) {
  return (
    <React.Fragment>
        <Typography variant="h4" gutterBottom justifyContent="center">
            Detail
        </Typography>
        <Grid container spacing={3}>
            <Grid item xs={12}>
            <TextField
                required
                id="x_axis"
                name="x_axis"
                label="Chart name"
                fullWidth
                autoComplete="x_axis"
                variant="standard"
                // value={dataCreateChart.x_axis}
                // onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9]/g, '')}}
                // onChange={(e)=>setDataCreateChart({...dataCreateChart, x_axis: e.target.value})}
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
                // value={dataCreateChart.y_axis}
                // onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9]/g, '')}}
                // onChange={(e)=>setDataCreateChart({...dataCreateChart, y_axis: e.target.value})}
            />
            </Grid>
            <Grid item xs={12} sm={12}>
                <FormControl variant="standard" sx={{minWidth: 120 }}>
                    <InputLabel id="demo-simple-select-standard-label">Function</InputLabel>
                    <Select
                        labelId="demo-simple-select-standard-label"
                        id="demo-simple-select-standard"
                        value={dataCreateChart.function}
                        // onChange={(e)=>setDataCreateChart({...dataCreateChart, function: e.target.value})}
                        label="Function"
                    >
                        <MenuItem value={"sensor"}>Sensor</MenuItem>
                        <MenuItem value={"air"}>Air conditioning</MenuItem>
                        <MenuItem value={"fan"}>Fan</MenuItem>

                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12}>
            <TextField
                required
                id="mac"
                name="mac"
                label="Mac address (Mac address must be unique from all nodes!)"
                fullWidth
                autoComplete="mac"
                variant="standard"
                value={dataCreateChart.mac}
                // onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9]/g, '')}}
                onChange={(e)=>setDataCreateChart({...dataCreateChart, mac: e.target.value})}
            />
            </Grid>
        </Grid>
    </React.Fragment>
  );
}