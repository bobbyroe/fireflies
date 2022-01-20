import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/OBJLoader.js";
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
console.log(`THREE REVISION: %c${THREE.REVISION}`, "color: #FFFF00");

let w = window.innerWidth;
let h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.set(0, 1, 2.5);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
const loader = new OBJLoader();

function initScene(geo) {
  // loaded geometry
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true,
    // wireframe: true,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  function getPointLight (color) {

    const light = new THREE.PointLight( color, 1, 2.0);

    // light ball
    const geo = new THREE.IcosahedronGeometry(0.01, 0);
    const mat = new THREE.MeshBasicMaterial({color});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.add(light);

    const circle = new THREE.Object3D();
    circle.position.y = 1;
    const radius = 1.25;
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
    function update () {
      circle.rotation.z += rate;
    }

    return {
      obj: circle,
      update,
    };
  }

  // const sunlight = new THREE.DirectionalLight(0xffffff);
  // sunlight.position.x = -1;
  // sunlight.position.y = 2;
  // scene.add(sunlight);

  // const bounceLight = new THREE.DirectionalLight(0x99aaaa);
  // bounceLight.position.x = 1;
  // bounceLight.position.y = -2;
  // scene.add(bounceLight);

  const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x0099FF];
  const pLights = [];
  let pLight;
  for (let i = 0; i < colors.length; i += 1) {
    pLight = getPointLight(colors[i]);
    scene.add(pLight.obj);
    pLights.push(pLight);
  }

  function animate() {
    requestAnimationFrame(animate);
    pLights.forEach( l => l.update());
    mesh.rotation.y += 0.005;
    renderer.render(scene, camera);
  }
  animate();
}

loader.load("./assets/hand.obj", (obj) => {
  const { geometry } = obj.children[0];
  initScene(geometry);
});

function handleWindowResize () {
  w = window.innerWidth;
  h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);