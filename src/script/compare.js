import * as THREE from '../../build/three.module.js';
import { DOMInput, clouds, lines, disableBtn } from './index.js';
import { group } from './render.js';
import Cloud from './readFromFile.js';

class Lines
{
	constructor( cloud1, cloud2 ) {
		if( cloud1.positions.length < cloud2.positions.length )
			[ cloud1, cloud2 ] = [ cloud2, cloud1 ]; // swap
		const pointCount = cloud1.positions.length;
		this.positions = new Float32Array( pointCount * 2 );
		this.colors = new Float32Array( pointCount * 2 );

		this.compare( cloud1, cloud2 );

		this.material = new THREE.LineBasicMaterial( {
			vertexColors: THREE.VertexColors
		} );

		this.geometry = new THREE.BufferGeometry();

		this.geometry.setAttribute('position', new THREE.BufferAttribute( this.positions, 3 ) );
		this.geometry.setAttribute('color', new THREE.BufferAttribute( this.colors, 3 ) );

		this.mesh = new THREE.LineSegments( this.geometry, this.material );
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

			console.log( cloud1.positions[ i * 3 ], cloud1.positions[ i * 3 + 1 ], cloud1.positions[ i * 3 + 2 ], ' --- ', cloud2.positions[ minPoint * 3 ], cloud2.positions[ minPoint * 3 + 1 ], cloud2.positions[ minPoint * 3 + 2 ] );

			// Вершины сегмента

			this.positions[ vertexPos++ ] = cloud1.positions[ i * 3 ];
			this.positions[ vertexPos++ ] = cloud1.positions[ i * 3 + 1 ];
			this.positions[ vertexPos++ ] = cloud1.positions[ i * 3 + 2 ];

			this.positions[ vertexPos++ ] = cloud2.positions[ minPoint * 3 ];
			this.positions[ vertexPos++ ] = cloud2.positions[ minPoint * 3 + 1 ];
			this.positions[ vertexPos++ ] = cloud2.positions[ minPoint * 3 + 2 ];

			// Цвет концов сегмента
			this.colors[ colorPos++ ] = cloud1.colors[ i * 3 ];
			this.colors[ colorPos++ ] = cloud1.colors[ i * 3 + 1 ];
			this.colors[ colorPos++ ] = cloud1.colors[ i * 3 + 2 ]

			this.colors[ colorPos++ ] = 1.0;
			this.colors[ colorPos++ ] = 1.0;
			this.colors[ colorPos++ ] = 1.0;

			// Позиция серединной точки
			resCloudPos.push(
				( cloud1.positions[ i * 3 ] + cloud2.positions[ minPoint * 3 ] ) / 2,
				( cloud1.positions[ i * 3 + 1 ] + cloud2.positions[ minPoint * 3 + 1 ] ) / 2,
				( cloud1.positions[ i * 3 + 2 ] + cloud2.positions[ minPoint * 3 + 2 ] ) / 2
			);
			
			// Цвет серединной точки
			resCloudCol.push(
				0.66,
				0.93,
				0.31
			);

			clouds.push( new Cloud( resCloudPos, resCloudCol ) );
		}
	}
}


DOMInput.compare.addEventListener( 'click', ( e ) => {
	lines.push( new Lines( clouds[0], clouds[1] ) );
	disableBtn( DOMInput.compare );
}, { 'once': true } );