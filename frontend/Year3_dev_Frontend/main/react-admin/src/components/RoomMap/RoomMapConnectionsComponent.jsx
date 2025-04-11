import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@mui/system';
import IconButton from '@mui/material/IconButton';
import { AddCircleOutline } from '@mui/icons-material';
import SensorsIcon from '@mui/icons-material/Sensors';
import AirIcon from '@mui/icons-material/Air';

const MapConnectionsContainer = styled('div')({
  position: 'relative',
  width: '1100px',
  height: '800px',
});

const MapConnectionsImg = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute'
});

const SensorButton = styled(IconButton)({
  border: '1px solid',
  borderRadius: '50%',
  padding: '8px',
  fontSize: '1.5rem',
  position: 'absolute',
  '& .MuiButton-startIcon': {
    position: 'relative',
  },
  '& .sensor-label': {
    position: 'absolute',
    top: '-10px',
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

const SvgOverlay = styled('svg')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
});

const RoomMapConnectionsComponent = ({sizeRoom, nodeData, nodeList, nodeFunction, pic_src, offset}) => {
  const sensor_radius = 4.5
  const one_meter_to_width = 1100/sizeRoom[0]
  const one_meter_to_height = 800/sizeRoom[1]
  const getDistance = (node_1, node_2) =>{
    if(!node_1 || !node_2) return null
    return Math.sqrt(((node_1.x-node_2.x)/one_meter_to_width)**2 + ((node_1.y-node_2.y)/one_meter_to_height)**2)
  }
  const connections = []
  for(let i = 0; i < nodeData.length; i++){
    for(let j = i + 1; j < nodeData.length; j++){
      const dist = getDistance(nodeData[i], nodeData[j])
      if( dist <= 2*sensor_radius){
        connections.push({  "from": nodeData[i],
                            "to": nodeData[j],
                            "key": `${i}-${j}`,
                            "distance": dist
                          })}
    }
  }

  return (
    <MapConnectionsContainer>
      <MapConnectionsImg src={pic_src} alt="Map view" />
      <SvgOverlay>

        {connections.map(line_node => (
          <line
            key = {line_node.key}
            x1 = {line_node.from.x + offset}
            y1 = {line_node.from.y + offset}
            x2 = {line_node.to.x + offset}
            y2 = {line_node.to.y + offset}
            stroke = "red"
            strokeWidth = "2"
          />
        ))}

        {nodeData.map((sensor, index) => (
          <ellipse
            key={`ellipse-${index}`}
            cx={sensor.x + offset}
            cy={sensor.y + offset}
            rx={sensor_radius* one_meter_to_width}
            ry={sensor_radius * one_meter_to_height}
            stroke="black"
            strokeWidth="2"
            fill="none"
          />

  ))}
      </SvgOverlay>
      {nodeData.map((sensor, index) => (
          <SensorButton
            size='large'
            key={index}
            variant="contained"
            color="primary"
            style={{ top: sensor.y, left: sensor.x , backgroundColor: (nodeFunction[index] === 'sensor' ? 'white' : 'aqua') }} 
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
      
    </MapConnectionsContainer>
  );
};

export default RoomMapConnectionsComponent;