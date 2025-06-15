import React from 'react';
import ReactDOM from 'react-dom';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme, VictoryStack, VictoryZoomContainer } from 'victory';
import { useState } from 'react';

/**
 * @brief return a Line chart, the data that needs to be put into 
 *      chat will have to have the form like this
 *      data={[
                { x: 1, y: 2 },
                { x: 2, y: 3 },
                { x: 3, y: 5 },
                { x: 4, y: 4 },
                { x: 5, y: 7 },
                ]}
 */
const VictoryLineChart = ({data_x, data_y, option_data, parameter_type}) => 
{
    // console.log(data_x)
    // console.log(data_y)
    // console.log(option_data)
    // console.log(parameter_type)
    let data = [];
    let label_x;
    // bo phan optiondata di
    if(option_data === "now")
    {
        label_x = data_x.map((t)=>{
            let unixTimestamp = t;
            let date = new Date(unixTimestamp * 1000);
            return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}-\n${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`; 
        });
    }
    else
    {
        label_x = data_x;
    }

    for(let i=0; i<data_x.length; ++i) {
        data.push({x: label_x[i], y: data_y[i]});
    }
    
    let label_y = [];
    let value_y = [];

    for(let i=0; i<=Math.round((Math.max(...data_y))+5)/5; ++i) {
        value_y.push(i*5);
        label_y.push(i*5);
    }
    
    let strokeColor;
    switch (parameter_type) {
        case 1:        // temp
            strokeColor = "orange";
            break;
        case 2:         // hum
            strokeColor = "aqua";
            break;
        case 3:         // co2
            strokeColor = "darkgreen";
            break;
        case 4:        // tvoc
            strokeColor = "red";
            break;
        case 5:       // light
            strokeColor = "magenta";
            break;
        case 6:        // dust
            strokeColor = "darkgray";
            break;
        default:
            strokeColor = "black"; // Default color if type_of_data doesn't match any case
    }
    
    return (
        <VictoryChart
            theme={VictoryTheme.material}
            height={100}
            padding={{left: 20, right: 20, bottom: 12}}
            domain={Math.max(data_y) + 1}
            // containerComponent={
            //     <VictoryZoomContainer
            //         // minZoom={{y: Math.min(...data_y) - 1}} // Minimum zoom level
            //         // maxZoom={{y: Math.max(...data_y) + 1}} // Maximum zoom level
            //     />
            // }
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
                tickCount={10}
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
            <VictoryLine
                style={{ 
                    data: {
                        stroke: strokeColor,
                        strokeWidth: 1,
                        strokeLinecap: "round"
                    } 
                }}
                data={data}
                interpolation='natural'
                alignment="start"
            />
        </VictoryChart>
    );
}

export default VictoryLineChart;