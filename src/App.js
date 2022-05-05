import './App.css';

import * as THREE from "three";
import { Canvas, useFrame } from 'react-three-fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Physics, useBox, useSphere } from '@react-three/cannon';

function Box() {
  const [ref, api] = useBox(() => ({ position: [0, 0, 0] }))
  return (
    <mesh onClick={() => api.velocity.set(0, 1, 0)} ref={ref} position={[0, 0, 0]}>
      <boxBufferGeometry attach='geometry' />
      <meshLambertMaterial attach='material' color='lightblue' />
    </mesh>
  )
}

function Planet({distance, speed, color}) {
  const [ref, api] = useSphere(() => ({ position: [distance, 0, 0] }))
  useFrame(() => {
    const eu = new THREE.Euler(
      THREE.MathUtils.degToRad(0),
      THREE.MathUtils.degToRad(speed),
      THREE.MathUtils.degToRad(0)
    );
    const offset = ref.current.position.applyEuler(eu);
    api.position.copy(offset);
  });
  return (
    <mesh ref={ref} position={[distance, 0, 0]}>
      <sphereBufferGeometry attach='geometry' />
      <meshLambertMaterial attach='material' color={color} />
    </mesh>
  )
}

function App() {
  return (
    <div className="App">
      <Canvas>
        <Stars />
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 15, 10]} angle={0.3} />
        <Physics>
          <Box />
          <Planet distance={2} speed={1} color='red' name='' />
          <Planet distance={4} speed={2} color='orange' name='' />
          <Planet distance={6} speed={3} color='yellow' name='' />
          <Planet distance={8} speed={4} color='green' name='' />
          <Planet distance={10} speed={5} color='blue' name='' />
          <Planet distance={12} speed={6} color='red' name='' />
          <Planet distance={14} speed={7} color='orange' name='' />
          <Planet distance={16} speed={8} color='yellow' name='' />
        </Physics>
      </Canvas>
    </div>
  );
}

export default App;
