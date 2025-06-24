import React, { useEffect, useRef, useState, useMemo } from 'react';
import { styled } from '@mui/system';
import IconButton from '@mui/material/IconButton';
import { AddCircleOutline } from '@mui/icons-material';
import SensorsIcon from '@mui/icons-material/Sensors';
import AirIcon from '@mui/icons-material/Air';

const MapConnectionsContainer = styled('div')({
  position: 'relative',
  width: '100%',
  maxWidth: '1100px',
  height: '800px',
  border: '1px solid #ccc',
});

const MapConnectionsImg = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  position: 'absolute',
});

const SensorButton = styled(IconButton)({
  border: '1px solid',
  borderRadius: '50%',
  padding: '8px',
  fontSize: '1.5rem',
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
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
  pointerEvents: 'none',
});

const RoomMapConnectionsComponent = ({ sizeRoom, nodeData, nodeList, nodeFunction, pic_src, offset = 0 }) => {
  const imgRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 1100, height: 800 });

  useEffect(() => {
    const updateSize = () => {
      if (imgRef.current) {
        setImageSize({
          width: imgRef.current.offsetWidth,
          height: imgRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const one_meter_to_width = imageSize.width / sizeRoom[0];
  const one_meter_to_height = imageSize.height / sizeRoom[1];

  const getDistance = (node1, node2) => {
    if (!node1 || !node2) return null;
    return Math.sqrt(
      ((node1.x - node2.x) / one_meter_to_width) ** 2 +
      ((node1.y - node2.y) / one_meter_to_height) ** 2
    );
  };

  const connections = useMemo(() => {
    const comm_radius = 9;
    const conn = [];
    for (let i = 0; i < nodeData.length; i++) {
      for (let j = i + 1; j < nodeData.length; j++) {
        const dist = getDistance(nodeData[i], nodeData[j]);
        if (dist <= comm_radius) {
          conn.push({
            from: nodeData[i],
            to: nodeData[j],
            key: `${i}-${j}`,
            distance: dist,
          });
        }
      }
    }
    return conn;
  }, [nodeData, one_meter_to_width, one_meter_to_height]);

  const sensor_radius = 20;

  return (
    <MapConnectionsContainer>
      <MapConnectionsImg src={pic_src} alt="Map view" ref={imgRef} />

      <SvgOverlay width={imageSize.width} height={imageSize.height}>
        {connections.map((line_node) => (
          <line
            key={line_node.key}
            x1={line_node.from.x + offset}
            y1={line_node.from.y + offset}
            x2={line_node.to.x + offset}
            y2={line_node.to.y + offset}
            stroke="red"
            strokeWidth="2"
          />
        ))}

        {nodeData.map((sensor, index) => (
          <ellipse
            key={`ellipse-${index}`}
            cx={sensor.x + offset}
            cy={sensor.y + offset}
            rx={sensor_radius * one_meter_to_width}
            ry={sensor_radius * one_meter_to_height}
            stroke="black"
            strokeWidth="2"
            fill="none"
          />
        ))}
      </SvgOverlay>

      {nodeData.map((sensor, index) => (
        <SensorButton
          size="large"
          key={index}
          color="primary"
          style={{
            top: sensor.y + offset,
            left: sensor.x + offset,
            backgroundColor: nodeFunction[index] === 'sensor' ? 'white' : 'aqua',
          }}
          title={`Node ${nodeList[index]} (${nodeFunction[index]})`}
        >
          {nodeFunction[index] === 'sensor' ? (
            <SensorsIcon fontSize="inherit" />
          ) : (
            <AirIcon fontSize="inherit" />
          )}
          <span className="sensor-label">{nodeList[index]}</span>
        </SensorButton>
      ))}
    </MapConnectionsContainer>
  );
};

export default RoomMapConnectionsComponent;
