import React, { useEffect, useState } from "react";
import { Grid, Typography, Stack, Button, colors } from "@mui/material";
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis, VictoryTooltip, VictoryLine, Flyout } from "victory";

const EnergyChart = () => {
    const [chartData, setChartData] = useState([])
    const [dataType, setDataType] = useState(0) // 0 is energyData, 1 is powerData
    const [maxYAxis, setMaxYAxis] = useState();

    const energyData = {
        "month": [
            "Jan 2023", "Feb 2023", "Mar 2023", "Apr 2023", "May 2023", "Jun 2023",
            "Jul 2023", "Aug 2023", "Sep 2023", "Oct 2023", "Nov 2023", "Dec 2023",
            "Jan 2024", "Feb 2024", "Mar 2024", "Apr 2024", "May 2024", "Jun 2024",
            "Jul 2024", "Aug 2024", "Sep 2024", "Oct 2024", "Nov 2024", "Dec 2024",
            "Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", "May 2025", "Jun 2025",
            "Jul 2025", "Aug 2025", "Sep 2025", "Oct 2025", "Nov 2025", "Dec 2025",
            "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026",
            "Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026", "Dec 2026"
        ],
        "active_energy": [
            1324, 5678, 9012, 3456, 7890, 2345, 6789, 8901, 4567, 8901, 1234, 5678,
            9012, 3456, 7890, 2345, 6789, 8901, 4567, 8901, 1234, 5678, 9012, 3456,
            9012, 3456, 7890, 2345, 6789, 8901, 4567, 8901, 1234, 5678, 9012, 3456,
            1324, 5678, 9012, 3456, 7890, 2345, 6789, 8901, 4567, 8901, 1234, 5678,
        ]   
    }

    const powerData = {
        'hour': [
            "1 am", "2 am", "3 am", "4 am", "5 am", "6 am", "7 am", "8 am", "9 am", "10 am", "11 am", "12 am",
            "1 pm", "2 pm", "3 pm", "4 pm", "5 pm", "6 pm", "7 pm", "8 pm", "9 pm", "10 pm", "11 pm", "12 pm",
        ],
        'active_power': [
            458, 512, 367, 782, 644, 734, 896, 921, 875, 699, 543, 456,
            789, 643, 765, 943, 732, 512, 684, 876, 921, 764, 598, 421
        ]
    }

    function getChartData(dataType) {
        let data = [];
        let label, unit;
        if (dataType) {
            data = powerData;
            label = 'Power';
            unit = 'kW'
        } else  {
            data = energyData;
            label = 'Energy';
            unit = 'kWh'
        }
        const keys = Object.keys(data);
        const result = [];
        for (let i = 0; i < data[keys[0]].length; i++) {
            result.push({
                x: data[keys[0]][i],
                y: data[keys[1]][i],
                y0: 0,
                label:`${data[keys[0]][i]}\n${label}: ${data[keys[1]][i]}${unit}`
            });
        }
        setMaxYAxis(Math.max(...data[keys[1]]))
        setChartData(result);
    }

    const array_filter = [
        {"name": "1D", "value": 1},
        {"name": "1W", "value": 2},
        {"name": "1M", "value": 3},
        {"name": "6M", "value": 4},
        {"name": "1Y", "value": 5},
    ]

    useEffect(() => {
        getChartData(dataType);
    },[dataType])
    
    return (
        <Grid container textAlign='center' justifyContent='center'>
        <Grid container display='flex' flexDirection='column' justifyContent='center' xs={12} marginY={1}>
            <Grid item>
                <Typography component='span' textAlign='center' fontSize='20px' color='black'>
                    {dataType ? 'Average active power' : 'Total active energy per month'}
                </Typography>
            </Grid>
            <Grid item marginX={4}>
                <Stack justifyContent='space-between' alignItems='center' direction='row'>
                    <Stack spacing={1} direction='row' >
                        <Button size="small" sx={{
                                    "min-width": "30px",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                }}
                                variant={dataType ? 'outlined' : 'contained'}
                                onClick={() => {
                                    setDataType(0);
                                }}
                                >
                            Energy
                        </Button>
                        <Button size="small" sx={{
                                    "min-width": "30px",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                }}
                                variant={dataType ? 'contained' : 'outlined'}
                                onClick={() => {
                                    setDataType(1);
                                }}>
                            Power
                        </Button>
                    </Stack>
                    <Stack direction='row' justifyContent='flex-end' pr={2} spacing={1}>
                    {array_filter.map((i)=>{
                        return (
                            <Button
                                sx={{
                                    "min-width": "30px",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                }}
                                size="small"
                                value={i.value}
                                variant='outlined'
                                >{i.name}
                            </Button>
                        );
                    })}
                </Stack>
                </Stack>
            </Grid>
        </Grid>
        <Grid style={{ width: '100%'}}>
        <VictoryChart
           theme={VictoryTheme.material}
           height={100}
           padding={{left: 20, right: 20, bottom: 12}}
           domain={maxYAxis}
       >
           <VictoryAxis  
               fixLabelOverlap={true}  
               // tickValues specifies both the number of ticks and where
               // they are placed on the axis
               dependentAxis={false}       //x-axis
               tickLength={0}
               gridComponent={<></>}
               style={{
                   data: { width: 10 },
                   labels: { padding: 20 },
                   axis: { stroke: "black" },
                   ticks: { stroke: "black", size: 0},
                   tickLabels: {fontSize: 4, padding: 3} //size of label of x-axis value and position of them
               }}
               tickCount={2}
           />
           <VictoryAxis
               fixLabelOverlap={false}  
               dependentAxis={true}   //y_axis
               gridComponent={<></>}
               style={{
                   axis: { stroke: "black" },
                   ticks: { stroke: "black", size: 0},
                   tickLabels: { fontSize: 4, padding: 3}       //size of label of y-axis value, padding: position of them
               }}
               tickCount={4}  //number of label on y-axis
           />
           {dataType 
           ?
           <VictoryLine
               labelComponent=
               {<VictoryTooltip 
                   style={{fontSize: '2.7px', lineHeight: 1}}
                   cornerRadius={1}
                   pointerLength={0}
                   flyoutStyle={{
                       strokeWidth: 0.1,
                   }}
                   flyoutComponent={
                       <Flyout 
                           height={10}
                           width={30}
                       />
                   }
               />}
               alignment="start"
               style={{ data: { stroke: "#c43a31"} }}
               data={chartData}
               interpolation='natural'
               events={[{
               target: "data",
               eventHandlers: {
                   onMouseOver: () => {
                   return [
                       {
                       target: "data",
                       mutation: () => ({style: {stroke: "red"}})
                       }, {
                       target: "labels",
                       mutation: () => ({ active: true })
                       }
                   ];
                   },
                   onMouseOut: () => {
                   return [
                       {
                       target: "data",
                       mutation: () => {}
                       }, {
                       target: "labels",
                       mutation: () => ({ active: false })
                       }
                   ];
                   }
               }
               }]}
           />
           :
           <VictoryBar
                labelComponent=
                {<VictoryTooltip 
                    style={{fontSize: '2.7px', lineHeight: 1}}
                    cornerRadius={1}
                    pointerLength={0}
                    flyoutStyle={{
                        strokeWidth: 0.1,
                    }}
                    flyoutComponent={
                        <Flyout 
                            height={10}
                            width={30}
                        />
                    }
                />}                
                alignment="start"
                style={{ data: { fill: "#c43a31"} }}
                data={chartData}
                barWidth={250 / chartData.length}
                events={[{
                target: "data",
                eventHandlers: {
                    onMouseOver: () => {
                    return [
                        {
                        target: "data",
                        mutation: () => ({style: {fill: "red"}})
                        }, {
                        target: "labels",
                        mutation: () => ({ active: true })
                        }
                    ];
                    },
                    onMouseOut: () => {
                    return [
                        {
                        target: "data",
                        mutation: () => {}
                        }, {
                        target: "labels",
                        mutation: () => ({ active: false })
                        }
                    ];
                    }
                }
                }]}
            />
           }
        </VictoryChart>
        </Grid>
        </Grid>
    )
}

export default EnergyChart;
