import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@mui/system';
import h337 from 'heatmap.js';
import IconButton from '@mui/material/IconButton';
import { AddCircleOutline } from '@mui/icons-material';
import plan_409 from "../../assets/409.svg";
import SensorsIcon from '@mui/icons-material/Sensors';
import AirIcon from '@mui/icons-material/Air';

const HeatmapContainer = styled('div')({
  position: 'relative',
  width: '321px',
  height: '351px',
});

const HeatmapImg = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute'
});

const HeatmapOverlay = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  opacity: '200%'
});

const HeatmapComponent = ({nodeData, nodeList, nodeFunction, pic_src, showHeatmap}) => {
  const heatmapRef = useRef(null);
  
  const SensorButton = styled(IconButton)({
    border: '1px solid', // Add border to create an outlined effect
    borderRadius: '50%', // Ensure the button is circular
    padding: '8px', // Add padding to adjust the size of the button as needed
    fontSize: '3rem',
    position: 'absolute',
    '& .MuiButton-startIcon': {
      position: 'relative',
    },
    '& .sensor-label': {
      position: 'absolute',
      top: '50px',
      right: '0px',
      backgroundColor: 'red',
      color: 'white',
      borderRadius: '50%',
      width: '18px',
      height: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
    },
  });

  useEffect(() => {
    const heatmapInstance = h337.create({
      container: heatmapRef.current,
    });

    const data = {
      max: 60,
      data: nodeData,
    };

    heatmapInstance.setData(data);
  }, [nodeData]);

  return (
    <HeatmapContainer>
      <HeatmapImg hidden={showHeatmap ? true : false} src={pic_src} alt="Map view" />
      <HeatmapOverlay hidden={showHeatmap ? false : true} ref={heatmapRef} />
      {nodeData.map((sensor, index) => (
          <SensorButton
            size='large'
            key={index}
            variant="contained"
            color="primary"
            style={{ top: sensor.y - 25, left: sensor.x - 25, backgroundColor: (nodeFunction[index] === 'sensor' ? 'white' : 'aqua') }} 
            startIcon={<AddCircleOutline />}
          >
            {nodeFunction[index] === 'sensor' ?
            <SensorsIcon fontSize='inherit' />
            :
            <AirIcon fontSize='inherit' />
            }
            <span className="sensor-label">{nodeList[index]}</span>
          </SensorButton>
      ))}
      
    </HeatmapContainer>
  );
};

export default HeatmapComponent;