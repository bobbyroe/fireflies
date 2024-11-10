import * as THREE from "three";
import { GLTFLoader } from "jsm/loaders/GLTFLoader.js";
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

const loader = new GLTFLoader();

function initScene(glb) {
  // glb.scale.setScalar(1.5);
  // glb.position.y = 1;
  scene.add(glb);

  function getPointLight(color) {

    const light = new THREE.SpotLight(color, 1);
    // light ball
    const geo = new THREE.IcosahedronGeometry(0.02, 2);
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.add(light);

    const circle = new THREE.Object3D();
    const radius = 2.5;
    mesh.position.x = radius;
    circle.rotation.x = THREE.MathUtils.degToRad(90);
    circle.rotation.y = Math.random() * Math.PI * 2;
    circle.add(mesh);

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

    const rate = Math.random() * 0.01 + 0.005;
    function update() {
      circle.rotation.z += rate;
    }

    return {
      obj: circle,
      update,
    };
  }

  const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x0099FF];
  const pLights = [];
  let pLight;
  for (let i = 0; i < colors.length; i += 1) {
    pLight = getPointLight(colors[i]);
    scene.add(pLight.obj);
    pLights.push(pLight);
  }

  const bg = getBgSphere();
  scene.add(bg);

  function animate() {
    requestAnimationFrame(animate);
    pLights.forEach(l => l.update());
    glb.rotation.y += 0.005;
    renderer.render(scene, camera);
    ctrls.update();
  }
  animate();
}

loader.load("./assets/Astronaut.glb", (gltf) => {
  const mat = new THREE.MeshPhysicalMaterial({
    // color: 0x00ff00,
    roughness: 0,
    metalness: 1, 
    // transmission: 1
  });

  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      // child.scale.setScalar(0.05); 
      // child.material = mat;
      // child.material.metalness = 1;
      child.geometry.center();
    }
  });
  initScene(gltf.scene);
});

function handleWindowResize() {
  w = window.innerWidth;
  h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);