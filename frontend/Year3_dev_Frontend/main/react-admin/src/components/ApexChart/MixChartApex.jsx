import { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

// Reference: https://apexcharts.com/react-chart-demos/mixed-charts/multiple-yaxis/#
// TODO: Update chart (DONE)

const MultipleYAxis = ({ nameChart, id, time, temperature, humidity, option }) => {
    console.log("This is in Chartttttttt")
    if(option !== "now")
    {
        console.log("THIS IS NOT NOWWWWWWWWWWWWW IN MULTICHARTTTTTTTTTT")
        console.log(temperature)
    }
    // const [data, setData] = useState({
    //     options: {
    //         title: {
    //             text: nameChart
    //         },
    //         xaxis: {
    //             categories: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016],
    //         },
    //         yaxis: [
    //             {
    //                 title: {
    //                     text: "Temperature"
    //                 }
    //             },
    //             {
    //                 opposite: true,
    //                 title: {
    //                     text: "Humidity"
    //                 }
    //             }
    //         ]
    //     },
    //     series: [{
    //         name: "T",
    //         type: "line",
    //         data: [1.4, 2, 2.5, 1.5, 2.5, 2.8, 3.8, 4.6]
    //     }, {
    //         name: "H",
    //         type: 'line',
    //         data: [1.1, 3, 3.1, 4, 4.1, 4.9, 6.5, 8.5]
    //     }]
    // });

    /* function inside userEffect runs each time data of useState changes */
    // useEffect(() => {
    //     /* create a function that converse unix time stamp t into a string that show hour, minutes and second and
    //     map that function to all members of array time */
    //     let new_data = null;
    //     if(option === "now")
    //     {   
    //         let new_time = null;
    //         if(time)
    //         {
    //             new_time = time.map((t)=>{
    //                                       let unixTimestamp = t;
    //                                       let date = new Date(unixTimestamp * 1000);
    //                                       return date.getHours().toString() + 
    //                                       ":" + date.getMinutes().toString() + 
    //                                       ":" + date.getSeconds().toString();
    //                                     });
    //         }

    //         new_data = {
    //             options: {
    //                     title: {
    //                         text: nameChart
    //                     },
    //                     xaxis: {
    //                         categories: new_time ? new_time : []
    //                     },
    //                     yaxis: [
    //                         {
    //                             title: {
    //                                 text: "Temp"
    //                             }
    //                         },
    //                         {
    //                             opposite: true,
    //                             title: {
    //                                 text: "Hum"
    //                             }
    //                         }
    //                     ]
    //                 },
    //             series: [{
    //                 name: "T",
    //                 type: "line",
    //                 data: temperature
    //             }, {
    //                 name: "H",
    //                 type: 'line',
    //                 data: humidity
    //             }]
    //         }
    //     }
    //     else
    //     {
    //         let new_time = null;
    //         if(time)
    //         {
    //             new_time = time;
    //         }
    //         // if(time)
    //         // {
    //         //     new_time = time.map((t)=>{
    //         //         let unixTimestamp = t;
    //         //         let date = new Date(unixTimestamp * 1000);
    //         //         return date.getDate().toString() + 
    //         //         "/" + date.getMonth().toString() + 
    //         //         "/" + date.getFullYear().toString();
    //         //       });
    //         // }

    //         new_data = {
    //             options: {
    //                     title: {
    //                         text: nameChart
    //                     },
    //                     xaxis: {
    //                         categories: new_time ? new_time : []
    //                     },
    //                     yaxis: [
    //                         {
    //                             title: {
    //                                 text: "Temp"
    //                             }
    //                         },
    //                         {
    //                             opposite: true,
    //                             title: {
    //                                 text: "Hum"
    //                             }
    //                         }
    //                     ]
    //                 },
    //             series: [{
    //                 name: "Te",
    //                 type: "line",
    //                 data: temperature
    //             }, {
    //                 name: "Hu",
    //                 type: 'line',
    //                 data: humidity
    //             }]
    //         }
    //     }
    //     setData(new_data);
    //     },[]); //id, time, temperature, humidity

    let new_data = null
    if(option === "now")
        {   
            let new_time = null;
            if(time)
            {
                new_time = time.map((t)=>{
                                          let unixTimestamp = t;
                                          let date = new Date(unixTimestamp * 1000);
                                          return date.getHours().toString() + 
                                          ":" + date.getMinutes().toString() + 
                                          ":" + date.getSeconds().toString();
                                        });
            }

            new_data = {
                options: {
                        title: {
                            text: nameChart
                        },
                        xaxis: {
                            categories: new_time ? new_time : []
                        },
                        yaxis: [
                            {
                                title: {
                                    text: "Temp"
                                }
                            },
                            {
                                opposite: true,
                                title: {
                                    text: "Hum"
                                }
                            }
                        ]
                    },
                series: [{
                    name: "T",
                    type: "line",
                    data: temperature
                }, {
                    name: "H",
                    type: 'line',
                    data: humidity
                }]
            }
        }
        else
        {
            let new_time = null;
            if(time)
            {
                new_time = time;
            }
            // if(time)
            // {
            //     new_time = time.map((t)=>{
            //         let unixTimestamp = t;
            //         let date = new Date(unixTimestamp * 1000);
            //         return date.getDate().toString() + 
            //         "/" + date.getMonth().toString() + 
            //         "/" + date.getFullYear().toString();
            //       });
            // }

            new_data = {
                options: {
                        title: {
                            text: nameChart
                        },
                        xaxis: {
                            categories: new_time ? new_time : []
                        },
                        yaxis: [
                            {
                                title: {
                                    text: "Temp"
                                }
                            },
                            {
                                opposite: true,
                                title: {
                                    text: "Hum"
                                }
                            }
                        ]
                    },
                series: [{
                    name: "Te",
                    type: "line",
                    data: temperature
                }, {
                    name: "Hu",
                    type: 'line',
                    data: humidity
                }]
            }
        }

    return (
        <div id="chart">
            <ReactApexChart options={new_data.options} 
                            series={new_data.series} 
                            type={"line"} 
                            height="" 
            />
        </div>
    );
};

export default MultipleYAxis;