import * as THREE from 'three';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useRef, useLayoutEffect, useState } from 'react';
import { MapControls, Html, OrbitControls } from '@react-three/drei';
import SensorsIcon from '@mui/icons-material/Sensors';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AirIcon from '@mui/icons-material/Air';
import './styles.css';
import { host } from '../../App';
import verifyAccessToken from '../../function/verifyAccessToken';
import verifyRefreshToken from '../../function/verifyRefreshToken';
import { Box3 } from "three";
import { Tooltip, Grid, Typography, Box } from "@mui/material";

export let data_max_min = []

const verify_and_get_data = async (fetch_data_function, callbackSetSignIn, backend_host, url) => {
  const token = { access_token: null, refresh_token: null };

  if (localStorage.getItem("access") !== null && localStorage.getItem("refresh") !== null) {
    token.access_token = localStorage.getItem("access");
    token.refresh_token = localStorage.getItem("refresh");
  } else {
    throw new Error("There is no access token and refresh token ....");
  }

  if (await verifyAccessToken(backend_host, token)) {
    return await fetch_data_function(url, token["access_token"]);
  } else {
    if (await verifyRefreshToken(backend_host, token)) {
      return await fetch_data_function(url, token["access_token"]);
    } else {
      callbackSetSignIn(false);
      return null;
    }
  }
};

function ImagePlane({ url, setClickPos }) {
  const texture = useLoader(THREE.TextureLoader, url);
  const ref = useRef();
  const { size, camera } = useThree();

  useLayoutEffect(() => {
    if (ref.current && texture.image) {
      const { width, height } = texture.image;
      const aspect = width / height;
      ref.current.scale.set(aspect, 1.5, 2);
      const screenAspect = size.width / size.height;
      camera.zoom = screenAspect > aspect ? size.height / 2 : size.width / (2 * aspect);
      camera.updateProjectionMatrix();
    }
    if (ref.current) {
      ref.current.geometry.computeBoundingBox();
      const bbox = new Box3().setFromObject(ref.current);
      if (data_max_min.length > 0) {
        data_max_min = [];
      }
      data_max_min.push(bbox.min.x, bbox.max.x, bbox.min.y, bbox.max.y);
      console.log(data_max_min)
    }
  }, [texture, size, camera]);

  return (
    <mesh ref={ref} onClick={(e) => setClickPos({ x: e.point.x, y: e.point.y })}>
      <planeGeometry args={[1.5, 1.5]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function Point({ id, x, y, type, status, addSelectedNode, callbackSetSignIn }) {
  const backend_host = host;
  const api = `http://${backend_host}/api/employee_node`;
  const [clicked, setClicked] = useState(false);

  const ListNodeUserPermission = async (url, access_token) => {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access_token}`,
    };
    const option_fetch = {
      method: "GET",
      headers: headers,
      body: null,
    };
    const response = await fetch(url, option_fetch);
    const data = await response.json();
    if (data && response.status === 200) {
      return data;
    } else {
      alert("Some error happened, try to reload page!");
      return null;
    }
  };

  return (
    <Html position={[x, y, 0.2]} transform distanceFactor={1}>
      <div
        onClick={async (e) => {
          e.stopPropagation();
          let role_user = localStorage.getItem("role");
          if (role_user !== '0') {
            addSelectedNode(id, type);
            setClicked(!clicked);
          } else {
            const permission = await verify_and_get_data(ListNodeUserPermission, callbackSetSignIn, backend_host, api);
            if (permission && permission.includes(id)) {
              addSelectedNode(id, type);
              setClicked(!clicked);
            } else {
              window.alert(`You don't have register node ${id} from admin`);
            }
          }
        }}
        style={{
          backgroundColor: type === "sensor" ? "white" : "aqua",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: clicked ? "52px" : "40px",
          height: clicked ? "52px" : "40px",
          cursor: "pointer",
          border: "2px solid black",
          transition: "transform 0.2s, width 0.2s, height 0.2s",
          transform: clicked ? "scale(1.3)" : "scale(1)",
          position: 'relative'
        }}
      >
        {type === "sensor" ? (
          <Tooltip title={
            <Grid>
              <Typography>{`Node id: ${id}`}</Typography>
              <Typography>{`Position X: ${x}`}</Typography>
              <Typography>{`Position Y: ${y}`}</Typography>
              <Typography>{`Function: Sensor`}</Typography>
            </Grid>
          }>
            {status === "sync" ?<SensorsIcon style={{ color: "black", fontSize: clicked ? "32px" : "24px" }} />:
            <ReportProblemIcon style={{ color: "red", fontSize: clicked ? "32px" : "24px" }} />}
          </Tooltip>
        ) : (
          <Tooltip title={
            <Grid>
              <Typography>{`Node id: ${id}`}</Typography>
              <Typography>{`Position X: ${x}`}</Typography>
              <Typography>{`Position Y: ${y}`}</Typography>
              <Typography>{`Function: Actuator`}</Typography>
            </Grid>
          }>
            {status === "sync" ?<AirIcon style={{ color: "black", fontSize: clicked ? "32px" : "24px" }} />:
            <ReportProblemIcon style={{ color: "red", fontSize: clicked ? "32px" : "24px" }} />}
          </Tooltip>
        )}
        <span style={{
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
        }}>{id}</span>
      </div>
    </Html>
  );
}

function ClickCoordinates({ clickPos }) {
  return clickPos ? (
    <Html position={[clickPos.x, clickPos.y, 0.2]}>
      <div className="click-tooltip">X: {clickPos.x.toFixed(2)}, Y: {clickPos.y.toFixed(2)}</div>
    </Html>
  ) : null;
}

function RoomMap2D({ url, configurationNodeAll, setListNode, callbackSetSignIn, setSeparate, widthMap, heightMap, statusConnections, data_passed_from_landingpage }) {
  const [clickPos, setClickPos] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);

  const addSelectedNode = (id, type) => {
    setSelectedNodes((prevData) => {
      const exists = prevData.some((node) => node.id === id);
      const data = exists ? prevData.filter((node) => node.id !== id) : [...prevData, { id, type }];
      setListNode(data);
      setSeparate(data.length > 0);
      return data;
    });
  };

  const points = configurationNodeAll.map((point) => ({
    id: point.node_id,
    x: point.x_axis,
    y: point.y_axis,
    type: point.function,
    status: point.status
  }));

  const nodeConnections = statusConnections
    ? (() => {
      const lines = [];
      const CONNECTION_RADIUS = 40;
      const [xMin, xMax, yMin, yMax] = data_max_min;
      const sizeRoom = [data_passed_from_landingpage.x_length, data_passed_from_landingpage.y_length];
      const one_meter_to_width = (xMax - xMin) / sizeRoom[0];
      const one_meter_to_height = (yMax - yMin) / sizeRoom[1];
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = (points[i].x - points[j].x) / one_meter_to_width;
          const dy = (points[i].y - points[j].y) / one_meter_to_height;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= CONNECTION_RADIUS) {
            lines.push({
              from: points[i],
              to: points[j],
              key: `${points[i].id}-${points[j].id}`
            });
          }
        }
      }
      return lines;
    })()
    : [];

  return (
    <Box sx={{
      border: "1px solid black",
      borderRadius: "12px",
      overflow: "hidden",
      width: widthMap ? widthMap : "100%",
      height: heightMap ? heightMap : "1000px",
    }}>
      <Canvas orthographic camera={{ position: [0, 0, 10], up: [0, 1, 0], near: 0.1, far: 100 }}>
      <OrbitControls minZoom={200} maxZoom={600} />
        <Suspense fallback={null}>
          <ImagePlane url={url} setClickPos={setClickPos} />
          {statusConnections &&
            nodeConnections.map((conn) => (
              <line key={conn.key}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([
                      conn.from.x, conn.from.y, 0,
                      conn.to.x, conn.to.y, 0
                    ])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineDashedMaterial
                  color="red"
                  linewidth={2}
                  dashSize={0.5}
                  gapSize={0.1}
                />
              </line>
            ))}
          {points.map((point) => (
            <Point
              key={point.id}
              {...point}
              addSelectedNode={addSelectedNode}
              callbackSetSignIn={callbackSetSignIn}
            />
          ))}
        </Suspense>
        <ClickCoordinates clickPos={clickPos} />
        <MapControls enableRotate={false} screenSpacePanning={true} panSpeed={2} />
      </Canvas>
    </Box>
  );
}

export default RoomMap2D;
