import { React, useEffect, useState } from "react";
import { Grid, Typography, useTheme } from "@mui/material";
import { host } from "../App";

const AQI = ({room_id, callbackSetSignIn}) =>
{
    const [aqi, setAqi] = useState({"level": ""})
    const url = `http://${host}/api/room/AQIdustpm2_5?room_id=${room_id}`;
    const theme = useTheme();

    const rating_index = {
        1 : {"level": "Good" , "colour": "green"},
        2 : {"level": "Moderate", "colour": "yellow"},
        3 : {"level": "Poor", "colour": "orange"},
        4 : {"level": "Unhealthy", "colour": "red"},
        5 : {"level": "Very Unhealthy", "colour": "purple"},
        6 : {"level": "Hazardous", "colour": "maroon"},
    };
    
    const rating_dust = [
        {key: 1 , min: 0, max: 50},
        {key: 2 ,min: 51, max: 100},
        {key: 3, min: 101, max: 150},
        {key: 4, min: 151, max: 200},
        {key: 5, min: 201, max: 300},
        {key: 6, min: 301, max: 500},
    ];

    function setDial(aqi, level_val) {
        let angle = getAQIDialAngle(aqi);
        let [bg, white] = getAQIColor(aqi);
    
        let meter = document.querySelector(".gauge > div[role=meter]");
        let dial = meter.querySelector(".dial");
        meter.setAttribute("aria-valuenow", aqi);
        meter.setAttribute("aria-valuetext", aqi);
        dial.querySelector(".aqi-num").textContent = aqi;
        // dial.querySelector(".level-value").textContent = level_val;
        dial.querySelector(".arrow").style.transform = `rotate(${angle - 90}deg)`;
        dial.style.backgroundColor = bg;
        dial.classList.toggle("white", white);
      }
    
    
    function getAQIDialAngle(aqi) {
      if (aqi >= 301) {
        return Math.min((aqi - 301) / 200 * 30 + 150, 180);
      } else if (aqi >= 201) {
        return (aqi - 201) / 100 * 30 + 120;
      } else if (aqi >= 151) {
        return (aqi - 151) / 50 * 30 + 90;
      } else if (aqi >= 101) {
        return (aqi - 101) / 50 * 30 + 60;
      } else if (aqi >= 51) {
        return (aqi - 51) / 50 * 30 + 30;
      } else if (aqi >= 0) {
        return aqi / 50 * 30;
      } else {
        return 0;
      }
    }
    
    function getAQIColor(aqi) {
      function combineColors(c1, c2, bias) {
        return c1.map((c, i) => ((c * (1 - bias)) + (c2[i] * bias)));
      }
    
      function stringifyColor(c) {
        return `rgb(${c})`;
      }
    
      function calculateColors(c1, c2, bias) {
        let bg = combineColors(c1, c2, bias);
        let white = ((bg[0] * 299) + (bg[1] * 587) + (bg[2] * 114)) / 1000 < 128;
        return [stringifyColor(bg), white];
      }
    
      const aqiColorMap = [
        [0, [0, 255, 0]],
        [50, [255, 255, 0]],
        [100, [255, 126, 0]],
        [150, [255, 0, 0]],
        [200, [143, 63, 151]],
        [300, [126, 0, 35]]
      ];
    
      for (let i in aqiColorMap) {
        let [target, color] = aqiColorMap[i];
        if (target > aqi) {
          if (i == 0) {
            return calculateColors(color, color, 1);
          }
    
          let [prevTarget, prevColor] = aqiColorMap[i - 1];
          return calculateColors(prevColor, color, (aqi - prevTarget) / (target - prevTarget));
        }
      }
    
      let [, color] = aqiColorMap[aqiColorMap.length - 1];
      return calculateColors(color, color, 1);
    }

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
            const new_data = {}
            for(let i = 0; i< rating_dust.length; ++i)
            {
                if(data["hourly"] > 500)
                {
                    new_data["level"] = rating_index[6].level
                    break;
                }
                else if(data["hourly"] > rating_dust[i]["min"] && data["hourly"] < rating_dust[i]["max"])
                {
                    new_data["level"] = rating_index[rating_dust[i]["key"]].level;
                    new_data["color"] = rating_index[rating_dust[i]["key"]]["colour"]
                    break;
                }
            }
            
            new_data["hourly"] = data.hourly;
            new_data["time"] = data.time;
            setAqi(new_data);
            // alert(aqi["level"])
            // setDial(data["hourly"], new_data["level"]);                              //!< remove comment of this when old AQI needed
            // alert(data["hourly"])
        }
        else
        {
            const data = await response.json();
            let new_data = {};
            new_data["time"] = 0;
            setAqi(new_data);   
            console.log(`Error code ${response.status}: ${data["Response"]} `);
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
        verify_and_get_data(fetch_data_function, callbackSetSignIn, host, url);
    }, []);

    return (
        <Grid container display="flex" flexDirection="column" justifyItems='center' textAlign='center'>
            <Grid container item justifyContent='center' alignContent='center'>
            <div style={{
                width: '100px', // Adjust as needed
                height: '100px', // Adjust as needed
                border: '10px solid', // Border makes the circle hollow
                borderColor: `${aqi['color']}`,
                borderRadius: '50%', // Makes the div a circle
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
            }}>
                <span style={{
                    position: 'relative',
                    color: theme.palette.text.primary,
                    fontSize: '28px',
                    fontWeight: 'bold'
                }}>
                    {aqi['hourly']}
                </span>
            </div>
            </Grid>
            <Grid item marginY={0.6} />
            <Grid item>
                <Typography fontWeight='bold' variant='h3'>{aqi['level']}</Typography>
            </Grid>
        </Grid>
    );
}

export default AQI;