DOMInput.clouds[ 0 ].file.addEventListener( 'change', fileInput );
DOMInput.clouds[ 1 ].file.addEventListener( 'change', fileInput );


// Облако точек
class Cloud extends CloudComponent {
	constructor( geometry, cParent = undefined, pSize = 4.0 ) {
		super();
		console.log( geometry );
		this.positions = geometry.attributes.position.array; // массив позиций точек
		this.colors = geometry.attributes.color ? geometry.attributes.color.array : undefined; // массив цветов точек

		// Материал точек
		this.material = new THREE.PointsMaterial( {
			vertexColors: THREE.VertexColors,
			color: 0xeaeaea,
			size: pSize,
			sizeAttenuation: false
		} );

		// Геометрия
		this.geometry = geometry;

		this.mesh = new THREE.Points( this.geometry, this.material ); // создать объект с заданной геометрией и материалом

		if( cParent !== undefined )
			this.parent = cParent;

		this.parent.add( this.mesh ); // добавить на сцену в группу

		this.center = undefined;
		render();
	};

	showCenterOfMass( pSize = 12.0, pColor = [ 0.5, 0.5, 0.5 ] ) {
		const centerOfMass = [ 3 ];

		let xSum = 0;
		let ySum = 0;
		let zSum = 0;

		let i = 0;
		while( i < this.positions.length ) {
			xSum += this.positions[ i++ ];
			ySum += this.positions[ i++ ];
			zSum += this.positions[ i++ ];
		}

		console.log( xSum, this.positions.length );
		console.log( ySum, this.positions.length );
		console.log( zSum, this.positions.length );

		const n = this.positions.length / 3;

		centerOfMass[ 0 ] = xSum / n;
		centerOfMass[ 1 ] = ySum / n;
		centerOfMass[ 2 ] = zSum / n;

		this.center = new Cloud(
			getGeometryFromArray( {
				'position': centerOfMass,
				'color': pColor
			} ),
			this.parent,
			pSize
		);
	}

	delete() {
		super.delete();

		if( this.center !== undefined )
			this.center.delete();

		const i = Cloud.inst.indexOf( this );
		if( i >= 0 )
			Cloud.inst[ i ] = undefined;
	}

	/**
	 * Функция возвращает распаршенную информацию из файла
	 * @param {string} type Расширение файла
	 * @param {string} input Содержимое файла
	 * @returns {BufferGeometry}
	 */
	static parse( type, input ) {
		switch ( type ) {
			case Cloud.TXT:
				const res = Cloud.parseTXT( input );

				return getGeometryFromArray( {
					'position': res.positions,
					'color': res.colors
				} );

			default:
				console.log( 'Error: Unknown text file type' );
				return undefined;
		}
	}

	/**
	 * Парсит TXT-файл
	 * @param {string} fileText Содержимое файла
	 * @param {object} res Объект в который будет записан результат
	 */
	static parseTXT( fileText ) {
		const res = {
			'positions': [],
			'colors': []
		};
		if( fileText ) {
			const rows = fileText.split( '\n' ); // разбить текст на строки
			console.log( 'ROWS FROM FILE', rows );

			for( const row of rows ) {
				const numbers = row.split( ' ' ); // разбить строку на числа
				if( numbers.length === 6 ) {
					for( let i = 0; i < 3; i++ ) { // первые 3 числа записать как координаты
						const n = parseFloat( numbers[ i ] );
						if( n === NaN )
							n = 0.0;
						res.positions.push( n );
					}
					for( let i = 3; i < 6; i++ ) { // вторые 3 числа записать как цвет
						const c = parseFloat( numbers[ i ] );
						if( c === NaN )
							c = 0.0;
						else if( c < 0 )
							c = 0.0;
						else if( c > 1 )
							c = 1.0;
						res.colors.push( c );
					}
				}
			}
		} else {
			console.log( 'Error' );
			return undefined;
		}

		if( res.positions.length === 0 )
			return undefined;

		return getGeometryFromArray( {
			'position': res.positions,
			'color': res.colors
		} );
	}


}

Cloud.TXT = 32767;
Cloud.PLY = 32766;
Cloud.inst = [];





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

	const fNum = parseInt( e.target.id.slice( -1 ) );
	if( !( fNum >= 0 && fNum < 2 ) )
		return;

	enableBtn( DOMInput.clouds[ fNum ].update );
	disableBtn( DOMInput.clouds[ fNum ].centerOfMass );



	// Повесить выполнение функции на событие нажатия по кнопке Render
	DOMInput.clouds[ fNum ].update.addEventListener( 'click', async ( e ) => {
		const type = file.name.match( /.+\.(\w+)$/ )[ 1 ].toLowerCase();
		console.log( type );
		let fileText;
		let geometry;

		const readAsTextPromise = ( inputFile ) => {
			const reader = new FileReader();

			return new Promise( ( resolve, reject ) => {
				reader.onerror = () => {
					reader.abort();
					reject( new DOMException( "Problem reading input file." ) );
				};

				reader.onload = () => {
					resolve( reader.result );
				};
				reader.readAsText( inputFile );
			} );
		};

		try {
			fileText = await readAsTextPromise( file );
		} catch ( error ) {
			console.error( error );
			return;
		}

		switch ( type ) {
			case 'txt':
				geometry = Cloud.parseTXT( fileText );
				break;
			case 'ply':
				const loader = new THREE.PLYLoader();
				loader.setPropertyNameMapping( {
					diffuse_red: 'red',
					diffuse_green: 'green',
					diffuse_blue: 'blue'
				} );
				geometry = loader.parse( fileText );
				break;
			default:
				console.error( new DOMException( "Problem reading input file." ) );
				return;
		}

		if( geometry === undefined ) // если не получилось прочесть содержимое, то выйти
			return;

		disableBtn( DOMInput.compare );
		if( Cloud.inst[ fNum ] !== undefined ) {
			if( Cloud.inst[ 2 ] !== undefined ) {
				Cloud.inst[ 2 ].delete(); // удаление промежуточных точек
				linesRef.delete(); // удаление соединительных линий
			}
			Cloud.inst[ fNum ].delete();
		}

		const cloudGroup = new THREE.Group();
		group.add( cloudGroup );
		// Создать облако точек
		Cloud.inst[ fNum ] = new Cloud( geometry, cloudGroup );
		// Активировать/деактивировать очередные кнопки
		if( Cloud.inst[ 0 ] !== undefined && Cloud.inst[ 1 ] !== undefined )
			enableBtn( DOMInput.compare );
		disableBtn( DOMInput.clouds[ fNum ].update );
		enableBtn( DOMInput.clouds[ fNum ].centerOfMass );



		DOMInput.clouds[ fNum ].centerOfMass.addEventListener( 'click', ( e ) => {
			const cloud = Cloud.inst[ fNum ]
			if( cloud !== undefined )
				cloud.showCenterOfMass( 8 );
			controls.target = new THREE.Vector3(
				cloud.center.positions[0],
				cloud.center.positions[1],
				cloud.center.positions[2] );
			controls.update();
			render();
		} )

	}, {
		'once': true
	} );
}