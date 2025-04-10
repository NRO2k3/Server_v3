import React from "react";
import { useState, useEffect, memo } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from '../../theme';
import { useTranslation } from "react-i18next";

const FilterParameter = ({setParaFilter}) => 
{
	const {t} = useTranslation()
	const theme = useTheme();
    const colors = tokens(theme.palette.mode);
	const [paraState, setParaState] = useState(1)
	const handleChange = (event) => {
		setParaFilter(event.target.value);
		setParaState(event.target.value);
		// setNodeIdFilter(event.target.value);
	};
    const para_filter_dict = [
        {index: 0, value: `all`},
        {index: 1, value: `temperature`},
        {index: 2, value: `hudminity`},
        {index: 3, value: `CO2`},
        {index: 4, value: `tvoc`},
        {index: 5, value: `light`},
        {index: 6, value: `dust`},
    ];

  return (
	<FormControl style={{width: '150%'}} size='small'>
		<InputLabel id="demo-simple-select-label">{t("parameter")}</InputLabel>
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
						<MenuItem disabled={i.index === 0 ? true : false} value={i.index}>{t(i.value)}</MenuItem>
					);		
				})
			}
		</Select>
	</FormControl>
  );
}

export default React.memo(FilterParameter);