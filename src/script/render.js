import * as THREE from '../../build/three.module.js';
import { OrbitControls } from '../../lib/OrbitControls.js';
import {DOMInput, disableBtn, enableBtn } from './index.js';

let canvasWidth  = 500;
let canvasHeight = 500;
let renderer;
let container;
let camera;
let scene;
let group;
let controls;


function init() {
	container = document.getElementById('canvas');
	canvasWidth = container.clientWidth;
	canvasHeight = container.clientHeight
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( canvasWidth, canvasHeight );
	container.appendChild( renderer.domElement );

	// Камера
	camera = new THREE.PerspectiveCamera(35, canvasWidth / canvasHeight, 1, 1000);
	camera.position.z = 30;

	controls = new OrbitControls( camera, container );

	// Сцена
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xe7e7e7 );

	group = new THREE.Group();
	scene.add( group );

	animate();
	disableBtn( DOMInput.init );
	enableBtn( DOMInput.file1 );
}


function animate() {
	group.rotation.y += 0.001;
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

DOMInput.init.addEventListener( 'click', init );

export { group };