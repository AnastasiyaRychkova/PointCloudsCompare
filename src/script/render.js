let canvasWidth  = 500;
let canvasHeight = 500;
let renderer;
let container;
let camera;
let scene;
let group;
let controls;


function init() {
	// Создание canvas
	container = document.getElementById('canvas');
	canvasWidth = container.clientWidth;
	canvasHeight = container.clientHeight
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( canvasWidth, canvasHeight ); // установить размеры canvas
	container.appendChild( renderer.domElement ); // добавить canvas на страницу

	// Камера
	camera = new THREE.PerspectiveCamera(35, canvasWidth / canvasHeight, 1, 1000);
	camera.position.z = 30;

	// Объект, выполняющий работу по перемещению камеры (вращение, приближение, отдаление)
	// Можно вращать мышкой и перемещать стрелками
	controls = new OrbitControls( camera, container );

	// Сцена
	scene = new THREE.Scene();

	// Цвет фона
	scene.background = new THREE.Color( 0xe7e7e7 );

	// Группировка объектов
	group = new THREE.Group();
	scene.add( group ); // добавить группу на сцену

	animate(); // запустить анимацию
	disableBtn( DOMInput.init ); // деактивировать кнопку Init
	enableBtn( DOMInput.file0 ); // активировать выбор первого файла
}


function animate() {
	group.rotation.y += 0.001; // повернуть группу вокруг оси y
	renderer.render(scene, camera); // отрендерить картинку
	requestAnimationFrame(animate); // запланировать рендер следующего кадра
}

DOMInput.init.addEventListener( 'click', init ); // повесить выполнение функции init() на событие клика