import './App.css';

import React, { useContext, useRef, useState } from 'react';
import { Suspense } from 'react';
import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { Physics, useSphere } from '@react-three/cannon';
import { extend } from '@react-three/fiber';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

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

extend({ TextGeometry })

function Planet({ distance, size, speed, rotation, name }) {
  // Allows for global state
  const { state, setState } = useContext(AppContext);

  // Allows for physics
  const [planetRef, planetApi] = useSphere(() => ({ position: [0, 0, -distance] }));

  const textRef = useRef(() => ({ position: [0, size + 5, 0] }));

  // Updates object every frame
  useFrame(() => {
    const eu = new THREE.Euler(
      THREE.MathUtils.degToRad(0),
      THREE.MathUtils.degToRad(speed === 0 ? 0 : 360 / speed / 60),
      THREE.MathUtils.degToRad(0)
    );

    // Sets to expected radius
    const multiple = 1 + ((distance - planetRef.current.position.distanceTo(new THREE.Vector3(0, 0, 0))) / distance);
    const offset = planetRef.current.position.multiplyScalar(multiple > 1.01 || multiple < 0.99 || isNaN(multiple) ? 1 : multiple).applyEuler(eu);
    planetApi.position.copy(offset);

    if (state.selectedRef !== null && state.selectedRef.current !== null && state.selectedRef.current.geometry.parameters !== null) {
      const goodPos = new THREE.Vector3(state.selectedRef.current.position.x, state.selectedRef.current.position.y + (2 * state.selectedRef.current.geometry.parameters.radius), state.selectedRef.current.position.z)
        .multiplyScalar(1 + (5 * (state.selectedRef.current.geometry.parameters.radius / state.selectedRef.current.position.distanceTo(new THREE.Vector3(0, 0, 0)))));
      textRef.current.lookAt(goodPos);
    } else {
      textRef.current.lookAt(new THREE.Vector3(0, offset.y + size * 2, 0));
    }

    planetApi.rotation.set(planetRef.current.rotation.x, planetRef.current.rotation.y += THREE.MathUtils.degToRad(360 / rotation), planetRef.current.rotation.z);
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
    <mesh name={name} ref={planetRef} position={[0, 0, -distance]} onClick={() => { console.log(planetRef); if (name !== 'Sun' && name !== state.selectedRef?.current.name) { setState({ selectedRef: planetRef, shouldLerp: true }) } }}>
      <Text
        ref={textRef}
        position={[0, size * 2, 0]}
        scale={[size * 10, size * 10, size * 10]}
        color='white'
      >
        {name !== 'Sun' && name !== state?.selectedRef?.current.name ? name : ''}
      </Text>
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
  // Allows for global state
  const { state, setState } = useContext(AppContext);

  const {
    camera,
    gl: { domElement }
  } = useThree();

  const controls = useRef();
  useFrame(() => {
    controls.current.update();

    // Locks camera to target
    if (state.selectedRef !== null && state.selectedRef.current !== null && state.selectedRef.current.geometry.parameters !== null) {
      camera.lookAt(0, 0, 0);
      // Moves camera to 1.(5 * planet's width as fraction of distance)
      const goodPos = new THREE.Vector3(state.selectedRef.current.position.x, state.selectedRef.current.position.y + (2 * state.selectedRef.current.geometry.parameters.radius), state.selectedRef.current.position.z)
        .multiplyScalar(1 + (5 * (state.selectedRef.current.geometry.parameters.radius / state.selectedRef.current.position.distanceTo(new THREE.Vector3(0, 0, 0)))))

      if (state.shouldLerp === true) {
        camera.position.lerp(goodPos, .1);
        setTimeout(() => {
          setState({ selectedRef: { ...state.selectedRef }, shouldLerp: false })
        }, 750);
      } else {
        camera.position.copy(goodPos);
      }
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

function FPSUpdater() {
  let second = 0;
  let frames = 0;
  useFrame(() => {
    const date = new Date();
    const newSecond = date.getSeconds();

    frames++;
    if (newSecond !== second) {
      second = date.getSeconds();
      console.log(frames);
      frames = 0;
    }
  })

  return (
    <></>
  )
}

function App() {
  const [secPerYear, setSecPerYear] = useState(365);
  // Seconds (60 frames) per year (1 earth revolution)
  const revTime = secPerYear;

  // Constants for comparison
  const [earthDistance, setEarthDistance] = useState(100);
  const earthDist = earthDistance;
  const earthSize = 1;

  // State variables
  const [state, setState] = useState({ selectedRef: null, shouldLerp: true });

  // Resets target
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (state.selectedRef !== null && state.shouldLerp !== true) {
      setState({ selectedRef: null, shouldLerp: true })
    }
  }, false)

  // Main renderer
  return (
    <div className="App">
      <div className='overlay'>
        {/* Planet selecter 
        <select className='overlayText' value={state.selectedRef === null ? 'default' : state.selectedRef?.current.name} onSelect={e => {}}>
          <option disabled selected value={'default'}>Select a planet</option>
          <option value={"Mercury"}>Mercury</option>
          <option value={"Venus"}>Venus</option>
          <option value={"Earth"}>Earth</option>
          <option value={"Mars"}>Mars</option>
          <option value={"Jupiter"}>Jupiter</option>
          <option value={"Saturn"}>Saturn</option>
          <option value={"Uranus"}>Uranus</option>
          <option value={"Neptune"}>Neptune</option>
        </select> */}
        <button disabled={state.shouldLerp === true} className='overlayText' onClick={() => { setState({ selectedRef: null, shouldLerp: true }) }}>Deselect</button>
        <input type='range' min={1} max={1825} value={secPerYear} step={1} list='steplist' className='overlayInput' onInput={e => setSecPerYear(Number(e.target.value))}></input>
        <datalist id='steplist'>
          <option>1</option>
          <option>365</option>
          <option>730</option>
          <option>1095</option>
          <option>1460</option>
          <option>1825</option>
        </datalist>
        <label className='overlayText'>{secPerYear === 31536000 ? '(1 second = 1 second)' : secPerYear === 365 ? '(1 second = 1 day)' : (365 / secPerYear).toFixed(2)}x</label>
        <button disabled={secPerYear === 31536000} className='overlayText' onClick={() => setSecPerYear(31536000)}>Realtime</button>
        {/* Distance modifier
        <input type='range' min={1} max={500} value={earthDistance} className='overlayInput' onInput={e => setEarthDistance(Number(e.target.value))}></input>
        <label className='overlayText'>{earthDistance}</label> */}
      </div>
      <Canvas camera={{ position: [50, 50, 50] }}>
        <FPSUpdater />
        <AppContext.Provider value={{ state, setState }} >
          <Stars radius={250} />
          <CameraControls />
          <ambientLight intensity={0.25} />
          <pointLight intensity={2} />
          <Physics>
            <Suspense fallback={null}>
              <Planet distance={0} size={20 * earthSize} speed={0} rotation={revTime * 27} name='Sun' />
              <Planet distance={0.39 * earthDist} size={0.38 * earthSize} speed={revTime * 0.62} rotation={revTime * 58.67} name='Mercury' />
              <Planet distance={0.72 * earthDist} size={0.95 * earthSize} speed={revTime * 0.24} rotation={revTime * 243.02} name='Venus' />
              <Planet distance={earthDist} size={earthSize} speed={revTime} rotation={revTime * 0.99} name='Earth' />
              {/* Distance is SCALED DOWN for the last five planets */}
              <Planet distance={1.52 * earthDist / 1.25} size={0.53 * earthSize} speed={revTime * 1.88} rotation={revTime * 1.02} name='Mars' />
              <Planet distance={5.2 * earthDist / 3} size={10.97 * earthSize} speed={revTime * 11.86} rotation={revTime * 0.42} name='Jupiter' />
              <Planet distance={9.54 * earthDist / 4} size={9.14 * earthSize} speed={revTime * 29.46} rotation={revTime * 0.44} name='Saturn' />
              <Planet distance={19.18 * earthDist / 6} size={3.98 * earthSize} speed={revTime * 83.75} rotation={revTime * 0.72} name='Uranus' />
              <Planet distance={30.06 * earthDist / 8} size={3.86 * earthSize} speed={revTime * 163.72} rotation={revTime * 0.67} name='Neptune' />
            </Suspense>
          </Physics>
        </AppContext.Provider>
      </Canvas>
    </div >
  );
}

export default App;
