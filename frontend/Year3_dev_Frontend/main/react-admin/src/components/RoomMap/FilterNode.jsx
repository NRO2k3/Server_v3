import { useState, useEffect } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Box, Button, IconButton, Stack, Typography, useTheme } from "@mui/material";
import FormControlLabel from '@mui/material';
import FormGroup from '@mui/material';
import { tokens } from '../../theme';
import Checkbox from '@mui/material';
import verify_and_get_data from '../../function/fetchData';
import { Margin } from '@mui/icons-material';

export default function FilterNode({setNodeIdFilter, apiInformationTag, callbackSetSignIn, backend_host, setIsLoadingChart}) {
	const theme = useTheme();
    const colors = tokens(theme.palette.mode);
	const [isLoading, setIsLoading] = useState(true);
	const [sensorNodeIdState, setSensorNodeIdState] = useState(0);
	const node_id_dict = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6};
	const handleChange = (event) => {
		const selectedValue = event.target.value;
		setSensorNodeIdState(selectedValue);
		setNodeIdFilter(selectedValue);
		setIsLoadingChart(true);
	};
	const [sensorNodeInfo, setSensorNodeInfo] = useState([])

	const get_sensor_node_info = async (url, access_token) => 
	{ 
		const headers = 
		{
			"Content-Type": "application/json",
			"Authorization": `Bearer ${access_token}`, 	//!< do not need to get authorization yet. in back end all APIS are public
		}

		const option_request = 
		{
			"method" : "GET",
			"headers" : headers,
			"body": null,
		}

		let sensor_room_response = null;
		let sensor_room_response_data = null;

		try
		{
			sensor_room_response = await fetch(url, option_request);
			sensor_room_response_data = await sensor_room_response.json();
		}
		catch(err)
		{
			alert("Error happened while getting data! Error: " + err + "!");
		}
		
		if(sensor_room_response.status === 200)
		{
			let temp_list = (sensor_room_response_data["node_info"] && sensor_room_response_data["node_info"]["sensor"] != null)
			? sensor_room_response_data["node_info"]["sensor"]
			: null;
			if(temp_list!=null){
				let new_sensorNodeInfo = []
				temp_list.forEach((i)=>{
					new_sensorNodeInfo.push(i["node_id"])
				})
				new_sensorNodeInfo.sort();	//!< sort the list of all sensor node_id in this room in ascending order
				new_sensorNodeInfo.unshift(0);	//!< all one more "null" value in the front of the list
				setSensorNodeInfo(new_sensorNodeInfo);
				setIsLoading(false);
			}
		}
		else
		{
			alert("Sensor nodes information fetching failed! Status code: " + sensor_room_response.status)
		}
	}

	useEffect(()=>{
		verify_and_get_data(get_sensor_node_info, callbackSetSignIn, backend_host, apiInformationTag);
	},[])

  return (
	<>
	{
		isLoading ? 
		<h1>Loading ...</h1>
		:
		<FormControl style={{width: '100%'}} size='small'>
			<InputLabel id="demo-simple-select-label">Sensor id</InputLabel>
			<Select
				labelId="demo-simple-select-label"
				id="demo-simple-select"
				value={sensorNodeIdState}
				label="Sensor Node"
				onChange={handleChange}
			>
				{
					sensorNodeInfo.map((i)=>{
						if(i === 0)
						{
							return (
								<MenuItem value={0}>None</MenuItem>
							);
						}
						else
						{
							return (
								<MenuItem value={i}>
									{i}
								</MenuItem>
							);		
						}
					})
				}
			</Select>
		</FormControl>
	}
	</>
  );
}