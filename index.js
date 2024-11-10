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

const loader = new FBXLoader();

function initScene(fbx) {
  // glb.scale.setScalar(1.5);
  // glb.position.y = 1;
  scene.add(fbx);

  function getFirefly() {

    const hue = 0.6 + Math.random() * 0.2;
    const color = new THREE.Color().setHSL(hue, 1, 0.5);
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

  const pLights = [];
  let pLight;
  for (let i = 0, numLights = 20; i < numLights; i += 1) {
    pLight = getFirefly();
    scene.add(pLight.obj);
    pLights.push(pLight);
  }

  const bg = getBgSphere({ hue: 0.8 });
  scene.add(bg);

  // fbx.userData.action.reset();
  fbx.userData.action.play();

  function animate() {
    requestAnimationFrame(animate);
    pLights.forEach(l => l.update());
    fbx?.userData.update();
    renderer.render(scene, camera);
    ctrls.update();
  }
  animate();
}

loader.load("./assets/Treading-Water.fbx", (fbx) => {
  fbx.scale.setScalar(0.02);
  fbx.position.set(0, -1.5, 0);
  fbx.traverse((c) => {
    if (c.isMesh) {
      if (c.material.name === "Alpha_Body_MAT") {
        c.material.shininess = 100;
      }
    }
  });
  const mixer = new THREE.AnimationMixer(fbx);
  const update = (t) => {
    mixer.update(0.015);
  };
  const anim = fbx.animations[0];
  const action = mixer.clipAction(anim);
  console.log(action);
  fbx.userData = { action, mixer, update };
  initScene(fbx);
});

function handleWindowResize() {
  w = window.innerWidth;
  h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);