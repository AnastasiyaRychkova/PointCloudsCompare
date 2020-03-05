DOMInput.file0.addEventListener( 'change', fileInput );
DOMInput.file1.addEventListener( 'change', fileInput );

// Вершинный шейдер
let vertexShader = `

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 color;

varying vec3 v_color;

void main(){
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	gl_PointSize = 6.0;
	v_color = color;
}

`;

// Фрагментный шейдер
let fragmentShader = `
precision highp float;
varying vec3 v_color;

void main(){
	gl_FragColor = vec4( v_color, 1.0 );
}

`;

// Облако точек
class Cloud {
	constructor( pos, col ) {
		this.positions = new Float32Array( pos ); // массив позиций точек
		this.colors = new Float32Array( col ); // массив цветов точек

		// Материал точек
		this.material = new THREE.RawShaderMaterial( {
			vertexShader: vertexShader,
			fragmentShader: fragmentShader
		} );

		// Геометрия
		this.geometry = new THREE.BufferGeometry();

		this.geometry.setAttribute( 'position', new THREE.BufferAttribute( this.positions, 3 ) ); // задать координаты точек
		this.geometry.setAttribute( 'color', new THREE.BufferAttribute( this.colors, 3 ) ); // задать цвет точек

		this.mesh = new THREE.Points( this.geometry, this.material ); // создать объект с заданной геометрией и материалом
		group.add( this.mesh ); // добавить на сцену в группу
	};

	/**
	 * Функция возвращает распаршенную информацию из файла
	 * @param {string} type Расширение файла
	 * @param {string} input Содержимое файла
	 */
	static parse( type, input ) {
		const res = {
			'positions': [],
			'colors': []
		};

		switch ( type ) {
			case Cloud.prototype.TXT:
				Cloud.parseTXT( input, res );
				break;

			default:
				console.log( 'Error: Unknown text file type' );
				break;
		}
		return res;
	}

	/**
	 * Парсит TXT-файл
	 * @param {string} fileText Содержимое файла
	 * @param {object} res Объект в который будет записан результат
	 */
	static parseTXT( fileText, res = {
		'positions': [],
		'colors': []
	} ) {
		if( fileText ) {
			const rows = fileText.split( '\n' ); // разбить текст на строки
			console.log( 'ROWS FROM FILE', rows );

			for( const row of rows ) {
				const numbers = row.split( ' ' ); // разбить строку на числа
				if( numbers.length === 6 ) {
					for( let i = 0; i < 3; i++ ) // первые 3 числа записать как координаты
						res.positions.push( parseFloat( numbers[ i ] ) );
					for( let i = 3; i < 6; i++ ) // вторые 3 числа записать как цвет
						res.colors.push( parseFloat( numbers[ i ] ) );
				}
			}
		} else
			console.log( 'Error' );
		return res;
	}
}

Cloud.prototype.TXT = 32767;
Cloud.prototype.PLY = 32766;




/**
 * Прочитать данные из файла и распарсить их, тем самым подготовив к созданию облака
 * @param {event} e Событие нажатия на кнопку
 */
function fileInput( e ) {
	// Получить файл
	const file = e.target.files[ 0 ];
	if( file === undefined ) { // проверить, что файл был выбран
		console.log( 'Error: No file!' );
		return;
	}

	const reader = new FileReader();

	reader.readAsText( file ); // получить содержимое файла
	reader.onload = () => {
		const fNum = parseInt( e.target.id.slice( -1 ) );
		if( !( fNum >= 0 && fNum < 2 ) )
			return;
		if( clouds[ fNum ] === undefined ) {
			// Распарсить файл, передав его расширение и содержимое
			const res = Cloud.parse(
				Cloud.prototype[ file.name.match( /.+\.(\w+)$/ )[ 1 ].toUpperCase() ],
				reader.result
			);
			if( res === undefined ) // если не получилось прочесть содержимое, то выйти
				return;
			disableBtn( DOMInput[ 'file' + fNum ] );
			enableBtn( DOMInput[ 'update' + fNum ] );


			// Повесить выполнение функции на событие нажатия по кнопке Render
			DOMInput[ 'update' + fNum ].addEventListener( 'click', ( e ) => {
				// Создать облако точек
				clouds[ fNum ] = new Cloud( res.positions, res.colors );
				// Активировать/деактивировать очередные кнопки
				if( clouds[ 0 ] !== undefined && clouds[ 1 ] !== undefined )
					enableBtn( DOMInput.compare );
				else
					enableBtn( DOMInput.file1 );
				disableBtn( DOMInput[ 'update' + fNum ] );
			}, {
				'once': true
			} );

		} else
			console.log( 'Error: Trying to reload first cloud' );
	}
	reader.onerror = ( error ) => {
		console.error( error );
	}
}