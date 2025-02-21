import { React, useEffect, useState } from "react";
import { Grid, Paper, Typography, useTheme } from "@mui/material";
import { host } from "../../App";
import EnergyChart from "../EnergyChart/EnergyChart";

const Energy = () =>
{
    return (
                <Grid container textAlign='center' justifyContent='center'>
                <Grid item xs={12} sm={12} md={12} textAlign="center" >
                    <Typography fontWeight="bold" fontSize='21px'>
                        Energy Data
                    </Typography>
                </Grid>
                <Grid item container spacing={1} px='10px' marginY={0.5} justifyContent='center'>
                    <Grid item xs={4}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Paper style={{ flex: 1, backgroundColor: 'white', padding: '10px' }}>
                            <Grid container display="flex" flexDirection="column" justifyItems='center' textAlign='center'>
                                <Grid container item justifyContent='center' alignContent='center'>
                                    <Typography variant='h4'>Voltage</Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant='h5'>num</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                        </div>
                    </Grid>
                    <Grid item xs={4}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Paper style={{ flex: 1, backgroundColor: 'white', padding: '10px' }}>
                            <Grid container display="flex" flexDirection="column" justifyItems='center' textAlign='center'>
                                <Grid container item justifyContent='center' alignContent='center'>
                                    <Typography variant='h4'>Current</Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant='h5'>num</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                        </div>
                    </Grid>
                    <Grid item xs={4}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Paper style={{ flex: 1, backgroundColor: 'white', padding: '10px' }}>
                            <Grid container display="flex" flexDirection="column" justifyItems='center' textAlign='center'>
                                <Grid container item justifyContent='center' alignContent='center'>
                                    <Typography variant='h4'>Frequency</Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant='h5'>num</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                        </div>
                    </Grid>
                    <Grid item xs={4}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Paper style={{ flex: 1, backgroundColor: 'white', padding: '10px' }}>
                            <Grid container display="flex" flexDirection="column" justifyItems='center' textAlign='center'>
                                <Grid container item justifyContent='center' alignContent='center'>
                                    <Typography variant='h4'>Active power</Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant='h5'>num</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                        </div>
                    </Grid>
                    <Grid item xs={4}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Paper style={{ flex: 1, backgroundColor: 'white', padding: '10px' }}>
                            <Grid container display="flex" flexDirection="column" justifyItems='center' textAlign='center'>
                                <Grid container item justifyContent='center' alignContent='center'>
                                    <Typography variant='h4'>Power factor</Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant='h5'>num</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                        </div>
                    </Grid>
                    <Grid item xs={4}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Paper style={{ flex: 1, backgroundColor: 'white', padding: '10px' }}>
                            <Grid container display="flex" flexDirection="column" justifyItems='center' textAlign='center'>
                                <Grid container item justifyContent='center' alignContent='center'>
                                    <Typography variant='h4'>Active energy</Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant='h5'>num</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                        </div>
                    </Grid>
                </Grid>
                <Grid xs={12} textAlign='center' spacing={1} marginY={1}>
                    <Typography textAlign='center' variant='h5'>updated on xxx</Typography>
                </Grid>
            </Grid>
    );
}

export default Energy;