import React from 'react';
import ReactDOM from 'react-dom';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryStack, VictoryZoomContainer } from 'victory';

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
const VictoryBarChartV2 = ({data_x, data_y, option_data}) => 
{
    let data = [];
    let test_data = []
    let data_real = {x: [], y: []};
    let value_x = [];
    let label_x;
    if(option_data === "now")
    {
        label_x = data_x.map((t)=>{
                                    let unixTimestamp = t;
                                    let date = new Date(unixTimestamp * 1000);
                                    return `${date.getUTCDate()}/${date.getUTCMonth()}/${date.getFullYear()}-
                                    ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`; 
                                });
    }
    else
    {
        label_x = data_x;
    }

    let new_label_x;
    new_label_x = [...label_x];
    for(let i=new_label_x.length-2; i>=Math.round(new_label_x.length/12); i-=Math.round(new_label_x.length/12))
    {
        for(let j=i;j>=i-Math.round(new_label_x.length/12);--j)
        {
            new_label_x[j] = "111";
        }
    }

    for(let i=0; i<data_x.length; ++i)
    {
        data.push({x: label_x[i], y: data_y[i]});
    }
    
    let label_y = [];
    let value_y = [];

    for(let i=0; i<=Math.round((Math.max(...data_y))+5)/5; ++i)
    {
        value_y.push(i*5);
        label_y.push(i*5);
    }


    

    return (
        <VictoryChart
        // adding the material theme provided with Victory
        theme={VictoryTheme.material}
        // domainPadding will add space to each side of VictoryLine to
        // prevent it from overlapping the axis
        // domainPadding={20}
        padding={{ 
            top: 10, 
            bottom: 30, 
            left: 30, 
            right: 20, 
            }}
        height={150}
        domain={{ y: [Math.min(...data_y), Math.max(...data_y)] }}
        domainPadding={{x: 20, y: 10 }}
        containerComponent={
                    <VictoryZoomContainer
                    />
                }
        >
            <VictoryAxis  
            fixLabelOverlap={true}  
            // tickValues specifies both the number of ticks and where
            // they are placed on the axis
            dependentAxis={false}       //x-axis
            // tickValues={data_x}
            // tickFormat={(t)=>{
            //     if(option_data === "now")
            //     {
            //         let unixTimestamp = t;
            //         let date = new Date(unixTimestamp * 1000);
            //         return date.getHours().toString() + 
            //         ":" + date.getMinutes().toString() + 
            //         ":" + date.getSeconds().toString();
            //     }
            //     else
            //     {
            //         return t;
            //     }
            // }}
            style={{
                data: { width: 10 },
                labels: { padding: 20 },
                // axis: {stroke: "#756f6a"},
                // axisLabel: {fontSize: "1000px", padding: 2},    //size of the value on top of each point
                // grid: {stroke: ({ tick }) => tick > 0.5 ? "red" : "grey"},
                // ticks: {stroke: "grey", size: 5},
                tickLabels: {fontSize: 4, padding: 10} //size of label of x-axis value and position of them
              }}
            // tickCount={15}   //number of label on x-axis
            />
            <VictoryAxis
            // fixLabelOverlap={true}  
            dependentAxis={true}   //y_axis
            // tickValues={label_y}
            // tickFormat specifies how ticks should be displayed
            // tickFormat={label_y}
            style={{
                // axis: {stroke: "#756f6a"},
                // axisLabel: {fontSize: "100px", padding: 2},     //size of the value on each point
                // grid: {stroke: ({ tick }) => tick > 0.5 ? "red" : "grey"},
                // ticks: {stroke: "grey", size: 5},    
                tickLabels: {fontSize: 5, padding: 8}       //size of label of y-axis value, padding: position of them
              }}
            tickCount={20}  //number of label on y-axis
            />
            <VictoryBar
                // style={{
                //     data: { stroke: "#c43a31" },
                //     parent: { border: "1px solid #ccc"}
                //   }}
                style={{ data: { stroke: "blue", strokeWidth: 1, strokeLinecap: "round" } }}
                // animate={{
                //     duration: 2000,
                //     onLoad: { duration: 1000 }
                //   }}
                data={data}
                // categories={{x: data_x, y: data_y}}
                // labels={({ datum }) => datum.y}
            />
        </VictoryChart>
    );
}

export default VictoryBarChartV2;