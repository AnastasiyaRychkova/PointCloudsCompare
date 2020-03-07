// Линии
class Lines extends CloudComponent
{
	// Проводит линии между двумя облаками
	constructor( cloud1, cloud2 )
	{
		super();
		// Сделать cloud1 облаком с наибольшим количеством точек
		/* if( cloud1.positions.length < cloud2.positions.length )
			[ cloud1, cloud2 ] = [ cloud2, cloud1 ]; // swap */
		const pointCount = Math.floor( cloud1.positions.length / 3 );
		this.positions = new Float32Array( pointCount * 3 * 2 ); // массив вершин
		this.colors = new Float32Array( pointCount * 3 * 2 ); // массив цветов вершин

		this.minD = 0; // минимальное найденное расстояние между точками
		this.maxD = 0; // максимальное найденное расстояние между точками
		this.segmentLen = []; // длинны сегментов
		this.pointInterpolation = parseInt( DOMInput.range.value ); // количество промежуточных точек
		// Сравнить два облака, заполнив массив вершин и цветов
		this.compare( cloud1, cloud2 );

		// Материал линий
		this.material = new THREE.LineBasicMaterial(
		{
			vertexColors: THREE.VertexColors
		} );

		// Геометрия
		// Линии проводятся между каждой парой вершин, заданных в массиве position
		this.geometry = getGeometryFromArray(
		{
			'position': this.positions,
			'color': this.colors
		} );

		// Создание объекта
		this.mesh = new THREE.LineSegments( this.geometry, this.material );
		this.parent.add( this.mesh ); // добавление объекта на сцену
		render();
	};

	delete()
	{
		super.delete();
		linesRef = undefined;
	}


	/** Получить координаты сегментов линий, соединяя каждую точку из облака cloud1 с ближайшей точкой из облака cloud2 */
	compare( cloud1, cloud2 )
	{
		const pointsN = Math.floor( cloud1.positions.length / 3 ); // количество точек в первом облаке
		const pointsN2 = Math.floor( cloud2.positions.length / 3 ); // количество точек в первом облаке

		if( pointsN === 0 || pointsN2 === 0 )
			return;

		{
			const dx1 = cloud1.positions[ 0 ] - cloud2.positions[ 0 ];
			const dy1 = cloud1.positions[ 1 ] - cloud2.positions[ 1 ];
			const dz1 = cloud1.positions[ 2 ] - cloud2.positions[ 2 ];

			// Расстояние между ближайшими точками
			this.minD = Math.sqrt( dx1 * dx1 + dy1 * dy1 + dz1 * dz1 );
		}

		const resCloudPos = []; // координаты точек результирующего облака
		const resCloudCol = []; // цвет точек результирующего облака

		let colorPos = 0;

		// заполнение массива this.positions координатами вершин сегментов
		this.vertexPositionCalculation( cloud1, cloud2, resCloudPos );


		const colorLen = ( this.maxD - this.minD ) / 3; // длина сегмента отвечающая за 1 цвет

		// Назначение цвета для сегментов и промежуточных точек
		for( let i = 0; i < pointsN; i++ )
		{

			// Определение цвета для i-го сегмента с длиной this.segmentLen[ i ]
			let segmentColor = colorLen ? Math.floor( ( this.segmentLen[ i ] - this.minD ) / colorLen ) : 0;
			if( segmentColor === 3 ) // проверка на выход за пределы массива
				segmentColor--;

			// Сохранение цвета концов сегмента
			this.colors[ colorPos++ ] = Lines.heatmapColor[ segmentColor ][ 0 ];
			this.colors[ colorPos++ ] = Lines.heatmapColor[ segmentColor ][ 1 ];
			this.colors[ colorPos++ ] = Lines.heatmapColor[ segmentColor ][ 2 ];
			this.colors[ colorPos++ ] = Lines.heatmapColor[ segmentColor ][ 0 ];
			this.colors[ colorPos++ ] = Lines.heatmapColor[ segmentColor ][ 1 ];
			this.colors[ colorPos++ ] = Lines.heatmapColor[ segmentColor ][ 2 ];

			// Сохранение цвета промежуточных точек
			for( let pointIndex = 1; pointIndex <= this.pointInterpolation; pointIndex++ )
			{
				resCloudCol.push(
					Lines.heatmapColor[ segmentColor ][ 0 ],
					Lines.heatmapColor[ segmentColor ][ 1 ],
					Lines.heatmapColor[ segmentColor ][ 2 ]
				);
			}
		}

		// Создать промежуточное облако и поместить на сцену
		Cloud.inst[ 2 ] = new Cloud( getGeometryFromArray(
		{
			'position': resCloudPos,
			'color': resCloudCol
		} ) );

	}

	vertexPositionCalculation( cloud1, cloud2, resCloudPos )
	{
		const pointsN = Math.floor( cloud1.positions.length / 3 ); // количество точек в первом облаке
		const pointsN2 = Math.floor( cloud2.positions.length / 3 ); // количество точек в первом облаке
		let vertexPos = 0;

		// заполнение массива this.positions координатами вершин сегментов
		for( let i = 0; i < pointsN; i++ )
		{

			const dx1 = cloud1.positions[ i * 3 ] - cloud2.positions[ 0 ];
			const dy1 = cloud1.positions[ i * 3 + 1 ] - cloud2.positions[ 1 ];
			const dz1 = cloud1.positions[ i * 3 + 2 ] - cloud2.positions[ 2 ];

			// Расстояние между ближайшими точками
			let minDist = Math.sqrt( dx1 * dx1 + dy1 * dy1 + dz1 * dz1 );
			let minPoint = 0; // Индекс ближайшей точки

			// Нахождение ближайшей точки
			for( let j = 1; j < pointsN2; j++ )
			{
				const dx = cloud1.positions[ i * 3 ] - cloud2.positions[ j * 3 ];
				const dy = cloud1.positions[ i * 3 + 1 ] - cloud2.positions[ j * 3 + 1 ];
				const dz = cloud1.positions[ i * 3 + 2 ] - cloud2.positions[ j * 3 + 2 ];
				// Нахождение расстояния по т. Пифогора
				const dist = Math.sqrt( dx * dx + dy * dy + dz * dz );

				if( dist < minDist )
				{
					minDist = dist;
					minPoint = j;
				}
			}

			// Запоминание расстояние для текущего сегмента с целью в дальнейшем использовать эту информацию при назначении цвета сегменту и промежуточным точкам
			this.segmentLen[ i ] = minDist;

			// Проверка, является ли найденное расстояние минимальным/максимальным среди прочих
			this.minD = minDist < this.minD ? minDist : this.minD;
			this.maxD = minDist > this.maxD ? minDist : this.maxD;

			// Запись найденных координат вершин сегмента
			this.positions[ vertexPos++ ] = cloud1.positions[ i * 3 ];
			this.positions[ vertexPos++ ] = cloud1.positions[ i * 3 + 1 ];
			this.positions[ vertexPos++ ] = cloud1.positions[ i * 3 + 2 ];

			this.positions[ vertexPos++ ] = cloud2.positions[ minPoint * 3 ];
			this.positions[ vertexPos++ ] = cloud2.positions[ minPoint * 3 + 1 ];
			this.positions[ vertexPos++ ] = cloud2.positions[ minPoint * 3 + 2 ];

			/** Запись координат промежуточных точек,
			где this.pointInterpolation – заданное пользователем количество
			X1(i) - ( X1(i) - X2(i)) / ( n - 1 ) * i, i∈[1,n]
			*/
			for( let pointIndex = 1; pointIndex <= this.pointInterpolation; pointIndex++ )
			{
				resCloudPos.push(
					cloud1.positions[ i * 3 ] - ( cloud1.positions[ i * 3 ] - cloud2.positions[ minPoint * 3 ] ) / ( this.pointInterpolation + 1 ) * pointIndex,
					cloud1.positions[ i * 3 + 1 ] - ( cloud1.positions[ i * 3 + 1 ] - cloud2.positions[ minPoint * 3 + 1 ] ) / ( this.pointInterpolation + 1 ) * pointIndex,
					cloud1.positions[ i * 3 + 2 ] - ( cloud1.positions[ i * 3 + 2 ] - cloud2.positions[ minPoint * 3 + 2 ] ) / ( this.pointInterpolation + 1 ) * pointIndex
				);
			}
		}
	}


	divide()
	{
		if( Cloud.inst[ 2 ] !== undefined )
			Cloud.inst[ 2 ].delete();
		const pos = [];
		const col = [];
		const n = Math.floor( this.positions.length / 6 ); // количество сегментов

		for( let i = 0; i < n; i++ )
		{
			const i0 = i * 6;
			const color = {
				'r': this.colors[ i0 ],
				'g': this.colors[ i0 + 1 ],
				'b': this.colors[ i0 + 2 ]
			};

			for( let pointIndex = 1; pointIndex <= this.pointInterpolation; pointIndex++ )
			{
				/* Запись координат промежуточных точек */
				pos.push(
					this.positions[ i0 ] - ( this.positions[ i0 ] - this.positions[ i0 + 3 ] ) / ( this.pointInterpolation + 1 ) * pointIndex,
					this.positions[ i0 + 1 ] - ( this.positions[ i0 + 1 ] - this.positions[ i0 + 4 ] ) / ( this.pointInterpolation + 1 ) * pointIndex,
					this.positions[ i0 + 2 ] - ( this.positions[ i0 + 2 ] - this.positions[ i0 + 5 ] ) / ( this.pointInterpolation + 1 ) * pointIndex
				);
				col.push(
					color.r,
					color.g,
					color.b
				);
			}

		}

		// Создать промежуточное облако и поместить на сцену
		Cloud.inst[ 2 ] = new Cloud( getGeometryFromArray(
		{
			'position': pos,
			'color': col
		} ) );

	}
}

LinesRef = Lines;

// Повесить выполнение функции на событие нажатия по кнопке Compare
DOMInput.compare.addEventListener( 'click', ( e ) =>
{
	if( linesRef === undefined )
	{
		linesRef = new Lines( Cloud.inst[ 0 ], Cloud.inst[ 1 ] );
		return;
	}
	linesRef.divide();
} );



Lines.heatmapColor = [ // Значения цветов для тепловой карты
	[ 1.0, 0.61, 0.0 ], // red
	[ 0.49, 0.67, 0.0 ], // green
	[ 0.04, 0.55, 0.65 ] // blue
];


// Изменение положения надписи у trackbar
DOMInput.range.addEventListener( 'input', ( e ) =>
{
	if( linesRef !== undefined )
		linesRef.pointInterpolation = parseInt( e.target.value );
	DOMInput.rangeLabel.textContent = e.target.value;
	DOMInput.rangeLabel.style.left = ( ( e.target.value - 1 ) / ( e.target.max - 1 ) * 130 ) + 'px';
} );
