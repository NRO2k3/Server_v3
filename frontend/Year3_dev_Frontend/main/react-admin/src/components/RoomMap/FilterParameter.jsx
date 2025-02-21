import React from "react";
import { useState, useEffect, memo } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from '../../theme';

const FilterParameter = ({setParaFilter}) => 
{
	const theme = useTheme();
    const colors = tokens(theme.palette.mode);
	const [paraState, setParaState] = useState(1)
	const handleChange = (event) => {
		setParaFilter(event.target.value);
		setParaState(event.target.value);
		// setNodeIdFilter(event.target.value);
	};
    const para_filter_dict = [
        {index: 0, value: `All\xa0\xa0\xa0\xa0\xa0\xa0\xa0`}, 
        {index: 1, value: `Temperature\xa0\xa0\xa0\xa0\xa0\xa0\xa0`}, 
        {index: 2, value: `Humid\xa0\xa0\xa0\xa0\xa0\xa0\xa0`}, 
        {index: 3, value: `CO2\xa0\xa0\xa0\xa0\xa0\xa0\xa0`}, 
        {index: 4, value: `TVOC\xa0\xa0\xa0\xa0\xa0\xa0\xa0`},
        {index: 5, value: `Light\xa0\xa0\xa0\xa0\xa0\xa0\xa0`},
        {index: 6, value: `Dust\xa0\xa0\xa0\xa0\xa0\xa0\xa0`},
    ];

  return (
	<FormControl style={{width: '150%'}} size='small'>
		<InputLabel id="demo-simple-select-label">Parameter</InputLabel>
		<Select
			labelId="demo-simple-select-label"
			id="demo-simple-select"
			value={paraState}
			label="Sensor Node"
			onChange={handleChange}
		>
			{
				para_filter_dict.map((i)=>{
					return (
						<MenuItem disabled={i.index === 0 ? true : false} value={i.index}>{i.value}</MenuItem>
					);		
				})
			}
		</Select>
	</FormControl>
  );
}

export default React.memo(FilterParameter);