import { Box, Button, Container, IconButton, Typography, useTheme } from "@mui/material";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "../../App";
import { host } from "../../App";

export default function Weatherdata({time_delay=0})
{
    const callbackSetSignIn = useContext(UserContext);

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const api = `http://${host}/api/weather`;
    const backend_host = host;
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
            setData(data["Response"]);
            setIsLoading(false);
        }
        else
        {
            console.log("Some error happened, try to reload page!");
        }
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
                console.log(err);
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
            if(data === null)            //!< this is for the total component always render the first time and then the next time will be setTimeOut
            {
                verify_and_get_data(get_information_data, callbackSetSignIn, backend_host, api); 
            }
            else
            {
                const timer = setTimeout(()=>{
                        verify_and_get_data(get_information_data, callbackSetSignIn, backend_host, api); 
                    }, time_delay);
                return () => clearTimeout(timer);
            }
        }
        else
        {
            verify_and_get_data(get_information_data, callbackSetSignIn, backend_host, api); 
        }
    },[data]);
    return (
        <>
        {
            isLoading ?
            <h1>Loading...</h1>
            :
            <Container
                
            >
            <Box
            mt="20px"
            sx={{boxShadow: 1,
                borderRadius: '5px', 
                backgroundColor: "white"}}
            display="flex"
            flexDirection="column"
            alignItems="center"
            // justify="center"

                justifyContent="center"
            >
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
                                            <b>Weather data</b>
                                        {/* </a> */}
                                        : 
                                        </span>
                                        <span id='aqiwgtutime'>
                                            Updated on {
                                                    (()=>{
                                                        const new_time = data["current_dt"] - 7*60*60;
                                                        const utcDate = new Date(new_time * 1000); // Convert seconds to milliseconds
                                                        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
                                                        const formattedDateTime = utcDate.toLocaleDateString('en-US', options);

                                                        return formattedDateTime;
                                                        })()   //run this function
                                                }
                                        </span>
                                    </div>
                                    </td>
                                   
                                    <td className='aqiwgtsharebtn' style={{ verticalAlign: 'text-top;min-width:22px;' }}>
                                    
                                    </td>
                                    
                                    </tr>
                                </table>
                            </Box>
                            </div>
                            </div>
                        </div>

                </Box>
            

        <Box display="flex" justifyContent="center">
            
                
            <table style={{ fontSize: '11px', border: '0px solid black', padding: '0px', margin: '0px', borderSpacing: '0px' }}>

            <tr style={{}}>

                {/* _____________________________SET UP THE LENGTH OF ALL TABLE_________________________ */}
                <td colSpan="2" style={{ textAlign: 'center', fontWeight: 'bold', width: '600px' }} align="center" nowrap="true">Current</td>
            </tr>
            




            <tr id='tr_pm25'  style={{ height: '26px', backgroundColor: '#edf6fb' }}>
                <td id='hdr_pm25' nowrap>
                    <div className='tditem'>
                        <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                            lat
                        </span>
                    </div>
                </td>
                <td id='cur_pm25' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">
                    {data["lat"]}
                </td>
                <td id='td_pm25' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                                                                {/* <img class='aqi-graph-img' border="0" src='data:image/png;base64,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' width="310" height="30" id='img_pm25' alt='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
                                                                </td>
            </tr>



            <tr id='tr_pm10'  style={{ height: '26px', backgroundColor: '#' }}>
            <td id='hdr_pm10' nowrap>
                <div className='tditem'>
                <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                        lon
                </span>
                </div>
            </td>
            <td id='cur_pm10' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">{data["lon"]}</td>
            <td id='td_pm10' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                {/* <img className='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADeklEQVR42u1dPU8bQRB9/ooxJsZxIEHoROGCIhQp3Fhyi1KlSHFW/oHdEuV3IJLSLtNFXJEiRRTRItG4o3aBkMWnsZ0YYhm4FAlSFO+ctcdxNz7Pk2j2ODz79u3bmbuxAPSxDJ7gGpdwJpwJZz4jYjcL24rxzUi+sQeBQCCYQETsZsFWjH8AYCjGdyP5xicAbYZzyTGNi3NswplwFsq44sS4AcBUXdj/9uJybTU1EmQk37DknBAIBBwQ171hbTVVo7K/gOfSZsxzW+ISzoQzxsbWOh5i+XliZNxuFopE+Xro0/O6ZQAtpgsbaGx2s6DMvr9879y+eZWNBrhmk7ieorMA47KbBQNAcZxmtY3tyXyMuvSeKF8tAGU5SQOF6gUR1kuZrwBeq9aMMkMA7wCUVMICsEHcYzloQzn+s387M5eO/hopC/KN8pSv5VRkbA6JkgFga5zPxH2ZVq1iK8er9QgEXnFsEgZmAQ0vP6nkYFKeIRZTGi5Qq2yTn1+tl0UIE6fbbfWFBu6jM21ju+jeIDUT9WpSG8Tpv4lqXbcUyjEuEVjGdnI+zM2lkywJc6UzapN4a3j0WpKbFNQmpboPAGCX2Bufid8/RLV+wHQPOOnfdMjyXUPb2FTP1x7g9N9FrWIQi7dHiCpK/K1DFybpNVgabn4lyfUgcKsz04cMYwXAR8KIdDepMSZmU2PcQq2iyw1tHtRh8GdfFolHEYbDPLceOsu/l7G1u9fIzT94BVtyWDz1YveudpBJrWstuH+li3d9PE6lmCaOTofZpcUEOMJTndGclVGtWw6l/SjOei+xkDFZknY5MDGb1M1+TBc60xm/25u+UhHHdMD0oRQWTB7eEuUjvUkfJXaENv7QNjYfsjV3yKQ6HmaG9Imt/1bQGlOimC7u8QRLi4kOV2GGTGf+YDYpnP2F9luA1vGQJ3lnPb++aHtnhv//GOQdnT5LypoHA7Zf6BaduQBTnQXBmbaxOfSxBYvHKb79RUzfPD57mmDLmegsPDoLgrMoBAKBIGTQNraL7g3Pmfy4yrFluT9gGdbJ+ZAtZ6Kz8OgsCM60jc3jPjbvsJBh25OFbJplWCHsYxOdCWfujK3dveZJXu8qy1ZwlzxP0qPTIVvORGfh0VkQnMkzNoFAEDpoG5v0F7kA0/4i6WMTnU09Z/9A/mGEcCacSWys4/oNEsAfAirntOwAAAAASUVORK5CYII=' width="310" height="22" id='img_pm10' alt='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
            </td>
            {/* <td id='min_pm10' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">29</td> */}
            {/* <td id='max_pm10' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">72</td> */}
            </tr>


            <tr id='tr_pm25'  style={{ height: '26px', backgroundColor: '#edf6fb' }}>
                <td id='hdr_pm25' nowrap>
                    <div className='tditem'>
                        <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                            timezone
                        </span>
                    </div>
                </td>
                <td id='cur_pm25' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">
                    {data["timezone"]}
                </td>
                <td id='td_pm25' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                                                                {/* <img class='aqi-graph-img' border="0" src='data:image/png;base64,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' width="310" height="30" id='img_pm25' alt='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
                                                                </td>
            </tr>



            <tr id='tr_pm10'  style={{ height: '26px', backgroundColor: '#' }}>
                <td id='hdr_pm10' nowrap>
                    <div className='tditem'>
                    <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                    timezone_offset
                    </span>
                    </div>
                </td>
                <td id='cur_pm10' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">
                    {data["timezone_offset"]}
                </td>
            <td id='td_pm10' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                {/* <img className='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADeklEQVR42u1dPU8bQRB9/ooxJsZxIEHoROGCIhQp3Fhyi1KlSHFW/oHdEuV3IJLSLtNFXJEiRRTRItG4o3aBkMWnsZ0YYhm4FAlSFO+ctcdxNz7Pk2j2ODz79u3bmbuxAPSxDJ7gGpdwJpwJZz4jYjcL24rxzUi+sQeBQCCYQETsZsFWjH8AYCjGdyP5xicAbYZzyTGNi3NswplwFsq44sS4AcBUXdj/9uJybTU1EmQk37DknBAIBBwQ171hbTVVo7K/gOfSZsxzW+ISzoQzxsbWOh5i+XliZNxuFopE+Xro0/O6ZQAtpgsbaGx2s6DMvr9879y+eZWNBrhmk7ieorMA47KbBQNAcZxmtY3tyXyMuvSeKF8tAGU5SQOF6gUR1kuZrwBeq9aMMkMA7wCUVMICsEHcYzloQzn+s387M5eO/hopC/KN8pSv5VRkbA6JkgFga5zPxH2ZVq1iK8er9QgEXnFsEgZmAQ0vP6nkYFKeIRZTGi5Qq2yTn1+tl0UIE6fbbfWFBu6jM21ju+jeIDUT9WpSG8Tpv4lqXbcUyjEuEVjGdnI+zM2lkywJc6UzapN4a3j0WpKbFNQmpboPAGCX2Bufid8/RLV+wHQPOOnfdMjyXUPb2FTP1x7g9N9FrWIQi7dHiCpK/K1DFybpNVgabn4lyfUgcKsz04cMYwXAR8KIdDepMSZmU2PcQq2iyw1tHtRh8GdfFolHEYbDPLceOsu/l7G1u9fIzT94BVtyWDz1YveudpBJrWstuH+li3d9PE6lmCaOTofZpcUEOMJTndGclVGtWw6l/SjOei+xkDFZknY5MDGb1M1+TBc60xm/25u+UhHHdMD0oRQWTB7eEuUjvUkfJXaENv7QNjYfsjV3yKQ6HmaG9Imt/1bQGlOimC7u8QRLi4kOV2GGTGf+YDYpnP2F9luA1vGQJ3lnPb++aHtnhv//GOQdnT5LypoHA7Zf6BaduQBTnQXBmbaxOfSxBYvHKb79RUzfPD57mmDLmegsPDoLgrMoBAKBIGTQNraL7g3Pmfy4yrFluT9gGdbJ+ZAtZ6Kz8OgsCM60jc3jPjbvsJBh25OFbJplWCHsYxOdCWfujK3dveZJXu8qy1ZwlzxP0qPTIVvORGfh0VkQnMkzNoFAEDpoG5v0F7kA0/4i6WMTnU09Z/9A/mGEcCacSWys4/oNEsAfAirntOwAAAAASUVORK5CYII=' width="310" height="22" id='img_pm10' alt='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
            </td>
            {/* <td id='min_pm10' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">29</td> */}
            {/* <td id='max_pm10' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">72</td> */}
            </tr>


            <tr id='tr_pm25'  style={{ height: '26px', backgroundColor: '#edf6fb' }}>
                <td id='hdr_pm25' nowrap>
                    <div className='tditem'>
                        <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                        current_temp
                        </span>
                    </div>
                </td>
                <td id='cur_pm25' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">
                    {data["current_temp"]}
                </td>
                <td id='td_pm25' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                                                                {/* <img class='aqi-graph-img' border="0" src='data:image/png;base64,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' width="310" height="30" id='img_pm25' alt='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
                                                                </td>
            </tr>



            <tr id='tr_pm10'  style={{ height: '26px', backgroundColor: '#' }}>
                <td id='hdr_pm10' nowrap>
                    <div className='tditem'>
                    <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                    current_feels_like
                    </span>
                    </div>
                </td>
                <td id='cur_pm10' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">
                    {data["current_feels_like"]}
                </td>
            <td id='td_pm10' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                {/* <img className='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADeklEQVR42u1dPU8bQRB9/ooxJsZxIEHoROGCIhQp3Fhyi1KlSHFW/oHdEuV3IJLSLtNFXJEiRRTRItG4o3aBkMWnsZ0YYhm4FAlSFO+ctcdxNz7Pk2j2ODz79u3bmbuxAPSxDJ7gGpdwJpwJZz4jYjcL24rxzUi+sQeBQCCYQETsZsFWjH8AYCjGdyP5xicAbYZzyTGNi3NswplwFsq44sS4AcBUXdj/9uJybTU1EmQk37DknBAIBBwQ171hbTVVo7K/gOfSZsxzW+ISzoQzxsbWOh5i+XliZNxuFopE+Xro0/O6ZQAtpgsbaGx2s6DMvr9879y+eZWNBrhmk7ieorMA47KbBQNAcZxmtY3tyXyMuvSeKF8tAGU5SQOF6gUR1kuZrwBeq9aMMkMA7wCUVMICsEHcYzloQzn+s387M5eO/hopC/KN8pSv5VRkbA6JkgFga5zPxH2ZVq1iK8er9QgEXnFsEgZmAQ0vP6nkYFKeIRZTGi5Qq2yTn1+tl0UIE6fbbfWFBu6jM21ju+jeIDUT9WpSG8Tpv4lqXbcUyjEuEVjGdnI+zM2lkywJc6UzapN4a3j0WpKbFNQmpboPAGCX2Bufid8/RLV+wHQPOOnfdMjyXUPb2FTP1x7g9N9FrWIQi7dHiCpK/K1DFybpNVgabn4lyfUgcKsz04cMYwXAR8KIdDepMSZmU2PcQq2iyw1tHtRh8GdfFolHEYbDPLceOsu/l7G1u9fIzT94BVtyWDz1YveudpBJrWstuH+li3d9PE6lmCaOTofZpcUEOMJTndGclVGtWw6l/SjOei+xkDFZknY5MDGb1M1+TBc60xm/25u+UhHHdMD0oRQWTB7eEuUjvUkfJXaENv7QNjYfsjV3yKQ6HmaG9Imt/1bQGlOimC7u8QRLi4kOV2GGTGf+YDYpnP2F9luA1vGQJ3lnPb++aHtnhv//GOQdnT5LypoHA7Zf6BaduQBTnQXBmbaxOfSxBYvHKb79RUzfPD57mmDLmegsPDoLgrMoBAKBIGTQNraL7g3Pmfy4yrFluT9gGdbJ+ZAtZ6Kz8OgsCM60jc3jPjbvsJBh25OFbJplWCHsYxOdCWfujK3dveZJXu8qy1ZwlzxP0qPTIVvORGfh0VkQnMkzNoFAEDpoG5v0F7kA0/4i6WMTnU09Z/9A/mGEcCacSWys4/oNEsAfAirntOwAAAAASUVORK5CYII=' width="310" height="22" id='img_pm10' alt='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
            </td>
            {/* <td id='min_pm10' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">29</td> */}
            {/* <td id='max_pm10' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">72</td> */}
            </tr>



            <tr id='tr_pm25'  style={{ height: '26px', backgroundColor: '#edf6fb' }}>
                <td id='hdr_pm25' nowrap>
                    <div className='tditem'>
                        <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                        current_pressure
                        </span>
                    </div>
                </td>
                <td id='cur_pm25' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">
                    {data["current_pressure"]}
                </td>
                <td id='td_pm25' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                                                                {/* <img class='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAeCAYAAACmNDJGAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAIKUlEQVR42u1dfUxUVx49bxy+BHQ6Y2XCkslkRirELsEZaQacZBejpDVKNH6R3U13ow20tTV17YbJrl/Numk6hiBZzS6r2LRE0UCDrpuSqe42XSqdVGaLtip22iltxpFWd4qgoAzDb//YZ0Lre8Cz43sXek/CH3MfD84799zzu/fOHQAmRiGAVwEUiK8dABoAvAZgJrTDHAAvAHhGfJ0M4I8AXh/DVS08DmD7mNc5AGrAHnQAPGL/zRPb3KJmv9KYG/fZ5JADoHnMl4f7TJrAREi2Wq04dOjQLiIqAJDd3t7eWFdX9+SmTZteJyKtTJfhdrs/Ky0tfY6IngGw1mAwXO/u7h4uKSlpFbmqBbMgCL88evTovXD7nclkeoKIWAu3X+j1+mggELjjcDhO7dmzpwxA1YULF5ovXry4iYi0DDfus8khTERbKyoqCoLBYCoROYnIw32mPNg+NJvNtwVBuFe9/uF2uzP2799/wGKx3NKw0vdUV1eHQqFQDwAngPfz8vLWeb3egqGhoVcB/EFNMmvWrPlPW1vbrpqamnIAd+x2u5GI8gD8WaysPgB5ACrESvYWgL+orNnPenp6dA6H4/zly5c/jcViR1JTU6/s3r37SEVFxWsA3tdwMHCfTRKCIISPHTv29ujo6C0ALwqCkC9emjtmpXAAQCuAgxpoprnPJhNs8Pv94eHh4cExwn4WDAZ/un379tMAerUaCStXrowMDAzc4zW3q6vrE5PJZLBarU8BaFKTS1ZW1khmZuanJ06caGxoaGgdHR0d9fl8BkEQrhFRb1dX1+D69et95eXl+R6Px0JEfS6XazkRqRluM7OysooAHB0aGrp15syZzp07d6200er2H9Hp9o7jM0QzcZw8OInoDAOx2+9y2trZ2AGaPx9O/YsWK33R0dDSqTEdzn+ke4J7HATwXiUQO6nS6xYIg/J2R6e+vGxoafF6v951Lly7ZADymNoHq6uoDLpfrw40bN+4KBoM98XhcV15eXgTgWmFh4dbu7u6u1atXP28ymXoBnPX7/f8GYFaRYqizs/OJ2traOwD0Vqv1Tn5+Pux2+8fnz5/vAPAKQ8sZ7jMFQRKPx3XijA0jIyPJRUVF8ywWS4HD4Thht9stRDSP++y72ALgXG5u7pdOp3MLgC8AHC8rK7tqMBiWa8hrEYBWvV7/5ZIlS9oBlCxYsOBaRkaGD8DLRNSqIpelmzdvfoOIniaiDHEvpikejzcZDIYjubm55wCc3LFjx88PHz58be/evY1EtBxAIxGpWU2z58+fH0xLSzudnJz85NWrV1ttNttHRqPxPQDPqqwZ99kPQ+2VK1eaiMgMoHLhwoXXBUGoc7vdvuHh4VqTyXRy1apV8eLi4rNEtJ6IDNxn909ztxDROSJ6j4gqiOgLIjpORE1EtFRDXouIqJWIPieiOiIqIaJ3iegkEb2sMpelRPT099qaiEhHRAeJ6C2Rl1XUcLn4PY0q88wmIh8RnSKiMiIyirxOEdGz3Gds++x7vGrFYAMRVRLRP0V+NaLvGkXf1WvAjVmfyaYx2ASrvLhmXDOuGQcHBwfHD4PQCWezRHvNIgT8MvcYAUQZfBZWeXHNuGZcM5V56QGslWgPd8K5TaL97CIE3uT1gIODg2XoZdpzZAIPAPYx+ixRhnWOcl5cM66Z9sEmi3/99rHK0vmZ9xEVqgItGouXDSDCaMeyyo1rxjWblrwUB5vLli731rHAqxWvpFwzzo0FXjpwcHBwTDMonrF9ezuONMP9eUj1zmZI78u1CFWBdSo8i5HhJQKT3P606icFv3/KbJG4FBaqZN8V/1Frxn02NXgpDrZsQxKrIc2q2TTnRvVOkrnUIleMqN4p/ebRMmwFsPi+9ssII4yXlP4e2fZlOC71gwSb5nu53GdTgJfiYIsOjsA4U9ltFJI8KwfBltCZHD9fpBC9/TGDeZbiQrVYMoxSkNDAid4caTbOlvSZwPtyynHT5BybGlgrE3guSP8JE79gC4T5ToGi4uECIHn2EKen1XO+JDljBM4KtsA+7gSOBwo2pbO1CbBNJvTWicsURUWeYZ3V4Dbe2UNJmGcl9bEqmMxsTX7G+H/smyZ9Od24JYzXeAV8bGFTnFKRvpga+2yLKeTcoLAq/yjOF40zy1X8x/tCN+5m2+akMClY5OsYsrOSlGqjxpZHIvsyB4BL5nJYpk9l29/9YKCgtDgzKuMNyVmuTPt418KA5F6q3H4pQl/d7bBZUkqU3APl+7LfKWyKg+2R9Blq+DpnnOVrrVT7zYH4X2dnzpgj00FhGcOrtRGdyEq6bZwOV4S5mUnMzj4emf1APlvLYl9OUIxqEzSwW1wL05WGxESaJcZnpiT2P3nAKmbohBwAKxR1Xn1lsYzh/Kj6m7I9vvpKueobRt/tHBjSFVVlWhb4YByTciifyUlueSS0uNVXyoREYEOiQoLjIQWb3Dk2rfHNf2PGjHTFyyq52c8+MaiUVjKlU+cWLQ3/zUDMmJHC5lL025txpKU+XJ+9EsregHrJ5WsLIH3cBF09oyi06mSKVLOWxUgNzVQcm+oGG6vn2GyWlETur+VMEEbKID1b016zOSnMnslSur/2ECAdUoVWTYsR45qpMTYnBcXxHh0cYVK83usxA6uDFIN32dSsn13NojfZ9Bn6h7hmU2Bs8s+KcnBwTDsoDrYEn2NLGMyPsnsmCzPZ3MeaoufYtMWsNK7ZFBibioMt0hdjUrzQV3fZ/YcRfbfZ1OwGu5pFvmbTZ7jRzzWbTmNzDFI5L64Z14xzY5nX/wCol2VfsqX8GgAAAABJRU5ErkJggg==' width="310" height="30" id='img_pm25' alt='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
                                                                </td>
            </tr>



            <tr id='tr_pm10'  style={{ height: '26px', backgroundColor: '#' }}>
                <td id='hdr_pm10' nowrap>
                    <div className='tditem'>
                    <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                    current_humidity
                    </span>
                    </div>
                </td>
                <td id='cur_pm10' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">
                    {data["current_humidity"]}
                </td>
            <td id='td_pm10' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                {/* <img className='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADeklEQVR42u1dPU8bQRB9/ooxJsZxIEHoROGCIhQp3Fhyi1KlSHFW/oHdEuV3IJLSLtNFXJEiRRTRItG4o3aBkMWnsZ0YYhm4FAlSFO+ctcdxNz7Pk2j2ODz79u3bmbuxAPSxDJ7gGpdwJpwJZz4jYjcL24rxzUi+sQeBQCCYQETsZsFWjH8AYCjGdyP5xicAbYZzyTGNi3NswplwFsq44sS4AcBUXdj/9uJybTU1EmQk37DknBAIBBwQ171hbTVVo7K/gOfSZsxzW+ISzoQzxsbWOh5i+XliZNxuFopE+Xro0/O6ZQAtpgsbaGx2s6DMvr9879y+eZWNBrhmk7ieorMA47KbBQNAcZxmtY3tyXyMuvSeKF8tAGU5SQOF6gUR1kuZrwBeq9aMMkMA7wCUVMICsEHcYzloQzn+s387M5eO/hopC/KN8pSv5VRkbA6JkgFga5zPxH2ZVq1iK8er9QgEXnFsEgZmAQ0vP6nkYFKeIRZTGi5Qq2yTn1+tl0UIE6fbbfWFBu6jM21ju+jeIDUT9WpSG8Tpv4lqXbcUyjEuEVjGdnI+zM2lkywJc6UzapN4a3j0WpKbFNQmpboPAGCX2Bufid8/RLV+wHQPOOnfdMjyXUPb2FTP1x7g9N9FrWIQi7dHiCpK/K1DFybpNVgabn4lyfUgcKsz04cMYwXAR8KIdDepMSZmU2PcQq2iyw1tHtRh8GdfFolHEYbDPLceOsu/l7G1u9fIzT94BVtyWDz1YveudpBJrWstuH+li3d9PE6lmCaOTofZpcUEOMJTndGclVGtWw6l/SjOei+xkDFZknY5MDGb1M1+TBc60xm/25u+UhHHdMD0oRQWTB7eEuUjvUkfJXaENv7QNjYfsjV3yKQ6HmaG9Imt/1bQGlOimC7u8QRLi4kOV2GGTGf+YDYpnP2F9luA1vGQJ3lnPb++aHtnhv//GOQdnT5LypoHA7Zf6BaduQBTnQXBmbaxOfSxBYvHKb79RUzfPD57mmDLmegsPDoLgrMoBAKBIGTQNraL7g3Pmfy4yrFluT9gGdbJ+ZAtZ6Kz8OgsCM60jc3jPjbvsJBh25OFbJplWCHsYxOdCWfujK3dveZJXu8qy1ZwlzxP0qPTIVvORGfh0VkQnMkzNoFAEDpoG5v0F7kA0/4i6WMTnU09Z/9A/mGEcCacSWys4/oNEsAfAirntOwAAAAASUVORK5CYII=' width="310" height="22" id='img_pm10' alt='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
            </td>
            {/* <td id='min_pm10' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">29</td> */}
            {/* <td id='max_pm10' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">72</td> */}
            </tr>






            <tr id='tr_pm25'  style={{ height: '26px', backgroundColor: '#edf6fb' }}>
                <td id='hdr_pm25' nowrap>
                    <div className='tditem'>
                        <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                        current_dew_point
                        </span>
                    </div>
                </td>
                <td id='cur_pm25' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">
                    {data["current_dew_point"]}
                </td>
                <td id='td_pm25' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                                                                {/* <img class='aqi-graph-img' border="0" src='data:image/png;base64,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' width="310" height="30" id='img_pm25' alt='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
                                                                </td>
            </tr>

            <tr id='tr_pm10'  style={{ height: '26px', backgroundColor: '#' }}>
                <td id='hdr_pm10' nowrap>
                    <div className='tditem'>
                    <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                    current_uvi
                    </span>
                    </div>
                </td>
                <td id='cur_pm10' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">
                    {data["current_uvi"]}
                </td>
            <td id='td_pm10' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                {/* <img className='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADeklEQVR42u1dPU8bQRB9/ooxJsZxIEHoROGCIhQp3Fhyi1KlSHFW/oHdEuV3IJLSLtNFXJEiRRTRItG4o3aBkMWnsZ0YYhm4FAlSFO+ctcdxNz7Pk2j2ODz79u3bmbuxAPSxDJ7gGpdwJpwJZz4jYjcL24rxzUi+sQeBQCCYQETsZsFWjH8AYCjGdyP5xicAbYZzyTGNi3NswplwFsq44sS4AcBUXdj/9uJybTU1EmQk37DknBAIBBwQ171hbTVVo7K/gOfSZsxzW+ISzoQzxsbWOh5i+XliZNxuFopE+Xro0/O6ZQAtpgsbaGx2s6DMvr9879y+eZWNBrhmk7ieorMA47KbBQNAcZxmtY3tyXyMuvSeKF8tAGU5SQOF6gUR1kuZrwBeq9aMMkMA7wCUVMICsEHcYzloQzn+s387M5eO/hopC/KN8pSv5VRkbA6JkgFga5zPxH2ZVq1iK8er9QgEXnFsEgZmAQ0vP6nkYFKeIRZTGi5Qq2yTn1+tl0UIE6fbbfWFBu6jM21ju+jeIDUT9WpSG8Tpv4lqXbcUyjEuEVjGdnI+zM2lkywJc6UzapN4a3j0WpKbFNQmpboPAGCX2Bufid8/RLV+wHQPOOnfdMjyXUPb2FTP1x7g9N9FrWIQi7dHiCpK/K1DFybpNVgabn4lyfUgcKsz04cMYwXAR8KIdDepMSZmU2PcQq2iyw1tHtRh8GdfFolHEYbDPLceOsu/l7G1u9fIzT94BVtyWDz1YveudpBJrWstuH+li3d9PE6lmCaOTofZpcUEOMJTndGclVGtWw6l/SjOei+xkDFZknY5MDGb1M1+TBc60xm/25u+UhHHdMD0oRQWTB7eEuUjvUkfJXaENv7QNjYfsjV3yKQ6HmaG9Imt/1bQGlOimC7u8QRLi4kOV2GGTGf+YDYpnP2F9luA1vGQJ3lnPb++aHtnhv//GOQdnT5LypoHA7Zf6BaduQBTnQXBmbaxOfSxBYvHKb79RUzfPD57mmDLmegsPDoLgrMoBAKBIGTQNraL7g3Pmfy4yrFluT9gGdbJ+ZAtZ6Kz8OgsCM60jc3jPjbvsJBh25OFbJplWCHsYxOdCWfujK3dveZJXu8qy1ZwlzxP0qPTIVvORGfh0VkQnMkzNoFAEDpoG5v0F7kA0/4i6WMTnU09Z/9A/mGEcCacSWys4/oNEsAfAirntOwAAAAASUVORK5CYII=' width="310" height="22" id='img_pm10' alt='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
            </td>
            {/* <td id='min_pm10' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">29</td> */}
            {/* <td id='max_pm10' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">72</td> */}
            </tr>






            <tr id='tr_pm25'  style={{ height: '26px', backgroundColor: '#edf6fb' }}>
                <td id='hdr_pm25' nowrap>
                    <div className='tditem'>
                        <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                        current_clouds
                        </span>
                    </div>
                </td>
                <td id='cur_pm25' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">
                    {data["current_clouds"]}
                </td>
                <td id='td_pm25' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                                                                {/* <img class='aqi-graph-img' border="0" src='data:image/png;base64,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' width="310" height="30" id='img_pm25' alt='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
                                                                </td>
            </tr>

            <tr id='tr_pm10'  style={{ height: '26px', backgroundColor: '#' }}>
                <td id='hdr_pm10' nowrap>
                    <div className='tditem'>
                    <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                    current_visibility
                    </span>
                    </div>
                </td>
                <td id='cur_pm10' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">
                    {data["current_visibility"]}
                </td>
            <td id='td_pm10' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                {/* <img className='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADeklEQVR42u1dPU8bQRB9/ooxJsZxIEHoROGCIhQp3Fhyi1KlSHFW/oHdEuV3IJLSLtNFXJEiRRTRItG4o3aBkMWnsZ0YYhm4FAlSFO+ctcdxNz7Pk2j2ODz79u3bmbuxAPSxDJ7gGpdwJpwJZz4jYjcL24rxzUi+sQeBQCCYQETsZsFWjH8AYCjGdyP5xicAbYZzyTGNi3NswplwFsq44sS4AcBUXdj/9uJybTU1EmQk37DknBAIBBwQ171hbTVVo7K/gOfSZsxzW+ISzoQzxsbWOh5i+XliZNxuFopE+Xro0/O6ZQAtpgsbaGx2s6DMvr9879y+eZWNBrhmk7ieorMA47KbBQNAcZxmtY3tyXyMuvSeKF8tAGU5SQOF6gUR1kuZrwBeq9aMMkMA7wCUVMICsEHcYzloQzn+s387M5eO/hopC/KN8pSv5VRkbA6JkgFga5zPxH2ZVq1iK8er9QgEXnFsEgZmAQ0vP6nkYFKeIRZTGi5Qq2yTn1+tl0UIE6fbbfWFBu6jM21ju+jeIDUT9WpSG8Tpv4lqXbcUyjEuEVjGdnI+zM2lkywJc6UzapN4a3j0WpKbFNQmpboPAGCX2Bufid8/RLV+wHQPOOnfdMjyXUPb2FTP1x7g9N9FrWIQi7dHiCpK/K1DFybpNVgabn4lyfUgcKsz04cMYwXAR8KIdDepMSZmU2PcQq2iyw1tHtRh8GdfFolHEYbDPLceOsu/l7G1u9fIzT94BVtyWDz1YveudpBJrWstuH+li3d9PE6lmCaOTofZpcUEOMJTndGclVGtWw6l/SjOei+xkDFZknY5MDGb1M1+TBc60xm/25u+UhHHdMD0oRQWTB7eEuUjvUkfJXaENv7QNjYfsjV3yKQ6HmaG9Imt/1bQGlOimC7u8QRLi4kOV2GGTGf+YDYpnP2F9luA1vGQJ3lnPb++aHtnhv//GOQdnT5LypoHA7Zf6BaduQBTnQXBmbaxOfSxBYvHKb79RUzfPD57mmDLmegsPDoLgrMoBAKBIGTQNraL7g3Pmfy4yrFluT9gGdbJ+ZAtZ6Kz8OgsCM60jc3jPjbvsJBh25OFbJplWCHsYxOdCWfujK3dveZJXu8qy1ZwlzxP0qPTIVvORGfh0VkQnMkzNoFAEDpoG5v0F7kA0/4i6WMTnU09Z/9A/mGEcCacSWys4/oNEsAfAirntOwAAAAASUVORK5CYII=' width="310" height="22" id='img_pm10' alt='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
            </td>
            {/* <td id='min_pm10' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">29</td> */}
            {/* <td id='max_pm10' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">72</td> */}
            </tr>




            <tr id='tr_pm25'  style={{ height: '26px', backgroundColor: '#edf6fb' }}>
                <td id='hdr_pm25' nowrap>
                    <div className='tditem'>
                        <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                        current_wind_speed
                        </span>
                    </div>
                </td>
                <td id='cur_pm25' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">
                    {data["current_wind_speed"]}
                </td>
                <td id='td_pm25' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                                                                {/* <img class='aqi-graph-img' border="0" src='data:image/png;base64,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' width="310" height="30" id='img_pm25' alt='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
                                                                </td>
            </tr>

            <tr id='tr_pm10'  style={{ height: '26px', backgroundColor: '#' }}>
                <td id='hdr_pm10' nowrap>
                    <div className='tditem'>
                    <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                    current_wind_deg
                    </span>
                    </div>
                </td>
                <td id='cur_pm10' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">
                    {data["current_wind_deg"]}
                </td>
            <td id='td_pm10' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                {/* <img className='aqi-graph-img' border="0" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAAWCAYAAABKZ7ArAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADeklEQVR42u1dPU8bQRB9/ooxJsZxIEHoROGCIhQp3Fhyi1KlSHFW/oHdEuV3IJLSLtNFXJEiRRTRItG4o3aBkMWnsZ0YYhm4FAlSFO+ctcdxNz7Pk2j2ODz79u3bmbuxAPSxDJ7gGpdwJpwJZz4jYjcL24rxzUi+sQeBQCCYQETsZsFWjH8AYCjGdyP5xicAbYZzyTGNi3NswplwFsq44sS4AcBUXdj/9uJybTU1EmQk37DknBAIBBwQ171hbTVVo7K/gOfSZsxzW+ISzoQzxsbWOh5i+XliZNxuFopE+Xro0/O6ZQAtpgsbaGx2s6DMvr9879y+eZWNBrhmk7ieorMA47KbBQNAcZxmtY3tyXyMuvSeKF8tAGU5SQOF6gUR1kuZrwBeq9aMMkMA7wCUVMICsEHcYzloQzn+s387M5eO/hopC/KN8pSv5VRkbA6JkgFga5zPxH2ZVq1iK8er9QgEXnFsEgZmAQ0vP6nkYFKeIRZTGi5Qq2yTn1+tl0UIE6fbbfWFBu6jM21ju+jeIDUT9WpSG8Tpv4lqXbcUyjEuEVjGdnI+zM2lkywJc6UzapN4a3j0WpKbFNQmpboPAGCX2Bufid8/RLV+wHQPOOnfdMjyXUPb2FTP1x7g9N9FrWIQi7dHiCpK/K1DFybpNVgabn4lyfUgcKsz04cMYwXAR8KIdDepMSZmU2PcQq2iyw1tHtRh8GdfFolHEYbDPLceOsu/l7G1u9fIzT94BVtyWDz1YveudpBJrWstuH+li3d9PE6lmCaOTofZpcUEOMJTndGclVGtWw6l/SjOei+xkDFZknY5MDGb1M1+TBc60xm/25u+UhHHdMD0oRQWTB7eEuUjvUkfJXaENv7QNjYfsjV3yKQ6HmaG9Imt/1bQGlOimC7u8QRLi4kOV2GGTGf+YDYpnP2F9luA1vGQJ3lnPb++aHtnhv//GOQdnT5LypoHA7Zf6BaduQBTnQXBmbaxOfSxBYvHKb79RUzfPD57mmDLmegsPDoLgrMoBAKBIGTQNraL7g3Pmfy4yrFluT9gGdbJ+ZAtZ6Kz8OgsCM60jc3jPjbvsJBh25OFbJplWCHsYxOdCWfujK3dveZJXu8qy1ZwlzxP0qPTIVvORGfh0VkQnMkzNoFAEDpoG5v0F7kA0/4i6WMTnU09Z/9A/mGEcCacSWys4/oNEsAfAirntOwAAAAASUVORK5CYII=' width="310" height="22" id='img_pm10' alt='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM10 (respirable particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
            </td>
            {/* <td id='min_pm10' className='tdmin' style={{ color: '#0086c8', fontSize: '11px' }} align="center">29</td> */}
            {/* <td id='max_pm10' className='tdmax' style={{ color: '#ce3c3a', fontSize: '11px' }} align="center">72</td> */}
            </tr>

            




            <tr id='tr_pm25'  style={{ height: '26px', backgroundColor: '#edf6fb' }}>
                <td id='hdr_pm25' nowrap>
                    <div className='tditem'>
                        <span style={{ fontWeight: 'bold', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                        current_wind_gust
                        </span>
                    </div>
                </td>
                <td id='cur_pm25' className='tdcur' style={{ fontWeight: 'bold', fontSize: '11px' }} align="center">
                    {data["current_wind_gust"]}
                </td>
                <td id='td_pm25' style={{ margin: '0px', cellSpacing: '0px', padding: '0px' }}>
                                                                {/* <img class='aqi-graph-img' border="0" src='data:image/png;base64,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' width="310" height="30" id='img_pm25' alt='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.' title='Hanoi, Vietnam PM25 (fine particulate matter)  measured by Vietnam Center For Environmental Monitoring Portal (cổng thông tin quan trắc môi trường).&#013;Values are converted to the US EPA AQI standard.'/> */}
                                                                </td>
            </tr>
            
            
            </table>
        </Box>
        </div>
        </div>
        </div>
        </Box>
        </Container>
        }
        </>
    );
}