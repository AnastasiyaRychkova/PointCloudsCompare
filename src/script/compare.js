// Линии
class Lines
{
	// Проводит линии между двумя облаками
	constructor( cloud1, cloud2 ) {
		// Сделать cloud1 облаком с наибольшим количеством точек
		if( cloud1.positions.length < cloud2.positions.length )
			[ cloud1, cloud2 ] = [ cloud2, cloud1 ]; // swap
		const pointCount = cloud1.positions.length;
		this.positions = new Float32Array( pointCount * 2 ); // массив вершин
		this.colors = new Float32Array( pointCount * 2 ); // массив цветов вершин

		// Сравнить два облака, заполнив массив вершин и цветов
		this.compare( cloud1, cloud2 );

		// Материал линий
		this.material = new THREE.LineBasicMaterial( {
			vertexColors: THREE.VertexColors
		} );

		// Геометрия
		this.geometry = new THREE.BufferGeometry();

		// Линии проводятся между каждой парой вершин, заданных в массиве position
		this.geometry.setAttribute('position', new THREE.BufferAttribute( this.positions, 3 ) );
		this.geometry.setAttribute('color', new THREE.BufferAttribute( this.colors, 3 ) );

		// Создание объекта
		this.mesh = new THREE.LineSegments( this.geometry, this.material );
		group.add( this.mesh ); // добавление объекта на сцену
	};


	// Получить координаты сегментов линий, соединяя каждую точку из облака cloud1 с ближайшей точкой из облака cloud2
	compare( cloud1, cloud2 ) {
		const pointsN = Math.floor( cloud1.positions.length / 3 ); // количество точек в первом облаке
		const pointsN2 = Math.floor( cloud2.positions.length / 3 ); // количество точек в первом облаке

		if( pointsN === 0 || pointsN2 === 0 )
			return;

		const resCloudPos = []; // координаты точек результирующего облака
		const resCloudCol = []; // цвет точек результирующего облака
		let vertexPos = 0;
		let colorPos = 0;

		for( let i = 0; i < pointsN; i++ ) {

			const dx1 = cloud1.positions[ i * 3 ] - cloud2.positions[ 0 ];
			const dy1 = cloud1.positions[ i * 3 + 1 ] - cloud2.positions[ 1 ];
			const dz1 = cloud1.positions[ i * 3 + 2 ] - cloud2.positions[ 2 ];

			// Расстояние между ближайшими точками
			let minDist = Math.sqrt( dx1 * dx1 + dy1 * dy1 + dz1 * dz1 );
			let minPoint = 0; // Индекс ближайшей точки

			// Нахождение ближайшей точки
			for (let j = 1; j < pointsN2; j++) {
				const dx = cloud1.positions[ i * 3 ] - cloud2.positions[ j * 3 ];
				const dy = cloud1.positions[ i * 3 + 1 ] - cloud2.positions[ j * 3 + 1 ];
				const dz = cloud1.positions[ i * 3 + 2 ] - cloud2.positions[ j * 3 + 2 ];
				// Нахождение расстояния по т. Пифогора
				const dist = Math.sqrt( dx * dx + dy * dy + dz * dz );

				if( dist < minDist ) {
					minDist = dist;
					minPoint = j;
				}
			}

			console.log( cloud1.positions[ i * 3 ], cloud1.positions[ i * 3 + 1 ], cloud1.positions[ i * 3 + 2 ], ' --- ', cloud2.positions[ minPoint * 3 ], cloud2.positions[ minPoint * 3 + 1 ], cloud2.positions[ minPoint * 3 + 2 ] );

			// Запись найденных координат вершин сегмента
			this.positions[ vertexPos++ ] = cloud1.positions[ i * 3 ];
			this.positions[ vertexPos++ ] = cloud1.positions[ i * 3 + 1 ];
			this.positions[ vertexPos++ ] = cloud1.positions[ i * 3 + 2 ];
			
			this.positions[ vertexPos++ ] = cloud2.positions[ minPoint * 3 ];
			this.positions[ vertexPos++ ] = cloud2.positions[ minPoint * 3 + 1 ];
			this.positions[ vertexPos++ ] = cloud2.positions[ minPoint * 3 + 2 ];

			// Цвет концов сегмента
			this.colors[ colorPos++ ] = cloud1.colors[ i * 3 ];
			this.colors[ colorPos++ ] = cloud1.colors[ i * 3 + 1 ];
			this.colors[ colorPos++ ] = cloud1.colors[ i * 3 + 2 ];

			this.colors[ colorPos++ ] = cloud2.colors[ minPoint * 3 ];
			this.colors[ colorPos++ ] = cloud2.colors[ minPoint * 3 + 1 ];;
			this.colors[ colorPos++ ] = cloud2.colors[ minPoint * 3 + 2 ];;

			// Позиция серединной точки
			resCloudPos.push(
				( cloud1.positions[ i * 3 ] + cloud2.positions[ minPoint * 3 ] ) / 2,
				( cloud1.positions[ i * 3 + 1 ] + cloud2.positions[ minPoint * 3 + 1 ] ) / 2,
				( cloud1.positions[ i * 3 + 2 ] + cloud2.positions[ minPoint * 3 + 2 ] ) / 2
			);
			
			// Цвет серединной точки
			resCloudCol.push(
				1.0,
				1.0,
				1.0
			);

			clouds.push( new Cloud( resCloudPos, resCloudCol ) );
		}
	}
}

// Повесить выполнение функции на событие нажатия по кнопке Compare
DOMInput.compare.addEventListener( 'click', ( e ) => {
	lines.push( new Lines( clouds[0], clouds[1] ) );
	disableBtn( DOMInput.compare );
}, { 'once': true } );