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
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export default function NewNode({setDataCreateNode, dataCreateNode}) {
  return (
    <React.Fragment>
        <Typography variant="h4" gutterBottom>
            Detail
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
                value={dataCreateNode.x_axis}
                onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9]/g, '')}}
                onChange={(e)=>setDataCreateNode({...dataCreateNode, x_axis: e.target.value})}
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
                value={dataCreateNode.y_axis}
                onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9]/g, '')}}
                onChange={(e)=>setDataCreateNode({...dataCreateNode, y_axis: e.target.value})}
            />
            </Grid>
            <Grid item xs={12} sm={12}>
                <FormControl variant="standard" sx={{minWidth: 120 }}>
                    <InputLabel id="demo-simple-select-standard-label">Function</InputLabel>
                    <Select
                        labelId="demo-simple-select-standard-label"
                        id="demo-simple-select-standard"
                        value={dataCreateNode.function}
                        onChange={(e)=>setDataCreateNode({...dataCreateNode, function: e.target.value})}
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
                value={dataCreateNode.mac}
                // onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9]/g, '')}}
                onChange={(e)=>setDataCreateNode({...dataCreateNode, mac: e.target.value})}
            />
            </Grid>
        </Grid>
    </React.Fragment>
  );
}