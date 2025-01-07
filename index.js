import * as THREE from "three";
import { FBXLoader } from "jsm/loaders/FBXLoader.js";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import getBgSphere from "./src/getBgSphere.js";

let w = window.innerWidth;
let h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.set(0, 0, 5);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const ctrls = new OrbitControls(camera, renderer.domElement);
ctrls.enableDamping = true;

async function loadFbx() {
  const loader = new FBXLoader();
  const fbx = await loader.loadAsync("./assets/Treading-Water-astro.fbx");
  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.2,
    metalness: 1.0,
    flatShading: false,
  });
  fbx.position.set(0, -2.0, 0);
  fbx.traverse((c) => {
    if (c.isMesh) {
      c.material = mat;
    }
  });
  const mixer = new THREE.AnimationMixer(fbx);
  const update = (t) => {
    mixer.update(0.015);
  };
  const anim = fbx.animations[0];
  const action = mixer.clipAction(anim);
  action.play();
  fbx.userData = { action, mixer, update };
  return fbx;
}
const fbx = await loadFbx();
scene.add(fbx);

function getFirefly() {
  
  let hue = 0.6 + Math.random() * 0.2;
  if (Math.random() < 0.02) { hue = 0.25; } // a rare green one
  const color = new THREE.Color().setHSL(hue, 1, 0.5);
  // more performant than PointLight
  const light = new THREE.SpotLight(color, 2); 
  // light ball
  const geo = new THREE.IcosahedronGeometry(0.02, 2);
  const mat = new THREE.MeshBasicMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.add(light);

  function _getOrbitObj(mesh) {
    const orbitObj = new THREE.Object3D();
    const radius = 2.5;
    mesh.position.x = radius;
    orbitObj.rotation.x = THREE.MathUtils.degToRad(90);
    orbitObj.rotation.y = Math.random() * Math.PI * 2;
    orbitObj.add(mesh);
    const rate = Math.random() * 0.01 + 0.005;
    const offset = Math.floor(Math.random() * 6);
    let roteZ = 0
    function update() {
      roteZ += rate;
      orbitObj.rotation.z = roteZ + offset;
    }
    orbitObj.userData = { update };
    return orbitObj;
  }
  function _addGlow(mesh) {
    const glowMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.15
    });
    const glowMesh = new THREE.Mesh(geo, glowMat);
    glowMesh.scale.multiplyScalar(1.5);
    const glowMesh2 = new THREE.Mesh(geo, glowMat);
    glowMesh2.scale.multiplyScalar(2.5);
    const glowMesh3 = new THREE.Mesh(geo, glowMat);
    glowMesh3.scale.multiplyScalar(4);
    const glowMesh4 = new THREE.Mesh(geo, glowMat);
    glowMesh4.scale.multiplyScalar(6);
  
    mesh.add(glowMesh);
    mesh.add(glowMesh2);
    mesh.add(glowMesh3);
    mesh.add(glowMesh4);
  }
  const orbitObj = _getOrbitObj(mesh);
  _addGlow(mesh);
  
  return orbitObj;
}

const pLights = [];
let pLight;
for (let i = 0, numLights = 20; i < numLights; i += 1) {
  pLight = getFirefly();
  scene.add(pLight);
  pLights.push(pLight);
}

const bg = getBgSphere({ hue: 0.575, lightnessMult: 0.005 });
scene.add(bg);

function animate() {
  requestAnimationFrame(animate);
  pLights.forEach(l => l.userData.update());
  fbx.userData.update();
  renderer.render(scene, camera);
  ctrls.update();
}
animate();

function handleWindowResize() {
  w = window.innerWidth;
  h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);