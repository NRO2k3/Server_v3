import * as THREE from 'three';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useRef, useLayoutEffect, useState } from 'react';
import { MapControls, Html } from '@react-three/drei';
import './styles.css';

const points = [
  { x: -0.5, y: 0.3, color: 'red' },
  { x: 0.2, y: -0.4, color: 'blue' },
  { x: 0.6, y: 0.1, color: 'green' }
];

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
  }, [texture, size, camera]);

  return (
    <mesh ref={ref} onClick={(e) => setClickPos({ x: e.point.x, y: e.point.y })}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function Point({ x, y, color, setClickPos }) {
  const [pointColor, setPointColor] = useState(color); // Lưu trạng thái màu sắc

  return (
    <mesh position={[x, y, 0.1]} onPointerDown={(e) => {
      e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
      setClickPos({ x, y });
      setPointColor("black"); // Cập nhật màu mới
    }}>
      <circleGeometry args={[0.05, 32]} /> {/* Giảm kích thước */}
      <meshBasicMaterial color={pointColor} /> {/* Dùng state để đổi màu */}
    </mesh>
  );
}



function ClickCoordinates({ clickPos }) {
  return clickPos ? (
    <Html position={[clickPos.x, clickPos.y, 0.2]}>
      <div className="click-tooltip">X: {clickPos.x.toFixed(2)}, Y: {clickPos.y.toFixed(2)}</div>
    </Html>
  ) : null;
}

function RoomMap2D({url}) {
  const [clickPos, setClickPos] = useState(null);

  return (
    <Canvas orthographic camera={{position: [0, 0, 10], up: [0, 1, 0], near: 0.1, far: 100}}>
      <Suspense fallback={null}>
        <ImagePlane url = {url} setClickPos={setClickPos} />
        {points.map((point, index) => (
          <Point key={index} {...point} setClickPos={setClickPos} />
        ))}
      </Suspense>
      <ClickCoordinates clickPos={clickPos} />
      <MapControls enableRotate={false}/>
    </Canvas>
  );
}

export default RoomMap2D;
