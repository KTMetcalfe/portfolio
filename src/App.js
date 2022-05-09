import './App.css';

import React, { useContext, useCallback, useRef, useState } from 'react';
import { Suspense } from 'react';
import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, useCamera } from '@react-three/drei';
import { Physics, useSphere } from '@react-three/cannon';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import sunImg from './images/2k_sun.jpg';
import mercuryImg from './images/2k_mercury.jpg';
import venusImg from './images/2k_venus_atmosphere.jpg';
import earthImg from './images/2k_earth_daymap.jpg';
import marsImg from './images/2k_mars.jpg';
import jupiterImg from './images/2k_jupiter.jpg';
import saturnImg from './images/2k_saturn.jpg';
import uranusImg from './images/2k_uranus.jpg';
import neptuneImg from './images/2k_neptune.jpg';

const AppContext = React.createContext({});

function Planet({ distance, size, speed, rotation, name }) {
  const { setState } = useContext(AppContext);

  // Allows for physics
  const [ref, api] = useSphere(() => ({ position: [0, 0, -distance] }));

  // Updates object every frame
  useFrame(() => {
    const eu = new THREE.Euler(
      THREE.MathUtils.degToRad(0),
      THREE.MathUtils.degToRad(speed === 0 ? 0 : 360 / speed / 60),
      THREE.MathUtils.degToRad(0)
    );
    const offset = ref.current.position.applyEuler(eu);
    api.position.copy(offset);

    api.rotation.set(ref.current.rotation.x, ref.current.rotation.y += THREE.MathUtils.degToRad(360 / rotation), ref.current.rotation.z);
  });

  // Chooses appropriate planet texture
  let map = null;
  switch (name) {
    default:
      map = sunImg;
      break;
    case 'Mercury':
      map = mercuryImg;
      break;
    case 'Venus':
      map = venusImg;
      break;
    case 'Earth':
      map = earthImg;
      break;
    case 'Mars':
      map = marsImg;
      break;
    case 'Jupiter':
      map = jupiterImg;
      break;
    case 'Saturn':
      map = saturnImg;
      break;
    case 'Uranus':
      map = uranusImg;
      break;
    case 'Neptune':
      map = neptuneImg;
      break;
  }
  const texture = useLoader(THREE.TextureLoader, map);

  // Returns the planet
  return (
    <mesh ref={ref} position={[0, 0, -distance]} onClick={() => { console.log(ref); setState({ selectedRef: ref }) }}>
      <sphereBufferGeometry args={[size]} />
      {map != null ?
        <meshStandardMaterial map={texture} />
        :
        <meshLambertMaterial color='pink' />
      }
    </mesh>
  )
}

function CameraControls() {
  const { state } = useContext(AppContext);

  const {
    camera,
    gl: { domElement }
  } = useThree();

  const controls = useRef();
  useFrame(() => {
    controls.current.update();

    // Locks camera to target
    if (state.selectedRef !== null && state.selectedRef.current !== null) {
      camera.lookAt(0, 0, 0);
      const quaternion = new THREE.Quaternion();
      const goodPos = new THREE.Vector3(state.selectedRef.current.position.x, state.selectedRef.current.position.y + 20, state.selectedRef.current.position.z).multiplyScalar(1.5)
      camera.position.lerp(goodPos, .1);
      camera.updateProjectionMatrix();
    }
    // else {
    //   camera.lookAt(0, 0, 0);
    //   camera.position.lerp(new THREE.Vector3(50, 50, 50), .1);
    //   camera.updateProjectionMatrix();
    // }
  })
  return (
    <OrbitControls
      ref={controls}
      args={[camera, domElement]}
      enableZoom={true}
      enablePan={true}
    />
  )
}

function App() {
  // Seconds (60 frames) per year (1 earth revolution)
  const revTime = 365;

  // Constants for comparison
  const earthDist = 100;
  const earthSize = 1;

  // State variables
  const [state, setState] = useState({ selectedRef: null });

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (state.selectedRef !== null)
      setState({ selectedRef: null })
  }, false)

  // Main renderer
  return (
    <div className="App">
      <Canvas colorManagement camera={{ position: [50, 50, 50] }}>
        <AppContext.Provider value={{ state, setState }} >
          <Stars radius={250} />
          <CameraControls />
          <ambientLight intensity={0.25} />
          <pointLight intensity={2} />
          <Physics>
            <Suspense fallback={null}>
              <Planet distance={0} size={20 * earthSize} speed={0} rotation={revTime * 27} name='Sun' />
              <Planet distance={0.39 * earthDist} size={0.38 * earthSize} speed={revTime / 0.62} rotation={revTime * 58.67} name='Mercury' />
              <Planet distance={0.72 * earthDist} size={0.95 * earthSize} speed={revTime / 0.24} rotation={revTime * 243.02} name='Venus' />
              <Planet distance={earthDist} size={earthSize} speed={revTime} rotation={revTime * 0.99} name='Earth' />
              {/* Distance is SCALED DOWN for the last five planets */}
              <Planet distance={1.52 * earthDist / 1.25} size={0.53 * earthSize} speed={revTime / 1.88} rotation={revTime * 1.02} name='Mars' />
              <Planet distance={5.2 * earthDist / 3} size={10.97 * earthSize} speed={revTime / 11.86} rotation={revTime * 0.42} name='Jupiter' />
              <Planet distance={9.54 * earthDist / 4} size={9.14 * earthSize} speed={revTime / 29.46} rotation={revTime * 0.44} name='Saturn' />
              <Planet distance={19.18 * earthDist / 6} size={3.98 * earthSize} speed={revTime / 164.79} rotation={revTime * 0.72} name='Uranus' />
              <Planet distance={30.06 * earthDist / 8} size={3.86 * earthSize} speed={revTime / 248.59} rotation={revTime * 0.67} name='Neptune' />
            </Suspense>
          </Physics>
        </AppContext.Provider>
      </Canvas>
    </div>
  );
}

export default App;
