import { React, useEffect, useState } from "react";
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { host } from "../../App";


export default function AqiRef({callbackSetSignIn, time_delay})
{
    const url = `http://${host}/api/aqi_ref`;

    const [isLoading, setIsLoading] = useState(true);

    const [data, setData] = useState(null);

    const rating_index = {
        1 : {"level": "Good" , "colour": "green"},
        2 : {"level": "Moderate", "colour": "yellow"},
        3 : {"level": "Unhealthy for Sensitive Groups", "colour": "orange"},
        4 : {"level": "Unhealthy", "colour": "red"},
        5 : {"level": "Very Unhealthy", "colour": "purple"},
        6 : {"level": "Hazardous", "colour": "maroon"},
    };
    
    const rating_array = [
        {"key": 1 , "min": 0, "max": 50},
        {"key": 2 ,"min": 51, "max": 100},
        {"key": 3, "min": 101, "max": 150},
        {"key": 4, "min": 151, "max": 200},
        {"key": 5, "min": 201, "max": 300},
        {"key": 6, "min": 301, "max": 500},
    ];
    


    const fetch_data_function = async (api, access_token) =>
    {

        const headers = 
        {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token}`,
        }
        const option_fetch = 
        {
            "method": "GET",
            "headers": headers,
            "body": null,
        }
        const response = await fetch(api, option_fetch);
        if(response.status == 200)
        {
            const data = await response.json();
            const new_data = data["Response"]  
            let index = 0;
            for(let i=0; i<rating_array.length; ++i)
            {
                if(rating_array[i]["min"] <= new_data["aqi"] && new_data["aqi"] <= rating_array[i]["max"])
                {
                    index = rating_array[i]["key"];
                    break;
                }
            }
            if(rating_index.hasOwnProperty(index))
            {
                new_data["rating"] = 
                {
                    "color": rating_index[index]["colour"],
                    "rate": rating_index[index]["level"],
                }
            }
            else
            {
                new_data["rating"] = 
                {
                    "color": "white",
                    "rate": "No data",
                }
            }
            setData(new_data);
        }
        else
        {
            let new_data;
            new_data["rating"] = 
                {
                    "color": "white",
                    "rate": "No data",
                }
            setData(new_data);
        }
        setIsLoading(false);
    }

    const verify_and_get_data = async (fetch_data_function, callbackSetSignIn, backend_host, url) => 
    {

        const token = {access_token: null, refresh_token: null}
        // const backend_host = host;
        if(localStorage.getItem("access") !== null && localStorage.getItem("refresh") !== null)
        {
            token.access_token = localStorage.getItem("access"); 
            token.refresh_token = localStorage.getItem("refresh");
        }
        else
        {
            throw new Error("There is no access token and refresh token ....");
        }

        const verifyAccessToken  = async () =>
        {
            //call the API to verify access-token
            const verify_access_token_API_endpoint = `http://${backend_host}/api/token/verify`
            const verify_access_token_API_data = 
            {
                "token": token.access_token,
            }
            const verify_access_token_API_option = 
            {
                "method": "POST",
                "headers": 
                {
                    "Content-Type": "application/json",
                },
                "body": JSON.stringify(verify_access_token_API_data),

            }
            const verify_access_token_API_response = await fetch(verify_access_token_API_endpoint, 
                                                                verify_access_token_API_option,);
            if(verify_access_token_API_response.status !== 200)
            {
                return false;
            }
            return true;
        }

        /*
        *brief: this function is to verify the refresh-token and refresh the access-token if the refresh-token is still valid
        */
        const verifyRefreshToken  = async () =>
        {
            //call the API to verify access-token
            const verify_refresh_token_API_endpoint = `http://${backend_host}/api/token/refresh`
            const verify_refresh_token_API_data = 
            {
                "refresh": token.refresh_token,
            }
            const verify_refresh_token_API_option = 
            {
                "method": "POST",
                "headers": 
                {
                    "Content-Type": "application/json",
                },
                "body": JSON.stringify(verify_refresh_token_API_data),

            }
            const verify_refresh_token_API_response = await fetch(verify_refresh_token_API_endpoint, 
                                                                    verify_refresh_token_API_option,);
            const verify_refresh_token_API_response_data = await verify_refresh_token_API_response.json();
            if(verify_refresh_token_API_response.status !== 200)
            {
                return false;
            }
            else if(verify_refresh_token_API_response.status === 200 &&  verify_refresh_token_API_response_data.hasOwnProperty("access"))
            {
                localStorage.setItem("access", verify_refresh_token_API_response_data["access"]);
                localStorage.setItem("refresh", verify_refresh_token_API_response_data["refresh"]);
                return true
            }
            else
            {
                throw new Error("Can not get new access token ....");
            }
        }

        const  verifyAccessToken_response = await verifyAccessToken();

        if(verifyAccessToken_response === true)
        {
            // const response = await fetch(url)
            // const data = await response.json()
            fetch_data_function(url, token["access_token"])
        }
        else
        {
            let verifyRefreshToken_response = null;
            try
            {
                verifyRefreshToken_response = await verifyRefreshToken();
            }
            catch(err)
            {
                alert(err);
            }
            if(verifyRefreshToken_response === true)
            {
                fetch_data_function(url, token["access_token"]);
            }
            else
            {
                callbackSetSignIn(false);
            }
        }

    }

    useEffect(()=>{
            if(data === null)            //!< this is for the total component always render the first time and then the next time will be setTimeOut
            {
                verify_and_get_data(fetch_data_function, callbackSetSignIn, host, url); 
            }
            else
            {
                const timer = setTimeout(()=>{
                        verify_and_get_data(fetch_data_function, callbackSetSignIn, host, url); 
                    }, time_delay);
                return () => clearTimeout(timer);
            }
    },[data])


    return(
        <>
            {
                isLoading ?
                <h1>Loading...</h1>
                :
                    <Box>
                        <div className='aqiwidget aqiwidget-xxl' style={{ height: '420px; overflow: hidden;' }}>
                            <div className='aqiwidget-table-x' style={{ width: '460px;' }}>
                            <div style={{ textAlign: 'left; padding: 1px; padding-left: 5px; padding-right: 5px; line-height: 1.15;' }}>

                            <Box>

                                <table style={{ border: '0px solid black; valign: top; padding: 0px; margin: 0px; border-spacing: 0px; width: 100%;' }}>
                                <tr>
                                    <td nowrap="true">
                                    <div className='aqiwgt-table-title' id='aqiwgttitle' style={{ width: '370px; overflow: hidden;' }}>
                                        <span style={{ fontSize: '15px;' }}>
                                        {/* <a href='https://aqicn.org/city/vietnam/hanoi/' title='Hanoi (Hà Nội)' className='aqihreftarget' id='aqiwgttitle1'> */}
                                            <b>Hanoi AQI</b>
                                        {/* </a> */}
                                        : 
                                        </span>
                                        <span style={{ fontSize: '12px;' }} id='aqiwgttitle2'>Hanoi Real-time Air Quality Index (AQI). </span>
                                    </div>
                                    </td>
                                    {/* <td className='aqiwgtmapbtn' style={{ display: 'none; vertical-align: text-top; min-width: 22px;' }}>
                                    <a href='javascript:togglemapview()' title='Open the minimap to view all stations near Hanoi'>
                                        <span style={{ height: '16px; border: 0px solid red; position: absolute;' }}>
                                        <img src='https://aqicn.org/images/icons/p/mapb2.png' style={{ verticalAlign: 'text-top; border: 0px; height: 19px;' }}/>
                                        </span>
                                    </a>
                                    </td> */}
                                    <td className='aqiwgtsharebtn' style={{ verticalAlign: 'text-top;min-width:22px;' }}>
                                    <a href='javascript:clickShareWidget()' title='Share'>
                                        <span style={{ height: '16px;border:0px solid red;position:absolute;' }}>
                                        {/* <img
                                            src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAgCAYAAADud3N8AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QMCAS8xzd1FagAABEdJREFUSMe1ll9oHEUcxz+zu3e5y//UhCamTYkE01h7jZbEhrQPNgQDFkFQhL74UBCOExTFvLQvQn059EHwkhdB0NeCFixGS9MWg5IWbU2IpGoN2L9pbEzM5TZ3uzvjw83FdZsTczkHhpnZnZnv7zvz/f1+A2UosUSyOZZIbvuv88UWwd4C4hX1Te2em8NNL08Do1Op4dH/BTSWSI48HDsQP/pkG/XREIYQ3F1Z4+PJ6yz9dOX9qdTw68XWmiUCvrLtsZ63E/0dREMGQggUUBW26Gtv5Go6fKDukcdn5y+fndlovVEi0fhL3TtRKDyl8KRCKZU/OiF4obsNIF5ssVUCyzqrsqa7saoCqcAQaHAQetxSGwHoLbZHKUxt6bk4nkQp8CTIPMl15jlXAqTLBjqVGs7JrH1mbnEVx5NIfbx+8Ok7ywCflvN4T1bt6Hh2e00ETymQ+e8eCtMQLGVdvvz6W4DRkpnGEsloAPD4sae7sQzBr7+nmfxtkYXVLPfSWc7/skDq1BhuevnNqdTw1U37aSyRjANxoyK6V2ZtgLGats6ho/17qLAMbixlOP3VeWTW/gA4CHjAmA4OtzYdHGKJ5EjD7v3xwc4WGirDANxetmmujRAyDW78keHMuQvIrH1kKjV8ZrNXJDYAPN6we//J52M7EQIMkZ9SaG8uZfhi/GLJgA8IKZZImghxcrCzhZwrEQJCpoHwmZZxPGTW/qRUwI3U2x55qJmwmdeXUqyDA4Qtg9baKMDhrSSKIKiHzDs4gKnR9JCcK3GkRIum5GIEHH9ubfHutWXbyTu9+tuAArhSEKqpb4slkq+VCvpAltneO2jOu6GhXU31CJ/OlBaTaQja21q5fmdhqGnfoaX5y2cnt6xeLaj3Io0tbzyxp4vGqgo8qZhPrzEze42Bnn00RMOsOi6fX/gGZ2VpDOgDcsBF7afjJSXxWCI5qNNTrw7e48C0VV038syhPmojIdJZl4zj0ViV9+V76SwTl77D+XPxnanU8ImyvRxiiWTcqq4bOdx/gAb9YjB9PuUpxWcT32Mv3BooxriULDPqppcnCqlNKoUj5broTCHo2dtV9iQeNSqiB+ujoYL7EDIMPKXW/bm5JgIwVDbQjUoB3ABMw1gflzOJ2zJrX1rM5NbfRYUitQHzK1m08Mr2XAEYvTzzM46ncD31D3DXU1yZmf3XJC6qWztEwADha0Uxtbc/d+zdyuZdr3Z3Pcq2yjBKwX07xw/TP2Lfv52cO/3hCV9c8ccYJapbO0I6MpkauFBFkaoK/R0DLx4JVdW+LAzzKSAnXWfCzax8dHP81LkCgD51f1+K6taOeiCqReUHLvQtn1FmwMDCZp7e0NV9T/el71+h71pAGIjo1g9qBWpIV8tniAqAuDocur7qBapj6Umm/hBkaWoAw8fQ8s0jwMLP0PWx9IJMV4G1AMuN7rKYuIJeg+/YN7pT7y/Px/ps+YFplgAAAABJRU5ErkJggg==' 
                                            style={{ verticalAlign: 'text-top;;border:0px;height:18px;' }}
                                        /> */}
                                        </span>
                                    </a>
                                    </td>
                                    <td className='aqiwgtfullscreenbtn'>
                                    <a href='https://aqicn.org/city/vietnam/hanoi/m/' title='full screen view' className='aqihreftarget'>
                                        {/* <img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAQCAYAAAD52jQlAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDBFM0JCRDA0RTkxMTFFMTlDRkNEQTZEQkZFNkZEMjIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDBFM0JCRDE0RTkxMTFFMTlDRkNEQTZEQkZFNkZEMjIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpEMEUzQkJDRTRFOTExMUUxOUNGQ0RBNkRCRkU2RkQyMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpEMEUzQkJDRjRFOTExMUUxOUNGQ0RBNkRCRkU2RkQyMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PivMH0AAAAGMSURBVHjarJPBTsJAEIZ3tltcIBCoiSf1oh48wkWv3n0Bn8Bn8OTRkz6BF48mvgUnEmN4BkM0YsQYLQW63XEGtsEYaoowyd/ZTTNf/5ndAiKKeQEX7W1Km2Kx6OLZwSMQVNJGpixW7er+JLbYzKpkH2zFWkTr9ta5o8eDolwgeQ48UXXNa8LsQzOYy5YWhigJLcakOEHaC5EwGEWDoSWS78R7uVUp+JkuSQYZJDCidiKT4CC2dmAsiGT6jiFlB9ap691Aq79aJ5Zg4CfBPoYG+5GZNBCiBe5Cnbe6+9ed18Onr3H9R22Q51TWi8rsBToMimqUsHuLlj8oL9vPR7+AueMtMqrzMqjWtIKS74EvYXooYWy1WCKGNMuKL6VWEpQHICVJrCA0WfQ9AcQEEHOuTXprFoFy24pwlASlQRa0T4rzQtkeTOG9ulZ3WVcncsoVN8c7t5R6pHdSuJKZUiRuZJO/dlVQHpVxPxzKSsEbLkNz9SMHZcdCnjY2WmVf/gvMdVzPcySN0zF8CzAAQwGzqK/3FaYAAAAASUVORK5CYII=' style='border:0px;'/> */}
                                        </a>
                                    </td>
                                    </tr>
                                </table>

                                <table style={{ 
                                    textAlign: 'left', 
                                    padding: '0px', 
                                    paddingTop: '3px', 
                                    paddingBottom: '8px', 
                                    margin: '0px', 
                                    borderSpacing: '0px', 
                                    border: '0px solid black', 
                                    width: '100%',
                                    paddingLeft: "20px",
                                    // alignItems: "center"
                                    }} >
                                <tr>
                                    <td style={{ 
                                        paddingRight: '5px',
                                        width: "30%",
                                    }}
                                    >
                                        <div className='aqivalue' id='aqiwgtvalue' style={{ 
                                            fontSize: '80px', 
                                            backgroundColor:  `${data["rating"]["color"]}`, 
                                            color: '#000000', 
                                            }} 
                                            
                                            >
                                            {data["aqi"]}
                                        </div>
                                    </td>

                                    <td 
                                        style={{ 
                                            width: '70%',

                                        }} 
                                        // nowrap="true"
                                    >
                                        <div  
                                            style={{ fontSize: '30px', textShadow: '1px 1px 0 #000000', 
                                            color: `${data["rating"]["color"]}`, 
                                            // maxWidth: "50px", 
                                            // overflowWrap: "break-word" 
                                        }}
                                        >
                                            {data["rating"]["rate"]}
                                        </div>
                                    <div style={{ fontSize: '16px', fontWeight: 'light' }}>
                                        <span id='aqiwgtutime'>
                                            Updated on {
                                                    (()=>{
                                                        const new_time = data.time - 60*7*60;
                                                        const utcDate = new Date(new_time * 1000); // Convert seconds to milliseconds
                                                        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
                                                        const formattedDateTime = utcDate.toLocaleDateString('en-US', options);

                                                        return formattedDateTime;
                                                        })()   //run this function
                                                }
                                        </span>
                                        {/* <script>
                                        try {
                                            checkWidgetUpdateTime(1701738000, ' on Tuesday, Dec 5th 2023, 10:00 am', 'aqiwgtutime');
                                        } catch (e) {}
                                        </script> */}
                                    </div>
                                    <div style={{ fontSize: '12px' }}></div>
                                    <div style={{ fontSize: '12px', paddingTop: '5px' }} id='aqiwgtxtrainfo'>
                                        Temp.:{' '}
                                        <span>
                                        <b>{data["t"]}</b>
                                        &deg;C
                                        </span>
                                        </div>
                                </td>
                                </tr>
                                </table>
                                </Box>
            

                                <Box display="flex" justifyContent="center">
                                        
                                    <table style={{ fontSize: '11px', border: '0px solid black', padding: '0px', margin: '0px', borderSpacing: '0px' }}>
                                    <tr style={{}}>

                                        {/* _____________________________SET UP THE LENGTH OF ALL TABLE_________________________ */}
                                        <td colSpan="2" style={{ textAlign: 'center', fontWeight: 'bold', width: '300px' }} align="center" nowrap="true">Current</td>
                                        {/* <td style={{ width: '100px' }}>Past 48 hours data</td> */}
                                        {/* <td style={{ maxWidth: '30px', color: 'black' }} align="center" nowrap="true" className='tdmin'>Min</td> */}
                                        {/* <td style={{ maxWidth: '30px', color: 'black' }} align="center" nowrap="true" className='tdmax'>Max</td> */}
                                    </tr>
                                    <tr id='tr_pm25'  style={{ height: '26px', backgroundColor: '#edf6fb' }}>
                                        <td id='hdr_pm25' nowrap>
                                        <div className='tditem'>
                                            <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>
                                            PM2.5  <span style={{ fontWeight: 'normal', color: '#888', fontSize: '10px', fontFamily: '"Arial Narrow",Arial, Helvetica, sans-serif' }}>AQI</span>
                                            </span>
                                        </div>
                                        </td>
                                        <td id='cur_pm25' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{data["pm25"]}</td>
                                        <td id='td_pm25' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                                                                                        {/* <img class='aqi-graph-img' border="0" src='data:image/png;base64,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' width="310" height="30" id='img_pm25' alt='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
                                                                                        </td>
                                    {/* <td id='min_pm25' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">36</td> */}
                                    {/* <td id='max_pm25' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">160</td> */}
                                    </tr>
                                    <tr id='tr_pm10'  style={{ height: '26px', backgroundColor: '#' }}>
                                    <td id='hdr_pm10' nowrap>
                                        <div className='tditem'>
                                        <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>
                                            PM10  <span style={{ fontWeight: 'normal', color: '#888', fontSize: '10px', fontFamily: '"Arial Narrow",Arial, Helvetica, sans-serif' }}>AQI</span>
                                        </span>
                                        </div>
                                    </td>
                                    <td id='cur_pm10' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{data["pm10"]}</td>
                                    <td id='td_pm10' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                                        {/* <img className='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADeklEQVR42u1dPU8bQRB9/ooxJsZxIEHoROGCIhQp3Fhyi1KlSHFW/oHdEuV3IJLSLtNFXJEiRRTRItG4o3aBkMWnsZ0YYhm4FAlSFO+ctcdxNz7Pk2j2ODz79u3bmbuxAPSxDJ7gGpdwJpwJZz4jYjcL24rxzUi+sQeBQCCYQETsZsFWjH8AYCjGdyP5xicAbYZzyTGNi3NswplwFsq44sS4AcBUXdj/9uJybTU1EmQk37DknBAIBBwQ171hbTVVo7K/gOfSZsxzW+ISzoQzxsbWOh5i+XliZNxuFopE+Xro0/O6ZQAtpgsbaGx2s6DMvr9879y+eZWNBrhmk7ieorMA47KbBQNAcZxmtY3tyXyMuvSeKF8tAGU5SQOF6gUR1kuZrwBeq9aMMkMA7wCUVMICsEHcYzloQzn+s387M5eO/hopC/KN8pSv5VRkbA6JkgFga5zPxH2ZVq1iK8er9QgEXnFsEgZmAQ0vP6nkYFKeIRZTGi5Qq2yTn1+tl0UIE6fbbfWFBu6jM21ju+jeIDUT9WpSG8Tpv4lqXbcUyjEuEVjGdnI+zM2lkywJc6UzapN4a3j0WpKbFNQmpboPAGCX2Bufid8/RLV+wHQPOOnfdMjyXUPb2FTP1x7g9N9FrWIQi7dHiCpK/K1DFybpNVgabn4lyfUgcKsz04cMYwXAR8KIdDepMSZmU2PcQq2iyw1tHtRh8GdfFolHEYbDPLceOsu/l7G1u9fIzT94BVtyWDz1YveudpBJrWstuH+li3d9PE6lmCaOTofZpcUEOMJTndGclVGtWw6l/SjOei+xkDFZknY5MDGb1M1+TBc60xm/25u+UhHHdMD0oRQWTB7eEuUjvUkfJXaENv7QNjYfsjV3yKQ6HmaG9Imt/1bQGlOimC7u8QRLi4kOV2GGTGf+YDYpnP2F9luA1vGQJ3lnPb++aHtnhv//GOQdnT5LypoHA7Zf6BaduQBTnQXBmbaxOfSxBYvHKb79RUzfPD57mmDLmegsPDoLgrMoBAKBIGTQNraL7g3Pmfy4yrFluT9gGdbJ+ZAtZ6Kz8OgsCM60jc3jPjbvsJBh25OFbJplWCHsYxOdCWfujK3dveZJXu8qy1ZwlzxP0qPTIVvORGfh0VkQnMkzNoFAEDpoG5v0F7kA0/4i6WMTnU09Z/9A/mGEcCacSWys4/oNEsAfAirntOwAAAAASUVORK5CYII=' width="310" height="22" id='img_pm10' alt='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
                                    </td>
                                    {/* <td id='min_pm10' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">29</td> */}
                                    {/* <td id='max_pm10' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">72</td> */}
                                    </tr>
                                    <tr id='tr_o3' style={{ height: '26px', backgroundColor: '#edf6fb' }}>
                                    <td id='hdr_o3' nowrap>
                                        <div className='tditem'>
                                        <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>
                                            O3  <span style={{ fontWeight: 'normal', color: '#888', fontSize: '10px', fontFamily: '"Arial Narrow", Arial, Helvetica, sans-serif' }}>AQI</span>
                                            </span>
                                    </div>
                                    </td>
                                    <td id='cur_o3' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{data["o3"]}</td>
                                    <td id='td_o3' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                                        {/* <img className='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAACp0lEQVR42u2cQWrbQBSGf5dAcE2Ea7wS3ucKptlmmaVDbiBt2+YEPUAhW+kGxTpCti05SPAqOMbFNqaFdNHQTebJvGE8frL+fykx9vM3/8x7oxmrA71SADPYk9W4yMxHX64ynKfzN9fzsiIz+myXTjzaWO1Uq3GRmY/O00K40yEz+myX3nm0GRiFNzBsODLTar1lX9JnUSc2iqIo03IvRYtsAmDquFMBmDjb5OWhlwhzw5znjEup96fsS/osYsW2WFnt1NSw4VLGRZ/RZzErtiJ7ESozt3pCJi2yqVDNyVWefO/aY/eLmfSYqo+QPgu7mmiHz2TOjRibJ2izimwMYOS48yhct3Dc4Jj4jwCMnfx//4nRzw/Iy0d2hEqj10dVb/ssLx+sBKmf2FZboG9yPhxAv61861FldiLFZpVZSI0hPcsN67NbsfqoW500qy9jxXZRM2aurTDTO6ffixHXBYrsxnH9xytYKO7VtfHJ/p+Ez/tWk7FmEb5f/v15ebf3uELr0D5rIjOf2P4tOe3FFX1iW29j7FiNaiom9/Xlpo+ke6lqo8/WdRnr+45MOg82GLVsgLsIcYXV4X3WPGZ+sYUcG7DCrN3P2MLqRsh+FdbbiTBIK/htuGiz8ouQDO6FZOCz4ePbpr2Sj1X5cPb1Wcjf4/bZ7DnH12m5Z2YV8vL/Ulh/3MPq+aKkuzBrYDI7HmY8+6dX+qEBu6KLVaznHzo9LVMME5sdS2bNYyZVH0/LnxgmH01WrHZ99llczeyJmb5i6xnNCmfd5p3JIjMyI7O9iP8VpSjq6KSf2FZG37rwa2P3rQtkRmZkZnxis7iGB4Bh0vYzWWRGZmTmPbFZfU/WctM3azgyIzMyMz6xURRFGRfPscUQmZEZmZkX3/lEZmTG2EzH9Rf0IvPafcmQYgAAAABJRU5ErkJggg==' width="310" height="22" id='img_o3' alt='Hanoi, Vietnam O3 (ozone)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam O3 (ozone)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
                                    </td>
                                    {/* <td id='min_o3' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">4</td> */}
                                    {/* <td id='max_o3' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">11</td> */}
                                    </tr>
                                    <tr id='tr_no2'  style={{ height: '26px', backgroundColor: '#'}}>
                                        <td id='hdr_no2' nowrap>
                                            <div className='tditem'>
                                                <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>
                                                    NO2  <span style={{ fontWeight: 'normal', color: '#888', fontSize: '10px', fontFamily: "Arial Narrow,Arial,Helvetica,sans-serif" }}>AQI</span>
                                                </span>
                                            </div>
                                        </td>
                                        <td id='cur_no2' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{data["no2"]}</td>
                                        <td id='td_no2' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>

                                                                                        {/* <img class='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADJ0lEQVR42u2csYrbQBCGxyGFwTYWamyM1avIAwTcpkoprE2dN0gIeQH3IVc6jWqzFn6CtIYjT2CuPBtjFxErUH9p7sKR7GzYZSONrfnBjRfJo29HszOrkTtgrwkAHIGeqNrFzC7QNinlXPf9ZrO5X61WP5gZbbs6wGKxdIHtARlKhRA5E6Ktlw7HhABQELwWqnYxsyuybb/fh4TvZ5LMFovF2ziO32uGtkKIGyqBjcVqrQaDQSql/KYZyoUQKRP6W71ebwoAc2SYTGCjusIXhOeWmRG07XEfba0LUtgxQRAo9jM7RVFUu10vHI6ZEJ3UCWGHY2ZXYtv5fGZmltrtdrXbxRkbZ2zMzELD4bAwZIDaBw5CiE6bmY3H49qzXJJ7bKYSgfcxLk9SytcAMNUM3QohDi24/jXo95ha/4TV8PQ5R5h9BACdzxyEELe/AxvSr2NyuBAurL8IO6ZGp2qUGQG7PmFOKqXEnPTel21Syg8AMNP9ju25yrIMu90u1ThB0s9Op1MQBIGv080QX8oBIH2esekyoxTwDdSjg2OtkaGtg8Npz5UkyU2SJJ+R3/iKnKuuEoFqE+zR45x9eb5i+nTS/3wzWGk0Gvmcy5mU8h2y6KbX4mdxHNduF1aKTpEs5yCEuHOo5eeWY9YOp5R6FQTBG6IlUqP9RVi6r5T6jjDLHeYMzYxd5hNjZijrTDZ7y8yVUj6zj6mBpYtvku39i6KIRGBDV7gsy+b9ft+mJqa8h2BbIj1lk1PESXWZYV5VlQszrHxuxdsiWZb9NDBrg1zK97smDTYtoFQyNlSIszUuz/1Fs3+s/lYB3Cczw37R1vB9Hcy8qiV+5rusTpmZY2ArigLCkN5bJefzeTIajUjeDJ6ZmYLunJm118+Wy+UDwgxdjOvoMmiC2dVkbKb+Is4+mBkzsysfsS0Pl7c1mmDG74qyWCxdAPPWItOErF+pqqqK5IWUZUn2XxeYGTO7QGZPWx5/fqaXwMw6sFHc9wDw3l/kVcyMmTEzzticpJQKqDocM2NmzIx4YGOxWCzqsg5s3F9kL2bGzJgZffF/izEzZsa2kbbrF7gzaPFzjghEAAAAAElFTkSuQmCC' width="310" height="22" id='img_no2' alt='Hanoi, Vietnam NO2 (nitrogen dioxide)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam NO2 (nitrogen dioxide)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
                                                                                        </td>



                                    {/* <td id='min_no2' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">8</td> */}
                                    {/* <td id='max_no2' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">33</td> */}
                                    </tr>
                                    <tr id='tr_so2' style={{ height: '26px', backgroundColor: '#f6fbfd' }}>
                                        <td id='hdr_so2' nowrap>
                                            <div className='tditem'>
                                                <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>
                                                    SO2  <span style={{ fontWeight: 'normal', color: '#888', fontSize: '10px', fontFamily: "Arial Narrow,Arial,Helvetica,sans-serif" }}>AQI</span>
                                                </span>
                                            </div>
                                        </td>
                                        <td id='cur_so2' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{data["so2"]}</td>
                                        <td id='td_so2' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>


                                                                                        {/* <img class='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAB+klEQVR42u2avUoDQRRGv4ggMRiCWAV7O2shraWlYmm32/rzINruvoJ5BFvBV7CXVBJCREOq2KQQ3AnMOu5+xTnlDJO5OblzZ5PcjmK5Pct0NJz+Gs/LcXBNkZ0HZt4kHUaN5+VL4LWGkiZypI6zWIrsUNJJa87C+9f7nF8nx//urB6+eeYbW+NxdWok8CowcyNpVDH+LOk+sGYs6TxyPMTzhv1HLa7Z9P5vEu7/Jum6RWeh/et+ztWXYV52Wj2iRXYi6a7SS14+COKcpTxnP/xvRwf5tZR2d6pmRsFkTEv1HvPFQP3uadSazXPp1tRzFrv/uGVnaZ+kQs6K7DG4f15eJDyMq4Czp6CzIou9wC+SPoHeX60CeRZ/gaS8jDY5S3s2/1DYAHyfDFYNfDNIyeW6UKeJ+WtJDqzZil5RfSO0T787s7WMM5zhzLywzT495b3Ph7YJhzOc4cy8sPVMb4W97tQ24XCGM5yZFzYAAHPiC9un6Q+UH4t9W8s4wxnOzAvboOcp76A/sU04nOEMZ+aFzfUv5fliYJtwOMMZzswLGwCAOfSxNQHOcIYz88JGr4xwhjOceTujj60JcIYznJkXNgAAc+hjawKc4Qxn5oWNXhnhDGc483ZGH1sT4AxnODMvbAAA5tDH1gQ4wxnO7BkSF85wRmzOcX0DAsf4dRbNP/oAAAAASUVORK5CYII=' width="310" height="22" id='img_so2' alt='Hanoi, Vietnam SO2 (sulfur dioxide)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam SO2 (sulfur dioxide)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
                                                                                        </td>


                                    {/* <td id='min_so2' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">23</td> */}
                                    {/* <td id='max_so2' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">26</td> */}
                                    </tr>
                                    <tr id='tr_co' style={{ height: '26px', backgroundColor: '#' }}>
                                        <td id='hdr_co' nowrap>
                                            <div className='tditem'>
                                                <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>
                                                    CO  <span style={{ fontWeight: 'normal', color: '#888', fontSize: '10px', fontFamily: "Arial Narrow,Arial,Helvetica,sans-serif" }}>AQI</span>
                                                </span>
                                            </div>
                                        </td>
                                        <td id='cur_co' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{data["co"]}</td>
                                        <td id='td_co' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>


                                        {/* <img class='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAC60lEQVR42u2csY7TQBCG/8AdR+7ABCtCp8h0V/AIEXQ8AJUt+ivijiai4yWQaOJXSAo6ngAUQcE7IOMCoSQEheh0SNCcBIVnpd1b2+Pk/8td+Tz+djw7s55cB/YaACigT1rtIrM22jYZxaXj7z5/wdtPH8lMt10dUBRVFtj+CDMJ0mxGQLp1w+GaUOmzhIo5k9mu2FYsyawFdh0wtlOUhW7dfCiUqTnSbE5AOuQS2BZKn2WhmDOZ7Ypt/eARgFclMzMACZnpsMslsPGAksz217bv6wH6AcjMQi+fvcDZ6evSzSDNKtkMmLFxJyUzG93tkpmtHtxbiXPS1+drfqDhGRtFUU1qKoxfq2PDJbCFSssXrXa1k5nc7jADULbL+m6D0Mns5zbE0SHoZxb69qOHoFvrLV0CW/XgJqMIwLBkJgcQCVfNkWZaHa6gXa3zs3L1g6Lusqr163l2WjiszVB413Nx/L+v0q4ZW9W1/FBIUaVsASiWKQCtka0OZrtklwY/K9d6a8o+KimrWr+exTLE4L7tVWPhXZ8ZxpN/ga285Kinu3oymhqMtNOd2wkmo4lVMEyzjsdnicWXJM3SPTgreX61nrB0xrhyZj79zO/9+SuGmkvRSGxClEvB3DJ19Kugu6oh3TXNRYb7PLUuUaSyRr7/HGmWe/pbuQLfXHhcs2b9TFbkdZ2bztbkZznWEtieiDvcahOjd+JjV/a7Y7r1F40dbbbb/VebqcDMlDHaZj+JwYapwOwD+sHjxjIZs6SerHEL/QyW75nrOjfdx2byMxWBTdbJkc7cU3N/kcTMb4kklYKzVjJ7c/4VhwfVBql2+pm8zpe/YwMzqeRPdpEZ+9goap8ln4u+v8oobcbVyD6wbS6AnsJ4qLm/iMzITC+z2GEu1s7M/t8WlZ8VNS9Tf1HTIjMyIzPlge3XhU54621PrcORGZmRmfLARlEUpVz2ge1Y6VdRv/1FfkVmZEZm6jWgXWRGZrRNs11/AQicDpfSr/pyAAAAAElFTkSuQmCC' width="310" height="22" id='img_co' alt='Hanoi, Vietnam CO (carbon monoxide)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam CO (carbon monoxide)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
                                        </td>

                                        {/* <td id='min_co' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">3</td> */}
                                    {/* <td id='max_co' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">13</td> */}
                                    </tr>
                                    <tr id='tr_t'  style={{ height: '26px', backgroundColor: '#f6fbfd' }}>
                                        <td id='hdr_t' nowrap>
                                            <div className='tditem'>
                                                <div title='Hanoi, Vietnam  t (temp.) , expressed in degrees celcius and  measured by wunderground.com'>
                                                    <span style={{ fontWeight: 'normal', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>Temp. </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td id='cur_t' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">
                                            <span className='temp' format='nu' temp="19">{data["t"]}</span>
                                        </td>
                                        <td id='td_t' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>


                                        {/* <img class='aqi-graph-img' border="0" src='data:image/png;base64,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' width="310" height="30" id='img_t' alt='Hanoi, Vietnam  t (temp.)  measured by Citizen Weather Observer Program (CWOP/APRS).' title='Hanoi, Vietnam  t (temp.)  measured by Citizen Weather Observer Program (CWOP/APRS).'/> */}
                                        </td>


                                    {/* <td id='min_t' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">
                                        <span className='temp' format='nu' temp="18">18</span>
                                    </td>
                                    <td id='max_t' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">
                                        <span className='temp' format='nu' temp="21">21</span>
                                    </td> */}
                                    </tr>
                                    <tr id='tr_p' style={{ height: '26px', backgroundColor: '#' }}>
                                        <td id='hdr_p' nowrap>
                                            <div className='tditem'>
                                                <div title='Hanoi, Vietnam  p (pressure:)  measured by wunderground.com'>
                                                    <span style={{ fontWeight: 'normal', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>Pressure </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td id='cur_p' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{data["p"]}</td>
                                        <td id='td_p' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>


                                        {/* <img class='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAD30lEQVR42u1dTU9TQRQ90w+iDbGloU15VEOaYMQYMZEF0tSNJG5ckRJW/gB3Jv4OEv+CS2w37nEjIZIIRjZgopKqpZKWlGKkYr+uG3fMtHlt83r7vGc5k2nPO2/mzp1777SAfVjgCa68RDPRTDQTCAQCQW9Q9DqY0bSvqgenW4YxYQBlhs/ClZdoJpqJZg7z8gFIa9rXxOYLBIJhha+LMVx3qzJjnV2jGb0JZAyb4bK6X82KZsKNAy+9YfO24vTWr5u8eXWv/g1AgaF4FlNenLmJZqKZK3npDZunmTTsylkAj2VXkJ1UNBNuw+exDSG+vMJCYhJPNF2bAJKGYaa+bsasqjlsuUVP2kZG21E1zaRGkraxoutSc1iGQMDcsIU5uruFEm4lJrVeJgzeZ6c+u2PWhk2zDrxMz6+PoymKd9DMFfOMMS/RrBfDRruBQ+28nq0qRzyJ3QBpO1r1LJp1rhsIy4VAu4EFQOuZZVGv9vN7zAmHWWPCoSDv0jXcHOdl27CVfxLCVy7aMNobnwcQ1wzJG9rb9ZnbDQvu6Bih2NgAX53XH6e9oDbh8uFj4/qdGz47liKvbh737VhLe+NaT+og93s2MUlcF6nUZIlmjh5FTXgGc8Kh3bEmbbOdJzx+Y8Ll2oTH7hEtC/Q1LqWNlwUC3nWgAYHAbbBt2HTeGgfExlFBk+k2GvQw1UwNVjPfpSR9iugSDptq+utzpmtGsqJDwMu2YSsUCVaUn3E7yJOVmGAaYCi2YEX5GbeD7y0rMcjrycrbLuHwElKT5RZuTOrY2mAsyNNji44ptjtpN5pRbob6dnyvlvSahZV4Hzbx4930Yizie2FD/27eGdTUvnKLZt3wotyMOeE0td8xJOWaOjaBu3D4/vYjK+a/uOCtnez/8PxUuGtKxm0payfvoufUbwa13rLytg3bySnhMsOjaPGEwqNMj6JsNStTeJTvL2VlTAfYQZL6nKuFYhFH/AFTMm4Z5iTaMNaxZdp4uc4ZNo7xNQBIxFWBa/KAY3wNABJXPQU0eYqm89YAgEqppzDcFlGRDVsJByql5v8ZkAufBdPNkz+/8micD04Yjy9JpdSKHc4qsuHIzQ8qpUxGynzDp4/1kj0ZNlMd26Ax8Dq2dpqdtlhmRo+Oia9mlQbCIe30NJXVAIDdTGq75EVar1lzPRYaoDBKGTmXK420QTOnoNesWAvFoiOLThKRGJvA9aDKQ30gmvdtFa5apuHAbRXHDZvUsXURYJA6NvuadeF50NmS3vuqn/VPs6i/glp9qDSjs6X+3QpqnMdBTZuajVSGwWjLH0aIZqKZcGPN6y+GLUw99+HpKgAAAABJRU5ErkJggg==' width="310" height="22" id='img_p' alt='Hanoi, Vietnam  p (pressure:)  measured by Citizen Weather Observer Program (CWOP/APRS).' title='Hanoi, Vietnam  p (pressure:)  measured by Citizen Weather Observer Program (CWOP/APRS).'/> */}
                                        </td>


                                    {/* <td id='min_p' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">1016</td>
                                    <td id='max_p' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">1022</td> */}
                                    </tr>
                                    <tr id='tr_h' style={{ height: '26px', backgroundColor: '#f6fbfd' }}>
                                        <td id='hdr_h' nowrap>
                                            <div className='tditem'>
                                                <div title='Hanoi, Vietnam  h (humidity)  measured by wunderground.com'>
                                                    <span style={{ fontWeight: 'normal', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>Humidity </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td id='cur_h' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{data["h"]}</td>
                                        <td id='td_h' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                                        {/* <img class='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAD/0lEQVR42u1bS2tTQRQ+eb/tTVKtTYOEKsaN3dRFbaTQhYhFkWJDNj5wIeKuUhQKXWQRKAhF/AVScFNypYhQKC4KQmsXunPTTS0SU0SbhCZt3qkLi4s6kzK3tzfHm/Mtz3DvfPPdM3Pn8Y0BxBEAgDTgA1ZeutLs8pO1AQAIMopWP74Ip0gz4oaBl1nBM1g/KlZeetNsAgDGGPEoAMikGXHDwMuo4BkfUvF8iBOONCPNSDPkMzZCG2Do6Zc9VrxaU3VWRiCgmbFlkLYlg1hn0ow0I82QD2wBpOIFECccaUaakWbIl6L0V9AJtyuP315wSD0vGUXL5ZrYuyymauTq5KcYq+z99KUo5RnN2LAPbASdwGSxB4F9wikMg2FPtXcRCEce2EamVljJmAK2Vym1kBj8BoLHt5w6mtYjGIcfax8aXeEhI4fz6nELOTK1EgSAAVb9Wxuf+/yhfpG/FredamqW3fx60erygwbacL1vC4lBnvfNBzjtC1h5oeUWHn7UdzZy/4yWfdMMAElGXOb8fWX441cSRZITb1aPSBy6wkNqcxbFAE9Lf6hfdCYjN5n9qKZZx+lzcr2hSW4r8b6RJ0sn3PYHtaSWfVM3PrZyISNhzbZqcRtwarYlIe6k5MnSCbf8z3X8PrbrE/Ks3eMvHYzPx4ej0AYYjS+NA0DkYLzWqKfqDRNtbhDaFqPxJebKLJ/LFtTqZwAwMx8fPnT5Kjyw2T3+GxhFtbl9OY2qirCWVYYm14ksjhOAUzN/TqOlqBLQCd//x4255eE8cVKuNdTpZwAwdyxL0VL+F8ovuptNo/UX4dXsO3my9MMLLbedFvRN4RmbxeFhxmOJxSRnhJXzpeNviNUlcf9WscTiHqdIeMO9ouBKEU+zVsPq8rb0D28zV2L7efOP/nNT1+7SrAgft1hicQw4BwEVjvfRpqBvVo54dc8IBAKBoDMIz9iqxTyYPDZ0Dans5HxmqxOlyHg1y/psHR6sudlST9ad6XfMjfDs5vqGt7s3xChaBvZmN7yevBltB814KO/kNM8zBYcHnSh7gdMbQOsvwqtZTxrx4UGrvydzK8Lb3dvMYzjW5pox4fIG0jWN80x4YKsU82BFuGdULmQkmxunxaha3EZ5MloubElm5ymUmt0an7nnC4R2GUXcGxavnt1m2gAePH/Du/nAfVe1zuZVzGclh8cr1BYF9Tflxotn0hvnRTUTrb9cqwdFbU2lFuQZ3RUloIRL6pzlFCm5YTIB4rc11IRo/YdxY8ZdUqda7+KWGQ11uQ74/ZrCA5sV6Qmfhj42YZCPTQE3p1v4mYczc8xOWqurx8vh8aLNMyWaaQG725+r4d3y+AvyF5FmpBlxQ83rN4qbUuyVTEgxAAAAAElFTkSuQmCC' width="310" height="22" id='img_h' alt='Hanoi, Vietnam  h (humidity)  measured by Citizen Weather Observer Program (CWOP/APRS).' title='Hanoi, Vietnam  h (humidity)  measured by Citizen Weather Observer Program (CWOP/APRS).'/> */}
                                        </td>

                                        {/* <td id='min_h' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">75</td>
                                    <td id='max_h' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">97</td> */}
                                    </tr>
                                    <tr id='tr_w'  style={{ height: '26px', backgroundColor: '#' }}>
                                        <td id='hdr_w' nowrap>
                                            <div className='tditem'>
                                                <div title='Hanoi, Vietnam  w (wind)  measured by wunderground.com'>
                                                    <span style={{ fontWeight: 'normal', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>Wind </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td id='cur_w' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{data["w"]}</td>
                                        <td id='td_w' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>


                                        {/* <img class='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEN0lEQVR42u1cS0wTQRj+tw+2W+KiiyTaVs+eSEEIDUWUSMLFgwcaLxzl7cHEq0evJHowIHrxSOiNkwmJ0CipwSgaY7h4MQUTH0WqPEqx48GbzGyYZbr92f7fcYZh/377zcz/ajWQRwQA1v8f7BvMJAAgxvn73LPH3VmoPLh2IQFW25TZ1TeYiQFAQjCdE2nDRjOfvc4Z6axyCDhYIzLwDgD0c8bTAJBy4bNgFRtm21TalQCAWcFc2kYb1dQM6cyjdvkcrLGQkmchFhxxRpwRZ256bL1DS7xbdmJ+upMbPl4amHuqhxt3D0ywfeFDBM8AAHgJAEmZ8fnpzvtAqFn0Di3dJm0QDhOK8kKBGdECPdx4zSbcEKHfwZxoXCTePGKe82SXMtuSDrRR65zVnF38HJum3bg6nOV5Weni76+g15/GSB4ldT3EWdfAHNPrmw5OsHKaOCOdOTvYbBDUT9BtVcM3ac/wMrf6zVgxprGyMsOCuknvsgZ01jO8zPW+nz9qP9IFFgACQQ7c6ncZ/Gk/lIkdgixE+XfN1YOtVPwFekDHSJCFOETAahtazkrFAuiBJqk1V0ZeM974wlSbpsqulutPhhrOxB9wptILU22pWn6fIv53CmtLhhnt5HEGjOEIRZHm1wCov0iIyyNvRMn27OJUq9wa9scVm7n5NeefX9g8LjkOGjAfAPO8zpxxxvfYDTO6rvD52cWp1lwFPLZCVfMf3aMr3A23+eXtdsPZlrCMSG3mspnJeE6h2Zaq/Ef36Iq84Fh5VnCT3useXXknswbsq99KPTaFOrNrHpcZh73tH/N1YUtKm5nJuFsFD67O7DSTmYxnFXIGAs5O1oUbVb2z1GE0eBxzbNwNZzScnweAXhmR2syl3NrALm1SLvxBIwEAd6t1eHkQFckXVVgzKS++CAdVUZzVqrpw40/EPOexcoY1qMKtMznWukbfi5qKJ15MNmdrQWfoD7bi1neUebbdQi4SMmNYDzbpPp7k2Af+7W/zDQ9Z7BRykZB5DiVhxa1vSvNs6jhbixhmRHaZqKl4pto6c4+zKHaPDWcfW9CwvNZfZBc+q+EshJczrB5b0DhFfWyyHlsVOKM+NgKhhtE59pEfV5d3j3We1TN9bKWdvOUPhiv+nMT4qrAMnX14QVRJRdkvVtrNW/66epTCdNLH5o7ONqxA0FDyv5jmiyXGV0WeufRv2BXWXjWb0Y4855CqKmd7OxuW4cLePNLBhrWPLWTG3Do4nJShUfbYGWZsHWvxAGN+7R9n0XVVfWwMtCTIV+yF42a0o+LpC+ecoffYCijzHw57ZVzBxZvLLKA3yCxJA9tzhbNgGOdFhVtnOH/2bL+4CZI68+ze9AGBQCB4DNTHxkFZ88fab30SfKWoJAorRGtyPpe+huSEM+pjc6IznKxh9NZU781KIkJ2EWfEGdmG2a6/LTF3mU4TCeAAAAAASUVORK5CYII=' width="310" height="22" id='img_w' alt='Hanoi, Vietnam  w (wind)  measured by Citizen Weather Observer Program (CWOP/APRS).' title='Hanoi, Vietnam  w (wind)  measured by Citizen Weather Observer Program (CWOP/APRS).'/> */}
                                        </td>
                                        {/* <td id='min_w' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">1</td>
                                    <td id='max_w' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">4</td> */}

                                    </tr>
                                    </table>
                                </Box>

                                                    {/* <script>
                                                        try {
                                                            setWidgetAqiGraphImages([{
                                                                "w": 310,
                                                                "h": 30,
                                                                "v": "pm25",
                                                                "hdr": 1
                                                            }, {
                                                                "w": 310,
                                                                "h": 22,
                                                                "v": "pm10"
                                                            }, {
                                                                "w": 310,
                                                                "h": 22,
                                                                "v": "o3"
                                                            }, {
                                                                "w": 310,
                                                                "h": 22,
                                                                "v": "no2"
                                                            }, {
                                                                "w": 310,
                                                                "h": 22,
                                                                "v": "so2"
                                                            }, {
                                                                "w": 310,
                                                                "h": 22,
                                                                "v": "co"
                                                            }, {
                                                                "w": 310,
                                                                "h": 30,
                                                                "v": "t",
                                                                "hdr": 1
                                                            }, {
                                                                "w": 310,
                                                                "h": 22,
                                                                "v": "p"
                                                            }, {
                                                                "w": 310,
                                                                "h": 22,
                                                                "v": "h"
                                                            }, {
                                                                "w": 310,
                                                                "h": 22,
                                                                "v": "w"
                                                            }]);
                                                            ;
                                                        } catch (e) {}
                                                    </script> */}
                                                </div>
                                            </div>
                                        </div>
                    </Box>
            }
        </>
    );
}