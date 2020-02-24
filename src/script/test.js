import * as THREE from '../../build/three.module.js'

let canvasWidth  = 500;
let canvasHeight = 500;
let renderer;
let container;
let camera;
let scene;
let group;
let lMaterial, lGeometry, lMesh;

document.getElementById( 'init' ).addEventListener( 'click', (e) => {
	console.log( THREE );
	container = document.getElementById('canvas');
	canvasWidth = container.clientWidth;
	canvasHeight = container.clientHeight
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( canvasWidth, canvasHeight );
	container.appendChild( renderer.domElement );

	// Камера
	camera = new THREE.PerspectiveCamera(35, canvasWidth / canvasHeight, 1, 1000);
	camera.position.z = 30;

	// Сцена
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xe7e7e7 );

	group = new THREE.Group();
	scene.add( group );
	renderer.render(scene, camera);

	lMaterial = new THREE.LineBasicMaterial( {
		vertexColors: THREE.VertexColors,
		blending: THREE.AdditiveBlending,
		transparent: true
	} );

	lGeometry = new THREE.BufferGeometry();

	lGeometry.setAttribute('position', new THREE.BufferAttribute( new Float32Array( [ 0, 0, 0, 6, 6, 6 ] ), 3 ) );
	lGeometry.setAttribute('color', new THREE.BufferAttribute( new Float32Array( [ 1, 0.5, 0.5, 1, 0.5, 0.5 ] ), 3 ) );

	lMesh = new THREE.LineSegments( lGeometry, lMaterial );
	group.add( lMesh );
	renderer.render(scene, camera);
})