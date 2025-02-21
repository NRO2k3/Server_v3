import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';

export default function Confirm({dataCreateRoom}) {
  return (
    <React.Fragment>
        <Typography variant="h4" gutterBottom>
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
                variant="standard"
                InputProps={{
                    readOnly: true,
                }}
                value={dataCreateRoom.room_id}
            />
            </Grid>

            <Grid item xs={12} sm={12}>
            <TextField
                required
                id="construction_name"
                name="construction_name"
                label="Construction type"
                fullWidth
                variant="standard"
                InputProps={{
                    readOnly: true,
                }}
                value={dataCreateRoom.construction_name}
            />
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
                InputProps={{
                    readOnly: true,
                }}
                value={dataCreateRoom.x_length}
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
                InputProps={{
                    readOnly: true,
                }}
                value={dataCreateRoom.y_length}
            />
            </Grid>
            <Grid item xs={12}>
            <TextField
                rey_length
                id="information"
                name="information"
                label="Information"
                fullWidth
                autoComplete="information"
                variant="standard"
                InputProps={{
                    readOnly: true,
                }}
                value={dataCreateRoom.information}
            />
            </Grid>
        </Grid>
    </React.Fragment>
  );
}