DOMInput.clouds[ 0 ].file.addEventListener( 'change', fileInput );
DOMInput.clouds[ 1 ].file.addEventListener( 'change', fileInput );


// Облако точек
class Cloud extends CloudComponent {
	constructor( geometry, cParent = undefined, pSize = 6.0 ) {
		super();
		this.positions = geometry.attributes.position.array; // массив позиций точек
		this.colors = geometry.attributes.color.array; // массив цветов точек

		// Материал точек
		this.material = new THREE.PointsMaterial( {
			vertexColors: THREE.VertexColors,
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
	};

	static showCenterOfMass( cloud, pSize = 12.0, pColor = [ 0.5, 0.5, 0.5 ] ) {
		if( !cloud instanceof Cloud )
			return;

		const centerOfMass = [ 3 ];

		let xSum = 0;
		let ySum = 0;
		let zSum = 0;

		let i = 0;
		while( i < cloud.positions.length ) {
			xSum += cloud.positions[ i++ ];
			ySum += cloud.positions[ i++ ];
			zSum += cloud.positions[ i++ ];
		}

		centerOfMass[ 0 ] = xSum / cloud.positions.length;
		centerOfMass[ 1 ] = ySum / cloud.positions.length;
		centerOfMass[ 2 ] = zSum / cloud.positions.length;

		cloud.center = new Cloud(
			getGeometryFromArray( {
				'position': centerOfMass,
				'color': pColor
			} ),
			cloud.parent,
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

	const reader = new FileReader();

	reader.readAsText( file ); // получить содержимое файла
	reader.onload = () => {
		const fNum = parseInt( e.target.id.slice( -1 ) );
		if( !( fNum >= 0 && fNum < 2 ) )
			return;

		enableBtn( DOMInput.clouds[ fNum ].update );
		disableBtn( DOMInput.clouds[ fNum ].centerOfMass );



		// Повесить выполнение функции на событие нажатия по кнопке Render
		DOMInput.clouds[ fNum ].update.addEventListener( 'click', ( e ) => {
			disableBtn( DOMInput.compare );
			if( Cloud.inst[ fNum ] !== undefined ) {
				if( Cloud.inst[ 2 ] !== undefined ) {
					Cloud.inst[ 2 ].delete(); // удаление промежуточных точек
					linesRef.delete(); // удаление соединительных линий
				}
				Cloud.inst[ fNum ].delete();
			}



			// Распарсить файл, передав его расширение и содержимое
			const res = Cloud.parse(
				Cloud[ file.name.match( /.+\.(\w+)$/ )[ 1 ].toUpperCase() ],
				reader.result
			);
			if( res === undefined ) // если не получилось прочесть содержимое, то выйти
				return;

			const cloudGroup = new THREE.Group();
			group.add( cloudGroup );
			// Создать облако точек
			Cloud.inst[ fNum ] = new Cloud( res, cloudGroup );
			// Активировать/деактивировать очередные кнопки
			if( Cloud.inst[ 0 ] !== undefined && Cloud.inst[ 1 ] !== undefined )
				enableBtn( DOMInput.compare );
			disableBtn( DOMInput.clouds[ fNum ].update );
			enableBtn( DOMInput.clouds[ fNum ].centerOfMass );



			DOMInput.clouds[ fNum ].centerOfMass.addEventListener( 'click', ( e ) => {
				Cloud.showCenterOfMass( Cloud.inst[ fNum ], 8 );
				disableBtn( DOMInput.clouds[ fNum ].centerOfMass );
			}, {
				'once': true
			} )

		}, {
			'once': true
		} );
	}
	reader.onerror = ( error ) => {
		console.error( error );
	}
}