import { host } from "../../App"
import { useEffect, useState } from "react";
import verify_and_get_data from "../../function/fetchData";

function SensorInfo({room_id, callbackSetSignIn, sensors}) {
    const backend_host = host
    const [dataSensors, setDataSensors] = useState([])
    const api = `http://${backend_host}/api/raw_data_all_sensor?room_id=${room_id}`

    const getRawDataSensors = async(url, access_token) =>{
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`,
      }
      const option_fetch =
        {
            "method": "GET",
            "headers": headers,
            "body": null,
        }
        const response = await fetch(url, option_fetch);

        const data = await response.json()
        if(data){
            if(response.status === 200){
              setDataSensors(data);
            }
        }
        else{
            alert("Some error happened, try to reload page!");
        }
    }

    const average_data = ((dataSensors, sensors) => {
      const data = {
        co2: 0,
        temp: 0,
        hum: 0,
        light: 0,
        dust: 0,
        sound: 0,
        tvoc: 0,
        motion: 0,
        time: 0,
      }
      let count = 0

      for(let i = 0; i < dataSensors.length; i++){
        const check = sensors.some((node) => node.id === dataSensors[i].node_id )
        if(check){
          for (const key in data){
            if(dataSensors[i][key] !== undefined && dataSensors[i][key] !== null){
              if(key != "time"){
                data[key] += dataSensors[i][key]
              } else{
                data[key] = Math.max(data[key], dataSensors[i][key])
              }
            }
          }
          count++;
        }
      }

      if (count > 0) {
        for (const key in data) {
          if(key != "time"){
            data[key] = (data[key] / count).toFixed(1)
            data[key] = parseFloat(data[key])
        }
      }
      console.log(data)
      return data
      }
    })

    useEffect(() => {
      average_data(dataSensors, sensors)
  }, [sensors]);


    useEffect(()=>{
    average_data(dataSensors, sensors);
    verify_and_get_data(getRawDataSensors, callbackSetSignIn, backend_host, api);
    const timer = setInterval(() => {
        verify_and_get_data(getRawDataSensors, callbackSetSignIn, backend_host, api);
    }, 5000);
    return () => clearInterval(timer);
    },[])
  
  return (
    <div>SensorInfo</div>
  )
}
export default SensorInfo
