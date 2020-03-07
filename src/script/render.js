let canvasWidth = 500;
let canvasHeight = 500;
let renderer;
let container;
let camera;
let scene;
let group;
let axesHelper;
let controls;


function init()
{
	// Создание canvas
	container = document.getElementById( 'canvas' );
	canvasWidth = container.clientWidth;
	canvasHeight = container.clientHeight;
	const menuWidth = window.innerWidth - canvasWidth;
	const menuHeight = window.innerHeight - canvasHeight;

	renderer = new THREE.WebGLRenderer(
	{
		antialias: true
	} );
	renderer.setSize( canvasWidth, canvasHeight ); // установить размеры canvas
	container.appendChild( renderer.domElement ); // добавить canvas на страницу

	// Камера
	camera = new THREE.PerspectiveCamera( 35, canvasWidth / canvasHeight, 1, 1000 );
	camera.position.z = 30;

	window.addEventListener( 'resize', onWindowResize, false );

	function onWindowResize()
	{
		canvasWidth = window.innerWidth - menuWidth;
		canvasHeight = window.innerHeight - menuHeight;
		camera.aspect = canvasWidth / canvasHeight; // изменение пропорций камеры
		camera.updateProjectionMatrix();
		renderer.setSize( canvasWidth, canvasHeight );
		render();
	}

	// Объект, выполняющий работу по перемещению камеры (вращение, приближение, отдаление)
	// Можно вращать мышкой и перемещать стрелками
	controls = new OrbitControls( camera, container );

	controls.addEventListener( 'change', render );

	// Сцена
	scene = new THREE.Scene();

	axesHelper = new THREE.AxesHelper( 5 );
	scene.add( axesHelper );

	// Цвет фона
	scene.background = new THREE.Color( 0xe7e7e7 );

	// Группировка объектов
	group = new THREE.Group();
	scene.add( group ); // добавить группу на сцену
	render();

	//	animate(); // запустить анимацию
	disableBtn( DOMInput.init ); // деактивировать кнопку Init
	enableBtn( DOMInput.clouds[ 0 ].file ); // активировать выбор первого файла
	enableBtn( DOMInput.clouds[ 1 ].file ); // активировать выбор второго файла
}

function render()
{
	renderer.render( scene, camera ); // отрендерить картинку
}


function animate()
{
	group.rotation.y += 0.001; // повернуть группу вокруг оси y
	render();
	requestAnimationFrame( animate ); // запланировать рендер следующего кадра
}

DOMInput.init.addEventListener( 'click', init ); // повесить выполнение функции init() на событие клика



function getGeometryFromArray( attr )
{
	if( attr.position === undefined )
		return undefined;

	const geometry = new THREE.BufferGeometry();

	geometry.setAttribute(
		'position',
		new THREE.BufferAttribute(
			attr.position instanceof Float32Array ? attr.position :
			new Float32Array( attr.position ),
			3
		)
	); // задать координаты точек ( geometry.attributes.position.array )

	if( attr.color !== undefined )
		geometry.setAttribute(
			'color',
			new THREE.BufferAttribute(
				attr.color instanceof Float32Array ? attr.color :
				new Float32Array( attr.color ),
				3
			)
		); // задать цвет точек

	return geometry;
}




class CloudComponent
{
	constructor()
	{
		this.parent = group;
		this.positions = undefined;
		this.geometry = undefined;
		this.material = undefined;
		this.mesh = undefined;
	}

	delete()
	{
		this.parent.remove( this.mesh );
		this.geometry.dispose();
		this.material.dispose();
		this.positions = undefined;
		this.geometry = undefined;
		this.material = undefined;
		this.mesh = undefined;
	}
}

let linesRef = undefined; // линии
