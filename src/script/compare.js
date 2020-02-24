class Lines
{
	constructor( cloud1, cloud2 ) {
		if( cloud1.positions.length < cloud2.positions.length )
			[ cloud1, cloud2 ] = [ cloud2, cloud1 ]; // swap
		const pointCount = cloud1.positions.length;
		this.positions = new Float32Array( pointCount );
		this.colors = new Float32Array( pointCount );

		this.compare( cloud1, cloud2 );

		this.material = THREE.LineBasicMaterial( {
			vertexColors: THREE.VertexColors,
			blending: THREE.AdditiveBlending,
			transparent: true
		} );

		this.geometry = new THREE.BufferGeometry();

		this.geometry.setAttribute('position', new THREE.BufferAttribute( new Float32Array( this.positions ), 3 ) );
		this.geometry.setAttribute('color', new THREE.BufferAttribute( new Float32Array( this.colors ), 3 ) );

		this.mesh = new THREE.LineSegments( geometry, material );
		group.add( this.mesh );
	};

	compare( cloud1, cloud2 ) {
		const pointsN = Math.floor( cloud1.positions.length / 3 );
		const pointsN2 = Math.floor( cloud2.positions.length / 3 );

		if( pointsN === 0 || pointsN2 === 0 )
			return;

		const resCloudPos = [];
		const resCloudCol = [];
		let vertexPos = 0;
		let colorPos = 0;

		for( let i = 0; i < pointsN; i++ ) {

			const dx1 = cloud1.positions[ i * 3 ] - cloud2.positions[ 0 ];
			const dy1 = cloud1.positions[ i * 3 + 1 ] - cloud2.positions[ 1 ];
			const dz1 = cloud1.positions[ i * 3 + 2 ] - cloud2.positions[ 2 ];

			let minDist = Math.sqrt( dx1 * dx1 + dy1 * dy1 + dz1 * dz1 );
			let minPoint = 0;

			// Нахождение ближайшей точки
			for (let j = 1; j < pointsN2; j++) {
				const dx = cloud1.positions[ i * 3 ] - cloud2.positions[ j * 3 ];
				const dy = cloud1.positions[ i * 3 + 1 ] - cloud2.positions[ j * 3 + 1 ];
				const dz = cloud1.positions[ i * 3 + 2 ] - cloud2.positions[ j * 3 + 2 ];
				const dist = Math.sqrt( dx * dx + dy * dy + dz * dz );

				if( dist < minDist ) {
					minDist = dist;
					minPoint = j;
				}
			}

			// Вершины сегмента

			this.positions[ vertexPos++ ] = cloud1.positions[ i * 3 ];
			this.positions[ vertexPos++ ] = cloud1.positions[ i * 3 + 1 ];
			this.positions[ vertexPos++ ] = cloud1.positions[ i * 3 + 2 ];

			this.positions[ vertexPos++ ] = cloud2.positions[ minPoint * 3 ];
			this.positions[ vertexPos++ ] = cloud2.positions[ minPoint * 3 + 1 ];
			this.positions[ vertexPos++ ] = cloud2.positions[ minPoint * 3 + 2 ];

			// Цвет концов сегмента
			this.positions[ colorPos++ ] = cloud1.colors[ i * 3 ];
			this.positions[ colorPos++ ] = cloud1.colors[ i * 3 + 1 ];
			this.positions[ colorPos++ ] = cloud1.colors[ i * 3 + 2 ];

			this.positions[ colorPos++ ] = cloud2.colors[ minPoint * 3 ];
			this.positions[ colorPos++ ] = cloud2.colors[ minPoint * 3 + 1 ];
			this.positions[ colorPos++ ] = cloud2.colors[ minPoint * 3 + 2 ];

			// Позиция серединной точки
			resCloudPos.push(
				( cloud1.positions[ i * 3 ] + cloud2.positions[ minPoint * 3 ] ) / 2,
				( cloud1.positions[ i * 3 + 1 ] + cloud2.positions[ minPoint * 3 + 1 ] ) / 2,
				( cloud1.positions[ i * 3 + 2 ] + cloud2.positions[ minPoint * 3 + 2 ] ) / 2
			);
			
			// Цвет серединной точки
			resCloudCol.push(
				0.5,
				0.5,
				0.5
			);

			clouds.push( new Cloud( resCloudPos, resCloudCol ) );
		}
	}
}


/* DOMInput.compare.addEventListener( 'click', ( e ) => {
	lines.push( new Lines( clouds[0], clouds[1] ) );
}, { 'once': true } ); */

let lMaterial, lGeometry, lMesh;

DOMInput.compare.addEventListener( 'click', ( e ) => {
	
	lMaterial = THREE.LineBasicMaterial( {
		vertexColors: THREE.VertexColors,
		blending: THREE.AdditiveBlending,
		transparent: true
	} );

	lGeometry = new THREE.BufferGeometry();

	lGeometry.setAttribute('position', new THREE.BufferAttribute( new Float32Array( [ 0, 0, 0, 6, 6, 6 ] ), 3 ) );
	lGeometry.setAttribute('color', new THREE.BufferAttribute( new Float32Array( [ 1, 1, 1, 1, 1, 1 ] ), 3 ) );

	lMesh = new THREE.LineSegments( lGeometry, lMaterial );
	group.add( lMesh );

}, { 'once': true } );