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

export default function ConfirmNode({dataCreateNode}) {
  return (
    <React.Fragment>
      <Grid container spacing={3}>
        {/* <Grid item xs={12} sm={12}>
          <TextField
            required
            id="node_id"
            name="node_id"
            label="Node id (Node id will be updated later!)"
            fullWidth
            variant="standard"
            InputProps={{
                readOnly: true,
              }}
            value={dataCreateNode.node_id}
          />
        </Grid> */}
        
        <Grid item xs={12}>
          <TextField
            required
            id="x_axis"
            name="x_axis"
            label="Position X"
            fullWidth
            autoComplete="x_axis"
            variant="standard"
            InputProps={{
                readOnly: true,
              }}
            value={dataCreateNode.x_axis}
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
            InputProps={{
                readOnly: true,
              }}
            value={dataCreateNode.y_axis}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="function"
            name="function"
            label="Function"
            fullWidth
            autoComplete="function"
            variant="standard"
            InputProps={{
                readOnly: true,
              }}
            value={dataCreateNode.function}
          />
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
            InputProps={{
                readOnly: true,
              }}
            value={dataCreateNode.mac}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}