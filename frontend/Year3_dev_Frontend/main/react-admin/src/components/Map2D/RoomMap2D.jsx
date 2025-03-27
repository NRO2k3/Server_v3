import * as THREE from 'three';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useRef, useLayoutEffect, useState } from 'react';
import { MapControls, Html } from '@react-three/drei';
import SensorsIcon from '@mui/icons-material/Sensors';
import AirIcon from '@mui/icons-material/Air';
import './styles.css';

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
  }, [texture, size, camera]);

  return (
    <mesh ref={ref} onClick={(e) => setClickPos({ x: e.point.x, y: e.point.y })}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function Point({ id, x, y, type }) {
  const [clicked, setClicked] = useState(false);
  return (
    <Html position={[x, y, 0.2]} center>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setClicked(!clicked);
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
          <SensorsIcon style={{ color: "black", fontSize: clicked ? "32px" : "24px" }} />
        ) : (
          <AirIcon style={{ color: "black", fontSize: clicked ? "32px" : "24px" }} />
        )}
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

function RoomMap2D({ url, configurationNodeAll }) {
  const [clickPos, setClickPos] = useState(null);
  console.log(configurationNodeAll)
  const points = configurationNodeAll.map((point) => ({
    id : point.id, x: point.x_axis, y: point.y_axis, type: point.function
  }))
  return (
    <Canvas orthographic camera={{ position: [0, 0, 10], up: [0, 1, 0], near: 0.1, far: 100 }}>
      <Suspense fallback={null}>
        <ImagePlane url={url} setClickPos={setClickPos}/>
        {points.map((point) => (
          <Point key={point.id} {...point}/>
        ))}
      </Suspense>
      <ClickCoordinates clickPos={clickPos} />
      <MapControls enableRotate={false} screenSpacePanning={true} panSpeed={2} />
    </Canvas>
  );
}

export default RoomMap2D;
