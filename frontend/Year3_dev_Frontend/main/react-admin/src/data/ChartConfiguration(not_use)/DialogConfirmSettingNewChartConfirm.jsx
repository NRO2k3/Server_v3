import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

const DialogConfirmSettingNewChartConfirm = ({dataChartSetting}) => {
    return (
        <React.Fragment>
            <Typography component="h1" variant="h3" align="center">
                Confirm
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={12}>
                <TextField
                    required
                    id="node_id"
                    name="node_id"
                    label="Node id"
                    fullWidth
                    variant="standard"
                    InputProps={{
                        readOnly: true,
                    }}
                    value={dataChartSetting.node_id}
                />
                </Grid>
                
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
                    value={dataChartSetting.x_axis}
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
                    value={dataChartSetting.y_axis}
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
                    value={dataChartSetting.function}
                />
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

export default DialogConfirmSettingNewChartConfirm;