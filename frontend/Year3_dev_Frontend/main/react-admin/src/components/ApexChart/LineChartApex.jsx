import { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

// Reference: https://apexcharts.com/react-chart-demos/line-charts/basic/

/* 
  * props meaning:- nameChart: to show the nameChart on the chart
                  - id: the id of the sensor node
                  - time: the x-axis of the chart
                  - vlaue: the y-axis of the chart
                  - option: + "1" determines that this is secondly data chart
                            + "2" determines that this is daily data chart
 */
export const LineChartApex = ({ nameChart, id, time, value, option }) => {
  // const [data, setData] = useState({
  //   options: {
  //     title: {
  //       text: nameChart
  //     },
  //     xaxis: {
  //       categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  //     }
  //   },
  //   series: [{
  //     name: nameChart,
  //     data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
  //   }]
  // });


  /* function inside userEffect runs each time props passed in change */
    // useEffect(() => {
    // let new_data;
    //option = 1 is the case that we call secondly data API
    // if(option === "now")
    // {
    //   let new_time = null;
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
    //   /* new value to set for data of useState */
    //   new_data = {
    //     options: {
    //       title: {
    //         text: nameChart
    //       },
    //       xaxis: {
    //         categories: new_time,
    //       }
    //     },
    //     series: [{
    //       name: nameChart,
    //       data: value,
    //     }]
    //   };
    // }
    // //option = 2 is the case that we call daily data API
    // else
    // {
    //   let new_time = null;
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
    //   new_data = {
    //     options: {
    //       title: {
    //         text: nameChart
    //       },
    //       xaxis: {
    //         categories: new_time ? new_time : [],
    //       }
    //     },
    //     series: [{
    //       name: nameChart,
    //       data: value,
    //     }]
    //   };
    // }
    // /* create a function that converse unix time stamp t into a string that show hour, minutes and second and
    // map that function to all members of array time */
    // setData(new_data);
    // }, [id, time, value, option])
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
      /* new value to set for data of useState */
      new_data = {
        options: {
          title: {
            text: nameChart
          },
          xaxis: {
            categories: new_time,
          }
        },
        series: [{
          name: nameChart,
          data: value,
        }]
      };
    }
    //option = 2 is the case that we call daily data API
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
            categories: new_time ? new_time : [],
          }
        },
        series: [{
          name: nameChart,
          data: value,
        }]
      };
    }

    return (
      <div id="chart">
        <ReactApexChart options={new_data.options} 
                        series={new_data.series} 
                        type="line" 
                        height=""
        />
      </div>
    );
};