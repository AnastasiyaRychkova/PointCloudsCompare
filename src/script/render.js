const canvasWidth  = 500;
const canvasHeight = 500;
let renderer;
let container;
let camera;
let scene;
let material;
let pMaterial;
let geometry;
let mesh;
let group;
let bRender = false;


let vertexShader = `

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 color;

varying vec3 v_color;

void main(){
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	gl_PointSize = 8.0;
	v_color = color;
}

`;


let fragmentShader = `
precision highp float;
varying vec3 v_color;

void main(){
	gl_FragColor = vec4( v_color, 255 );
}

`;


function init() {
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(canvasWidth, canvasHeight);
	container = document.getElementById('canvas');
	container.appendChild(renderer.domElement);

	// Камера
	camera = new THREE.PerspectiveCamera(35, canvasWidth / canvasHeight, 1, 1000);
	camera.position.z = 30;

	controls = new OrbitControls( camera, container );

	// Сцена
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xe7e7e7 );

	group = new THREE.Group();
	scene.add( group );

	/* material = new THREE.RawShaderMaterial({
		vertexShader: vertexShader,
		fragmentShader: fragmentShader
	});

	pMaterial = new THREE.PointsMaterial( {
		vertexColors: THREE.VertexColors,
		size: 3,
		blending: THREE.AdditiveBlending,
		transparent: true,
		sizeAttenuation: false
	} );

	geometry = new THREE.BufferGeometry();
	mesh = new THREE.Points( geometry, pMaterial );
	scene.add( mesh ); */
	bRender = true;
	animate();
	disableBtn( DOMInput.init );
	enableBtn( DOMInput.file1 );
}


function animate() {
	if( bRender ) {
		group.rotation.y += 0.001;
		renderer.render(scene, camera);
	}
	requestAnimationFrame(animate);
}

DOMInput.init.addEventListener( 'click', init );