import './App.css';

import React from 'react';
import { Suspense } from 'react';
import * as THREE from "three";
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
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

import Model from './Lantern';
import Starbase from './Interior';

function Planet({ distance, size, speed, rotation, name }) {
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
    <mesh ref={ref} position={[0, 0, -distance]}>
      <sphereBufferGeometry args={[size]} />
      {map != null ?
        <meshStandardMaterial map={texture} />
        :
        <meshLambertMaterial color='pink' />
      }
    </mesh>
  )
}

function App() {
  // Seconds (60 frames) per year (1 earth revolution)
  const revTime = 31540000;

  // Constants for comparison
  const earthDist = 100;
  const earthSize = 1;

  // Main renderer
  return (
    <div className="App">
      <Canvas colorManagement camera={{ fov: 45, position: [40, 40, 40] }}>
        <Stars radius={250} />
        <OrbitControls target={[0, 10, 0]} />
        <ambientLight intensity={10} />
        <pointLight intensity={1} position={[0,4,-5]} />
        <Suspense fallback={null}>
          <Model />
          <Starbase />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
