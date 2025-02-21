import * as React from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

export default function ConfirmChart({dataCreateChart}) {
  return (
    <React.Fragment>
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
            InputProps={{
                readOnly: true,
              }}
            value={dataCreateChart.x_axis}
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
            value={dataCreateChart.y_axis}
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
            value={dataCreateChart.function}
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
            value={dataCreateChart.mac}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}