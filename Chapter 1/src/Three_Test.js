import * as THREE from "three";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";





var width = window.innerWidth;
var height = window.innerHeight;
window.addEventListener('resize', () => {
    // update display width and height
    width = window.innerWidth
    height = window.innerHeight
    // update camera aspect
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    // update renderer
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.render(scene, camera)
});

// Scene
const scene = new THREE.Scene();

scene.background = new THREE.Color('#00bfff');
// Camera
const fov = 45; // AKA Field of View
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1; // the near clipping plane
const far = 100; // the far clipping plane
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 3,10);
// Renderer
const renderer = new THREE.WebGLRenderer({antialias:false});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

// Creating a cube
const geometry = new THREE.BoxGeometry(3, 3, 3);
const material = new THREE.MeshPhongMaterial({ 
    
    color:"#6700ff"
});
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
// scene.add(cube);

//Ground
const groundGeo = new THREE.PlaneGeometry(10000,10000);
const groundMat = new THREE.MeshLambertMaterial({
    color:0xffffff
});
const groundMesh = new THREE.Mesh(groundGeo,groundMat);
groundMesh.position.set(0,-3,0);
groundMesh.rotation.set(Math.PI/-2,0,0)
groundMesh.receiveShadow = true;
scene.add(groundMesh);
//add some lights to the scene
const ambLight = new THREE.AmbientLight(0xffffff,1);
const dirLight = new THREE.DirectionalLight(0xffffff,1);
dirLight.intensity = 2;
dirLight.castShadow = true;
dirLight.position.set(0,2,3);
scene.add(dirLight);
// scene.add(ambLight);

// Rendering the scene
const container = document.getElementById('container');


const orbitcontrols = new OrbitControls(camera,container);
orbitcontrols.enableZoom = true;
const loader = new GLTFLoader();

loader.load('../skeleton_pre-cut/scene.gltf',function(gltf){
    gltf.scene.traverse((child)=>{
        if(child.isMesh){
            child.castShadow = true;
            child.receiveShadow = true;
            child.rotation.x += 0.01;  
        }
    })
    scene.add(gltf.scene);
},function (xhr) {
    console.log((xhr.loaded/xhr.total*100)+'% loaded');

},function(error){
    console.error(error);
}
);
function animate(){
    
    container.appendChild(renderer.domElement);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

