import * as THREE from 'three';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useRef, useLayoutEffect, useState } from 'react';
import { MapControls } from '@react-three/drei';
import SensorsIcon from '@mui/icons-material/Sensors';
import AirIcon from '@mui/icons-material/Air';
import './styles.css';
import { host } from '../../App';
import verifyAccessToken from '../../function/verifyAccessToken';
import verifyRefreshToken from '../../function/verifyRefreshToken';
import { Html } from '@react-three/drei';
import { Box3 } from "three";
import { Tooltip, Grid, Typography } from "@mui/material";
import { Box } from "@mui/material";
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

function ImagePlane({ url, setClickPos}) {
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
      if(data_max_min.length > 0){
        data_max_min = []
        data_max_min.push(bbox.min.x, bbox.max.x, bbox.min.y, bbox.max.y)
      } else{
        data_max_min.push(bbox.min.x, bbox.max.x, bbox.min.y, bbox.max.y)
      }
    }
  }, [texture, size, camera]);

  return (
    <mesh ref={ref} onClick={(e) => setClickPos({ x: e.point.x, y: e.point.y })}>
      <planeGeometry args={[1.5, 1.5]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function Point({ id, x, y, type, addSelectedNode, callbackSetSignIn}) {
  const backend_host = host
  const api = `http://${backend_host}/api/employee_node`
  const [clicked, setClicked] = useState(false);
  const ListNodeUserPermission = async (url, access_token)=>{
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
            return data
          }
      }
      else{
          alert("Some error happened, try to reload page!");
          return null
      }
  }
  return (
    <Html position={[x, y, 0.2]} transform distanceFactor={1}>
      <div
        onClick={ async (e) => {
          e.stopPropagation();
          let role_user = null
          if(localStorage.getItem("role") !== null){
            role_user = localStorage.getItem("role");
          } else {
            throw new Error("There is no role ....");
          }
          if(role_user !== '0'){
            addSelectedNode(id, type);
            setClicked(!clicked);
          } else {
            const permission = await verify_and_get_data(ListNodeUserPermission, callbackSetSignIn, backend_host, api)
            if(permission.length > 0){
              if(permission.includes(id)){
                addSelectedNode(id, type);
                setClicked(!clicked);
              } else {
                window.alert(`You don't have register node ${id} from admin`);
              }
            }else{
              window.alert("You don't have register node from admin");
              console.log("No data")
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
        }}
      >
        {type === "sensor" ? (
          <Tooltip
          style={{
            fontSize: "14px",
            backgroundColor: "white",
            border: '1px solid #eeeeee',
            maxWidth: 400,
            whiteSpace: 'normal'
        }}
        placement="left"
          title={
            <Grid>
              <Typography color="inherit">{`Node id: ${id}`}</Typography>
              <Typography color="inherit">{`Position X: ${x}`}</Typography>
              <Typography color="inherit">{`Position Y: ${y}`}</Typography>
              <Typography color="inherit">{`Function: Sensor`}</Typography>
            </Grid>
          }>
            <SensorsIcon style={{ color: "black", fontSize: clicked ? "32px" : "24px" }} />
          </Tooltip>
        ) : (
          <Tooltip
          style={{
            fontSize: "14px",
            backgroundColor: "white",
            border: '1px solid #eeeeee',
            maxWidth: 400,
            whiteSpace: 'normal'
        }}
        placement="left"
          title={
            <Grid>
              <Typography color="inherit">{`Node id: ${id}`}</Typography>
              <Typography color="inherit">{`Position X: ${x}`}</Typography>
              <Typography color="inherit">{`Position Y: ${y}`}</Typography>
              <Typography color="inherit">{`Function: Actuator`}</Typography>
            </Grid>
          }
          >
            <AirIcon style={{ color: "black", fontSize: clicked ? "32px" : "24px" }} />
          </Tooltip>
        )}
        <span style ={
          {
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
          }
        }
        >{id}</span>
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

function RoomMap2D({ url, configurationNodeAll, setListNode, callbackSetSignIn, setSeparate, widthMap, heightMap}) {
  const [clickPos, setClickPos] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);

  const addSelectedNode = (id, type) => {
    setSelectedNodes((prevData) =>{
      const exists = prevData.some((node) => node.id === id);
      const data = exists ? prevData.filter((node) => node.id !== id) : [...prevData, {id, type}]
      setListNode(data)
      setSeparate(data.length > 0)
      return data
    }
    );
  };
  const points = configurationNodeAll.map((point) => ({
    id : point.node_id, x: point.x_axis, y: point.y_axis, type: point.function
  }))

  return (
    <Box
      sx={{
        border: "2px solid black",
        borderRadius: "12px",
        overflow: "hidden",
        width: widthMap ? widthMap :"100%",
        height: heightMap? heightMap :"1000px",
      }}
    >
        <Canvas orthographic camera={{ position: [0, 0, 10], up: [0, 1, 0], near: 0.1, far: 100 }}>
          <Suspense fallback={null}>
            <ImagePlane url={url} setClickPos={setClickPos}/>
            {points.map((point) => (
              <Point
                key={point.id} {...point}
                addSelectedNode={addSelectedNode}
                callbackSetSignIn={callbackSetSignIn}
                setSeparate={setSeparate}
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
