import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Stack,
    SvgIcon,
    Typography,
    useTheme
  } from '@mui/material';
import { tokens } from "../theme";
import Header from "./Header";
import {host} from "../App"
import { React, useEffect, useState } from "react";
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import temp_icon from "../assets/temperature.svg";
import hum_icon from "../assets/humidity.svg";
import co2_icon from "../assets/co2.svg";
import tvoc_icon from "../assets/tvoc.svg";
import dust_icon from "../assets/dust.svg";
import sound_icon from "../assets/sound.svg";
import light_icon from "../assets/light.svg";
import motion_icon from "../assets/motion.svg";
import AQI from './AQI';




const InformationTag = ({url, callbackSetSignIn, time_delay, room_id, setActuatorInfoOfRoom}) => {
    const backend_host = host;
    const api_informationtag = url;
    

    const [isLoading, setIsLoading] = useState(true)
    const [infoData, getInfoData] = useState(null);
    const [nodeData, getNodeData] = useState(null);

    const iconMap = {
        temp: (
            <img height="70px" width="70px"  src={temp_icon} />
        ),
        hum: (
            <img height="70px" width="70px"  src={hum_icon} />
        ),
        co2: (
            <img height="70px" width="70px"  src={co2_icon} />
        ),
        tvoc: (
            <img height="70px" width="70px"  src={tvoc_icon} />
        ),
        dust: (
            <img height="70px" width="70px"  src={dust_icon} />
        ),
        light: (
            <img height="70px" width="70px"  src={light_icon} />
        ),
        sound: (
            <img height="70px" width="70px"  src={sound_icon} />
        ),
        motion: (
            <img height="70px" width="70px"  src={motion_icon} />
        ),
      };
    const dict_of_enviroment_para_names = 
    {
        "temp": {"name":" Temparature", "icon":iconMap["temp"], "unit":"°C"}, 
        "hum": {"name":"Humidity", "icon":iconMap["hum"], "unit":"%"}, 
        "co2": {"name":"Co2", "icon":iconMap["co2"], "unit":"ppm"}, 
        "tvoc": {"name":"TVOC","icon":iconMap["tvoc"], "unit":"µg/m3"},
        "dust": {"name": "Dust", "icon":iconMap["dust"], "unit": "µm"},
        "sound": {"name": "Sound", "icon":iconMap["sound"], "unit": "dB"},
        "light": {"name": "Light", "icon":iconMap["light"], "unit": "lux"},
        "motion": {"name": "Motion Detection", "icon":iconMap["motion"], "unit": ""},
    }

    const get_information_data = async (url, access_token) => 
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
        const response = await fetch(url, option_fetch)
        const data = await response.json()
        if(data)
        {   
            let newInfoData = {
                    "temp": null, 
                    "hum": null, 
                    "co2": null, 
                    "tvoc": null,
                    "dust": null,
                    "sound": null,
                    "light": null,
                    "motion": null,
            }
            
            const array_of_keys_in_dict_of_enviroment_para_names = Object.keys(dict_of_enviroment_para_names);
            array_of_keys_in_dict_of_enviroment_para_names.forEach((each_key) => {
                    if (data.hasOwnProperty(each_key) && each_key === "motion") 
                    // if (data.hasOwnProperty(each_key) && data[each_key][data[each_key].length-1] !== 0) 
                    {
                        if(data[each_key][data[each_key].length-1] > 0)
                        {
                            const motion_data = (data[each_key][data[each_key].length-1] == 1 ? "Yes" : "No");    //!< data[each_key][data[each_key].length-1] (last element of array)
                            newInfoData[each_key] = { 
                                "title": dict_of_enviroment_para_names[each_key]["name"], 
                                "icon": dict_of_enviroment_para_names[each_key]["icon"], 
                                "value": motion_data,
                                "unit": dict_of_enviroment_para_names[each_key]["unit"],
                            }; 
                        }
                        else
                        {
                            newInfoData[each_key] = {
                                "title": dict_of_enviroment_para_names[each_key]["name"], 
                                "icon": dict_of_enviroment_para_names[each_key]["icon"], 
                                "value": "No Data",    //last element of array data
                                "unit": "",
                            }; 
                        }
                    }
                    else if (data.hasOwnProperty(each_key) && each_key !== "motion")
                    // if (data.hasOwnProperty(each_key) && data[each_key][data[each_key].length-1] !== 0) 
                    {
                        if(data[each_key][data[each_key].length-1] > -1)
                        {

                            newInfoData[each_key] = {
                                "title": dict_of_enviroment_para_names[each_key]["name"], 
                                "icon": dict_of_enviroment_para_names[each_key]["icon"], 
                                "value": data[each_key][data[each_key].length-1],    //last element of array data
                                "unit": dict_of_enviroment_para_names[each_key]["unit"],
                            };  
                        }
                        else
                        {
                            newInfoData[each_key] = {
                                "title": dict_of_enviroment_para_names[each_key]["name"], 
                                "icon": dict_of_enviroment_para_names[each_key]["icon"], 
                                "value": "No Data",    //last element of array data
                                "unit": "",
                            }; 
                        }
                    }
                });

            newInfoData["time"] = parseInt(data["time"]);
            getInfoData(newInfoData);
            console.log(newInfoData);
            let newNodeData = {};
            newNodeData["sensor"] = data["node_info"]["sensor"];
            newNodeData["actuator"] = data["node_info"]["actuator"];
            setActuatorInfoOfRoom(newNodeData["actuator"]);
            console.log("THIS IS FROM INFORMATION TAG");
            console.log(newNodeData["actuator"]);
            getNodeData(newNodeData);
            setIsLoading(false);
        }
        else
        {
            console.log("Some error happened, try to reload page!");
        }
    }

    const verify_and_get_data = async (fetch_data_function, callbackSetSignIn, backend_host) => 
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

    useEffect(() => {
        if(time_delay !== 0)
        {
            if(infoData === null)            //!< this is for the total component always render the first time and then the next time will be setTimeOut
            {
                verify_and_get_data(get_information_data, callbackSetSignIn, backend_host, api_informationtag); 
            }
            else
            {
                const timer = setTimeout(()=>{
                        verify_and_get_data(get_information_data, callbackSetSignIn, backend_host, api_informationtag); 
                    }, time_delay);
                return () => clearTimeout(timer);
            }
        }
        else
        {
            verify_and_get_data(get_information_data, callbackSetSignIn, backend_host, api_informationtag); 
        }
    },[infoData, nodeData]);



    return (
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
                                    <b>Room AQI</b>
                                </span>
                            </div>
                            </td>
                            <td className='aqiwgtsharebtn' style={{ verticalAlign: 'text-top;min-width:22px;' }}></td>
                        </tr>
                    </table>    
                    </Box>
                </div>
                </div>
                </div>
                </Box>
                <AQI room_id={room_id} callbackSetSignIn={callbackSetSignIn} />
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
                                    <b>Room Information </b>
                                {/* </a> */}
                                : 
                                </span>
                                <span id='aqiwgtutime'>
                                    Updated on {
                                            (()=>{
                                                const new_time = infoData["time"] - 7*60*60;
                                                const utcDate = new Date(new_time * 1000); // Convert seconds to milliseconds
                                                const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
                                                const formattedDateTime = utcDate.toLocaleDateString('en-US', options);

                                                return formattedDateTime;
                                            })()   //run this function
                                        }
                                </span>
                            </div>
                            </td>
                            <td className='aqiwgtsharebtn' style={{ verticalAlign: 'text-top;min-width:22px;' }}></td>
                            </tr>
                        </table>
                    </Box>
                </div>
                </div>
                </div>
                    <Box display="flex" flexDirection="column" justifyContent="center" 
                    alignItems="center"
                    // justify="center"
                    >
                    <span colSpan="2" style={{ textAlign: 'left', fontWeight: 'bold', width: '300px', fontSize: "15px" }} align="center" nowrap="true">
                        {(()=>{
                            let data = "Sensor id: ";
                            nodeData["sensor"].forEach((e)=>{data += e["node_id"]; data+= ", "})
                            return data;
                        })()}
                    </span>
                    <span colSpan="2" style={{ textAlign: 'left', fontWeight: 'bold', width: '300px', fontSize: "15px" }} align="center" nowrap="true">
                        {(()=>{
                            let data = "Actuator id: ";
                            nodeData["actuator"].forEach((e)=>{data += e["node_id"]; data+= ", "})
                            return data;
                        })()}
                    </span>
                    </Box>
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
                        {
                            dict_of_enviroment_para_names["temp"]["name"]
                        }
                    </span>
                </div>
                </td>
                <td id='cur_pm25' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{infoData["temp"]["value"]}</td>
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
                        {
                            dict_of_enviroment_para_names["hum"]["name"]
                        }
                </span>
                </div>
            </td>
            <td id='cur_pm10' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{infoData["hum"]["value"]}</td>
            <td id='td_pm10' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                {/* <img className='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADeklEQVR42u1dPU8bQRB9/ooxJsZxIEHoROGCIhQp3Fhyi1KlSHFW/oHdEuV3IJLSLtNFXJEiRRTRItG4o3aBkMWnsZ0YYhm4FAlSFO+ctcdxNz7Pk2j2ODz79u3bmbuxAPSxDJ7gGpdwJpwJZz4jYjcL24rxzUi+sQeBQCCYQETsZsFWjH8AYCjGdyP5xicAbYZzyTGNi3NswplwFsq44sS4AcBUXdj/9uJybTU1EmQk37DknBAIBBwQ171hbTVVo7K/gOfSZsxzW+ISzoQzxsbWOh5i+XliZNxuFopE+Xro0/O6ZQAtpgsbaGx2s6DMvr9879y+eZWNBrhmk7ieorMA47KbBQNAcZxmtY3tyXyMuvSeKF8tAGU5SQOF6gUR1kuZrwBeq9aMMkMA7wCUVMICsEHcYzloQzn+s387M5eO/hopC/KN8pSv5VRkbA6JkgFga5zPxH2ZVq1iK8er9QgEXnFsEgZmAQ0vP6nkYFKeIRZTGi5Qq2yTn1+tl0UIE6fbbfWFBu6jM21ju+jeIDUT9WpSG8Tpv4lqXbcUyjEuEVjGdnI+zM2lkywJc6UzapN4a3j0WpKbFNQmpboPAGCX2Bufid8/RLV+wHQPOOnfdMjyXUPb2FTP1x7g9N9FrWIQi7dHiCpK/K1DFybpNVgabn4lyfUgcKsz04cMYwXAR8KIdDepMSZmU2PcQq2iyw1tHtRh8GdfFolHEYbDPLceOsu/l7G1u9fIzT94BVtyWDz1YveudpBJrWstuH+li3d9PE6lmCaOTofZpcUEOMJTndGclVGtWw6l/SjOei+xkDFZknY5MDGb1M1+TBc60xm/25u+UhHHdMD0oRQWTB7eEuUjvUkfJXaENv7QNjYfsjV3yKQ6HmaG9Imt/1bQGlOimC7u8QRLi4kOV2GGTGf+YDYpnP2F9luA1vGQJ3lnPb++aHtnhv//GOQdnT5LypoHA7Zf6BaduQBTnQXBmbaxOfSxBYvHKb79RUzfPD57mmDLmegsPDoLgrMoBAKBIGTQNraL7g3Pmfy4yrFluT9gGdbJ+ZAtZ6Kz8OgsCM60jc3jPjbvsJBh25OFbJplWCHsYxOdCWfujK3dveZJXu8qy1ZwlzxP0qPTIVvORGfh0VkQnMkzNoFAEDpoG5v0F7kA0/4i6WMTnU09Z/9A/mGEcCacSWys4/oNEsAfAirntOwAAAAASUVORK5CYII=' width="310" height="22" id='img_pm10' alt='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
            </td>
            {/* <td id='min_pm10' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">29</td> */}
            {/* <td id='max_pm10' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">72</td> */}
            </tr>




            <tr id='tr_pm25'  style={{ height: '26px', backgroundColor: '#edf6fb' }}>
                <td id='hdr_pm25' nowrap>
                <div className='tditem'>
                    <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>
                        {
                            dict_of_enviroment_para_names["co2"]["name"]
                        }
                    </span>
                </div>
                </td>
                <td id='cur_pm25' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{infoData["co2"]["value"]}</td>
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
                        {
                            dict_of_enviroment_para_names["tvoc"]["name"]
                        }
                </span>
                </div>
            </td>
            <td id='cur_pm10' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{infoData["tvoc"]["value"]}</td>
            <td id='td_pm10' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                {/* <img className='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADeklEQVR42u1dPU8bQRB9/ooxJsZxIEHoROGCIhQp3Fhyi1KlSHFW/oHdEuV3IJLSLtNFXJEiRRTRItG4o3aBkMWnsZ0YYhm4FAlSFO+ctcdxNz7Pk2j2ODz79u3bmbuxAPSxDJ7gGpdwJpwJZz4jYjcL24rxzUi+sQeBQCCYQETsZsFWjH8AYCjGdyP5xicAbYZzyTGNi3NswplwFsq44sS4AcBUXdj/9uJybTU1EmQk37DknBAIBBwQ171hbTVVo7K/gOfSZsxzW+ISzoQzxsbWOh5i+XliZNxuFopE+Xro0/O6ZQAtpgsbaGx2s6DMvr9879y+eZWNBrhmk7ieorMA47KbBQNAcZxmtY3tyXyMuvSeKF8tAGU5SQOF6gUR1kuZrwBeq9aMMkMA7wCUVMICsEHcYzloQzn+s387M5eO/hopC/KN8pSv5VRkbA6JkgFga5zPxH2ZVq1iK8er9QgEXnFsEgZmAQ0vP6nkYFKeIRZTGi5Qq2yTn1+tl0UIE6fbbfWFBu6jM21ju+jeIDUT9WpSG8Tpv4lqXbcUyjEuEVjGdnI+zM2lkywJc6UzapN4a3j0WpKbFNQmpboPAGCX2Bufid8/RLV+wHQPOOnfdMjyXUPb2FTP1x7g9N9FrWIQi7dHiCpK/K1DFybpNVgabn4lyfUgcKsz04cMYwXAR8KIdDepMSZmU2PcQq2iyw1tHtRh8GdfFolHEYbDPLceOsu/l7G1u9fIzT94BVtyWDz1YveudpBJrWstuH+li3d9PE6lmCaOTofZpcUEOMJTndGclVGtWw6l/SjOei+xkDFZknY5MDGb1M1+TBc60xm/25u+UhHHdMD0oRQWTB7eEuUjvUkfJXaENv7QNjYfsjV3yKQ6HmaG9Imt/1bQGlOimC7u8QRLi4kOV2GGTGf+YDYpnP2F9luA1vGQJ3lnPb++aHtnhv//GOQdnT5LypoHA7Zf6BaduQBTnQXBmbaxOfSxBYvHKb79RUzfPD57mmDLmegsPDoLgrMoBAKBIGTQNraL7g3Pmfy4yrFluT9gGdbJ+ZAtZ6Kz8OgsCM60jc3jPjbvsJBh25OFbJplWCHsYxOdCWfujK3dveZJXu8qy1ZwlzxP0qPTIVvORGfh0VkQnMkzNoFAEDpoG5v0F7kA0/4i6WMTnU09Z/9A/mGEcCacSWys4/oNEsAfAirntOwAAAAASUVORK5CYII=' width="310" height="22" id='img_pm10' alt='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
            </td>
            {/* <td id='min_pm10' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">29</td> */}
            {/* <td id='max_pm10' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">72</td> */}
            </tr>

            <tr id='tr_pm25'  style={{ height: '26px', backgroundColor: '#edf6fb' }}>
                <td id='hdr_pm25' nowrap>
                <div className='tditem'>
                    <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>
                        {
                            dict_of_enviroment_para_names["dust"]["name"]
                        }
                    </span>
                </div>
                </td>
                <td id='cur_pm25' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{infoData["dust"]["value"]}</td>
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
                        {
                            dict_of_enviroment_para_names["sound"]["name"]
                        }
                </span>
                </div>
            </td>
            <td id='cur_pm10' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{infoData["sound"]["value"]}</td>
            <td id='td_pm10' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                {/* <img className='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADeklEQVR42u1dPU8bQRB9/ooxJsZxIEHoROGCIhQp3Fhyi1KlSHFW/oHdEuV3IJLSLtNFXJEiRRTRItG4o3aBkMWnsZ0YYhm4FAlSFO+ctcdxNz7Pk2j2ODz79u3bmbuxAPSxDJ7gGpdwJpwJZz4jYjcL24rxzUi+sQeBQCCYQETsZsFWjH8AYCjGdyP5xicAbYZzyTGNi3NswplwFsq44sS4AcBUXdj/9uJybTU1EmQk37DknBAIBBwQ171hbTVVo7K/gOfSZsxzW+ISzoQzxsbWOh5i+XliZNxuFopE+Xro0/O6ZQAtpgsbaGx2s6DMvr9879y+eZWNBrhmk7ieorMA47KbBQNAcZxmtY3tyXyMuvSeKF8tAGU5SQOF6gUR1kuZrwBeq9aMMkMA7wCUVMICsEHcYzloQzn+s387M5eO/hopC/KN8pSv5VRkbA6JkgFga5zPxH2ZVq1iK8er9QgEXnFsEgZmAQ0vP6nkYFKeIRZTGi5Qq2yTn1+tl0UIE6fbbfWFBu6jM21ju+jeIDUT9WpSG8Tpv4lqXbcUyjEuEVjGdnI+zM2lkywJc6UzapN4a3j0WpKbFNQmpboPAGCX2Bufid8/RLV+wHQPOOnfdMjyXUPb2FTP1x7g9N9FrWIQi7dHiCpK/K1DFybpNVgabn4lyfUgcKsz04cMYwXAR8KIdDepMSZmU2PcQq2iyw1tHtRh8GdfFolHEYbDPLceOsu/l7G1u9fIzT94BVtyWDz1YveudpBJrWstuH+li3d9PE6lmCaOTofZpcUEOMJTndGclVGtWw6l/SjOei+xkDFZknY5MDGb1M1+TBc60xm/25u+UhHHdMD0oRQWTB7eEuUjvUkfJXaENv7QNjYfsjV3yKQ6HmaG9Imt/1bQGlOimC7u8QRLi4kOV2GGTGf+YDYpnP2F9luA1vGQJ3lnPb++aHtnhv//GOQdnT5LypoHA7Zf6BaduQBTnQXBmbaxOfSxBYvHKb79RUzfPD57mmDLmegsPDoLgrMoBAKBIGTQNraL7g3Pmfy4yrFluT9gGdbJ+ZAtZ6Kz8OgsCM60jc3jPjbvsJBh25OFbJplWCHsYxOdCWfujK3dveZJXu8qy1ZwlzxP0qPTIVvORGfh0VkQnMkzNoFAEDpoG5v0F7kA0/4i6WMTnU09Z/9A/mGEcCacSWys4/oNEsAfAirntOwAAAAASUVORK5CYII=' width="310" height="22" id='img_pm10' alt='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
            </td>
            {/* <td id='min_pm10' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">29</td> */}
            {/* <td id='max_pm10' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">72</td> */}
            </tr>

            <tr id='tr_pm25'  style={{ height: '26px', backgroundColor: '#edf6fb' }}>
                <td id='hdr_pm25' nowrap>
                <div className='tditem'>
                    <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>
                        {
                            dict_of_enviroment_para_names["light"]["name"]
                        }
                    </span>
                </div>
                </td>
                <td id='cur_pm25' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{infoData["light"]["value"]}</td>
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
                        {
                            dict_of_enviroment_para_names["motion"]["name"]
                        }
                </span>
                </div>
            </td>
            <td id='cur_pm10' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{infoData["motion"]["value"]}</td>
            <td id='td_pm10' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                {/* <img className='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADeklEQVR42u1dPU8bQRB9/ooxJsZxIEHoROGCIhQp3Fhyi1KlSHFW/oHdEuV3IJLSLtNFXJEiRRTRItG4o3aBkMWnsZ0YYhm4FAlSFO+ctcdxNz7Pk2j2ODz79u3bmbuxAPSxDJ7gGpdwJpwJZz4jYjcL24rxzUi+sQeBQCCYQETsZsFWjH8AYCjGdyP5xicAbYZzyTGNi3NswplwFsq44sS4AcBUXdj/9uJybTU1EmQk37DknBAIBBwQ171hbTVVo7K/gOfSZsxzW+ISzoQzxsbWOh5i+XliZNxuFopE+Xro0/O6ZQAtpgsbaGx2s6DMvr9879y+eZWNBrhmk7ieorMA47KbBQNAcZxmtY3tyXyMuvSeKF8tAGU5SQOF6gUR1kuZrwBeq9aMMkMA7wCUVMICsEHcYzloQzn+s387M5eO/hopC/KN8pSv5VRkbA6JkgFga5zPxH2ZVq1iK8er9QgEXnFsEgZmAQ0vP6nkYFKeIRZTGi5Qq2yTn1+tl0UIE6fbbfWFBu6jM21ju+jeIDUT9WpSG8Tpv4lqXbcUyjEuEVjGdnI+zM2lkywJc6UzapN4a3j0WpKbFNQmpboPAGCX2Bufid8/RLV+wHQPOOnfdMjyXUPb2FTP1x7g9N9FrWIQi7dHiCpK/K1DFybpNVgabn4lyfUgcKsz04cMYwXAR8KIdDepMSZmU2PcQq2iyw1tHtRh8GdfFolHEYbDPLceOsu/l7G1u9fIzT94BVtyWDz1YveudpBJrWstuH+li3d9PE6lmCaOTofZpcUEOMJTndGclVGtWw6l/SjOei+xkDFZknY5MDGb1M1+TBc60xm/25u+UhHHdMD0oRQWTB7eEuUjvUkfJXaENv7QNjYfsjV3yKQ6HmaG9Imt/1bQGlOimC7u8QRLi4kOV2GGTGf+YDYpnP2F9luA1vGQJ3lnPb++aHtnhv//GOQdnT5LypoHA7Zf6BaduQBTnQXBmbaxOfSxBYvHKb79RUzfPD57mmDLmegsPDoLgrMoBAKBIGTQNraL7g3Pmfy4yrFluT9gGdbJ+ZAtZ6Kz8OgsCM60jc3jPjbvsJBh25OFbJplWCHsYxOdCWfujK3dveZJXu8qy1ZwlzxP0qPTIVvORGfh0VkQnMkzNoFAEDpoG5v0F7kA0/4i6WMTnU09Z/9A/mGEcCacSWys4/oNEsAfAirntOwAAAAASUVORK5CYII=' width="310" height="22" id='img_pm10' alt='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
            </td>
            {/* <td id='min_pm10' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">29</td> */}
            {/* <td id='max_pm10' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">72</td> */}
            </tr>
            
            
            
            </table>
        </Box>
        </div>
        </div>
        </div>
        </Box>
        }
        </>

        
    );
};

export default InformationTag;
