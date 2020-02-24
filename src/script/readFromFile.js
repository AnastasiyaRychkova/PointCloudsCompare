import * as THREE from '../../build/three.module.js';
import { DOMInput, disableBtn, enableBtn, clouds } from './index.js';
import { group } from './render.js';

DOMInput.file1.addEventListener( 'change', fileInput );
DOMInput.file2.addEventListener( 'change', fileInput );


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


let fragmentShader = `
precision highp float;
varying vec3 v_color;

void main(){
	gl_FragColor = vec4( v_color, 255 );
}

`;


export default class Cloud
{
	constructor( pos, col ) {
		this.positions = new Float32Array( pos );
		this.colors = new Float32Array( col );


		this.material = new THREE.RawShaderMaterial({
			vertexShader: vertexShader,
			fragmentShader: fragmentShader
		});

		this.geometry = new THREE.BufferGeometry();

		this.geometry.setAttribute('position', new THREE.BufferAttribute( this.positions, 3 ) );
		this.geometry.setAttribute('color', new THREE.BufferAttribute( this.colors, 3 ) );

		this.mesh = new THREE.Points( this.geometry, this.material );
		group.add( this.mesh );
	};

	static parse( type, input ) {
		const res = {
			'positions': [],
			'colors': []
		};

		console.log( type, Cloud.prototype.TXT );
		switch( type ) {
			case Cloud.prototype.TXT:
				Cloud.parseTXT( input, res );
				break;
		
			default:
				console.log( 'Error: Unknown text file type' );
				break;
		}
		return res;
	}

	static parseTXT( fileText, res = { 'positions': [], 'colors': [] } ) {
		if( fileText ) {
			const rows = fileText.split( '\n' );
			console.log( 'ROWS FROM FILE', rows );

			for( const row of rows ) {
				const numbers = row.split( ' ' );
				if( numbers.length === 6 ) {
					for( let i = 0; i < 3; i++ )
						res.positions.push( parseFloat( numbers[i] ) );
					for( let i = 3; i < 6; i++ )
						res.colors.push( parseFloat( numbers[i] ) );
				}
			}
		}
		else
			console.log( 'Error' );
		return res;
	}
}

Cloud.prototype.TXT = 32767;
Cloud.prototype.ARRAY = 32766;





function fileInput( e ) {
	const file = e.target.files[0];
	if( file === undefined ) {
		console.log( 'Error: No file!' );
		return;
	}
	console.log( file.name.match( /.+\.(\w+)$/ )[1].toUpperCase() );
	const reader = new FileReader();

	reader.readAsText( file );
	reader.onload = () => {
		const fNum = parseInt( e.target.id.slice( -1 ) ); // расширение файла
		if( !( fNum > 0 && fNum <= 2 ) )
			return;
		if( clouds[fNum] === undefined ) {
			const res = Cloud.parse(
				Cloud.prototype[file.name.match( /.+\.(\w+)$/ )[1].toUpperCase()],
				reader.result
			);
			if( res === undefined )
				return;
			disableBtn( DOMInput[ 'file' + fNum ] );
			enableBtn( DOMInput.update );


			DOMInput.update.addEventListener( 'click', ( e ) => {
				clouds[fNum - 1] = new Cloud( res.positions, res.colors );
				if( clouds[0] !== undefined && clouds[1] !== undefined )
					enableBtn( DOMInput.compare );
				else
					enableBtn( DOMInput.file2 );
				disableBtn( DOMInput.update );
			}, {'once': true} );
			
		}
		else
			console.log( 'Error: Trying to reload first cloud' );
	}
	reader.onerror = ( error ) => {
		console.error( error );
	}
	
}