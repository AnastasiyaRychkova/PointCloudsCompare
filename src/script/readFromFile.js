DOMInput.clouds[ 0 ].file.addEventListener( 'change', fileInput );
DOMInput.clouds[ 1 ].file.addEventListener( 'change', fileInput );


// Облако точек
class Cloud extends CloudComponent
{
	constructor( geometry, cParent = undefined, pSize = 4.0 )
	{
		super();
		this.positions = geometry.attributes.position.array; // массив позиций точек
		this.colors = geometry.attributes.color ? geometry.attributes.color.array : undefined; // массив цветов точек
		console.log( geometry );

		// Материал точек
		// Цвет точек будет определен атрибутом color в geometry,
		// но если атрибут не установлен, то цвета color (0xeaeaea)
		this.material = new THREE.PointsMaterial(
		{
			vertexColors: THREE.VertexColors,
			color: 0xeaeaea,
			size: pSize,
			sizeAttenuation: false
		} );

		// Геометрия
		this.geometry = geometry;

		this.mesh = new THREE.Points( this.geometry, this.material ); // создать объект с заданной геометрией и материалом

		// Group | Scene
		if( cParent !== undefined )
			this.parent = cParent;

		this.parent.add( this.mesh ); // добавить на сцену в группу

		this.center = undefined;
		render();
	};

	/**
	 * Вычислить и отобразить центр масс
	 */
	showCenterOfMass( pSize = 12.0, pColor = [ 0.5, 0.5, 0.5 ] )
	{
		const centerOfMass = [ 3 ]; // координаты

		// Xm = sum(xi) / n, i∈[0, n)
		let xSum = 0;
		let ySum = 0;
		let zSum = 0;

		let i = 0;
		while( i < this.positions.length )
		{
			xSum += this.positions[ i++ ];
			ySum += this.positions[ i++ ];
			zSum += this.positions[ i++ ];
		}

		const n = this.positions.length / 3;

		centerOfMass[ 0 ] = xSum / n;
		centerOfMass[ 1 ] = ySum / n;
		centerOfMass[ 2 ] = zSum / n;

		// Центр масс – это облако, состоящее из одной точки
		this.center = new Cloud(
			getGeometryFromArray(
			{
				'position': centerOfMass,
				'color': pColor
			} ),
			this.parent,
			pSize
		);
	}

	/** Удаление облака */
	delete()
	{
		super.delete();

		if( this.center !== undefined )
			this.center.delete();

		const i = Cloud.inst.indexOf( this );
		if( i >= 0 )
			Cloud.inst[ i ] = undefined;
	}

	/**
	 * Переместить объект в указанную точку (смещается центр масс).
	 * Можно вызывать только при наличии вычисленного центра масс
	 */
	moveTo( x, y, z )
	{
		if( this.center === undefined )
			return;
		// Вычисление вектора смещения
		const dx = x - this.center.positions[ 0 ];
		const dy = y - this.center.positions[ 1 ];
		const dz = z - this.center.positions[ 2 ];
		
		this.center.geometry.translate( dx, dy, dz );
		this.geometry.translate( dx, dy, dz );
		render();
	}

	/**
	 * Функция возвращает распаршенную информацию из файла
	 * @param {string} type Расширение файла
	 * @param {string} input Содержимое файла
	 * @returns {BufferGeometry}
	 */
	static parse( type, input )
	{
		switch ( type )
		{
			case Cloud.TXT:
				const res = Cloud.parseTXT( input );

				return getGeometryFromArray(
				{
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
	static parseTXT( fileText )
	{
		const res = {
			'positions': [],
			'colors': []
		};
		if( fileText )
		{
			const rows = fileText.split( '\n' ); // разбить текст на строки
			console.log( 'ROWS FROM FILE', rows );

			for( const row of rows )
			{
				const numbers = row.split( ' ' ); // разбить строку на числа
				if( numbers.length === 6 )
				{
					for( let i = 0; i < 3; i++ )
					{ // первые 3 числа записать как координаты
						const n = parseFloat( numbers[ i ] );
						if( n === NaN )
							n = 0.0;
						res.positions.push( n );
					}
					for( let i = 3; i < 6; i++ )
					{ // вторые 3 числа записать как цвет
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
		}
		else
		{
			console.log( 'Error' );
			return undefined;
		}

		if( res.positions.length === 0 )
			return undefined;

		return getGeometryFromArray(
		{
			'position': res.positions,
			'color': res.colors
		} );
	}


}

Cloud.inst = [];





/**
 * Прочитать данные из файла и распарсить их, тем самым подготовив к созданию облака
 * @param {event} e Событие нажатия на кнопку
 */
function fileInput( e )
{
	// Получить файл
	const file = e.target.files[ 0 ];
	if( file === undefined )
	{ // Проверить, что файл был выбран
		console.log( 'Error: No file!' );
		return;
	}

	// Определить индекс input[file] по последней цифре в id
	const fNum = parseInt( e.target.id.slice( -1 ) );
	if( !( fNum >= 0 && fNum < 2 ) )
		return;

	enableBtn( DOMInput.clouds[ fNum ].update );
	disableBtn( DOMInput.clouds[ fNum ].centerOfMass );


	/*  --- RENDER ---  */
	// Повесить выполнение функции на событие нажатия по кнопке Render
	DOMInput.clouds[ fNum ].update.addEventListener( 'click', async ( e ) =>
	{
		// Расширение файла
		const type = file.name.match( /.+\.(\w+)$/ )[ 1 ].toLowerCase();
		console.log( type );
		let fileText; // содержимое текста
		let geometry; // геометрия считанного облака

		// Обертка для асинхронной функции readAsText() для возвращения промиса
		const readAsTextPromise = ( inputFile ) =>
		{
			const reader = new FileReader();

			return new Promise( ( resolve, reject ) =>
			{
				reader.onerror = () =>
				{
					reader.abort();
					reject( new DOMException( "Problem reading input file." ) );
				};

				reader.onload = () =>
				{
					resolve( reader.result );
				};

				reader.readAsText( inputFile );
			} );
		};

		try
		{
			fileText = await readAsTextPromise( file ); // получить содержимое файла
		}
		catch ( error )
		{
			console.error( error );
			return;
		}

		// Использовать парсер согласно типу файла
		switch ( type )
		{
			case 'txt':
				geometry = Cloud.parseTXT( fileText );
				break;
			case 'ply':
				const loader = new THREE.PLYLoader();

				/* PLYLoader понимает параметры вершины:
					* x 
					* y
					* z ____координаты
					* nx
					* ny
					* nz ___нормаль
					* red
					* green
					* blue __цвет вершины

				 Данная функция переопределяет нестандартные названия
				 */
				loader.setPropertyNameMapping(
				{
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

		/* Если облако с таким номером раннее было создано,
		то необходимое его удалить, а также нужно удалить линии и промежуточные точки,
		если таковые имеются
		 */
		if( Cloud.inst[ fNum ] !== undefined )
		{
			if( Cloud.inst[ 2 ] !== undefined )
			{
				Cloud.inst[ 2 ].delete(); // удаление промежуточных точек
				linesRef.delete(); // удаление соединительных линий
			}
			Cloud.inst[ fNum ].delete();
		}

		// const cloudGroup = new THREE.Group(); // для группировки облака и его центра
		// group.add( cloudGroup );

		// Создать облако точек
		Cloud.inst[ fNum ] = new Cloud( geometry, group );
		// Активировать/деактивировать очередные кнопки
		if( Cloud.inst[ 0 ] !== undefined && Cloud.inst[ 1 ] !== undefined )
			enableBtn( DOMInput.compare );
		disableBtn( DOMInput.clouds[ fNum ].update );
		enableBtn( DOMInput.clouds[ fNum ].centerOfMass );


		/* --- CENTER OF MASS --- */
		/* Отобразить центр масс, если он еще не был установлен,
		перевести направление камеры на центр масс объекта, если он уже есть на сцене */
		DOMInput.clouds[ fNum ].centerOfMass.addEventListener( 'click', ( e ) =>
		{
			const cloud = Cloud.inst[ fNum ];
			if( cloud.center === undefined ) // если центр еще не определен
			{
				cloud.showCenterOfMass( 8 ); // показать точку размером 8 у.е.

				enableBtn( DOMInput.clouds[ fNum ].toCenter );


				/* --- TO CENTER --- */
				/* Переместить облако в центр системы координат */
				DOMInput.clouds[ fNum ].toCenter.addEventListener( 'click', ( e ) =>
				{
					// Если раннее облако сравнивалось с другим,
					// то надо удалить линии и промежуточные точки
					if( Cloud.inst[ 2 ] )
					{
						Cloud.inst[ 2 ].delete();
						linesRef.delete();
					}
					Cloud.inst[ fNum ].moveTo( 0, 0, 0 ); // переместить облако
					disableBtn( DOMInput.clouds[ fNum ].toCenter );
				},
				{
					'once': true
				} );
			}
			else
			{
				// Если центр масс уже вычислен, то повторное нажатие на кнопку 
				// переместит таргет камеры в данную точку.
				// Это позволит камере вращаться вокруг центра масс облака
				controls.target = new THREE.Vector3(
					cloud.center.positions[ 0 ],
					cloud.center.positions[ 1 ],
					cloud.center.positions[ 2 ] );
				controls.update();
				render();
			}
		} );

	},
	{
		'once': true
	} );
}
