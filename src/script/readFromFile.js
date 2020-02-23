let fileText;

document.getElementById( 'file' ).addEventListener( 'change', fileInput );
document.getElementById( 'update' ).addEventListener( 'click', UpdateFromFile );

function fileInput( e ) {
	const file = e.target.files[0];
	const reader = new FileReader();

	reader.readAsText( file );
	reader.onload = () => {
		fileText = reader.result;
		const updateBtn = document.getElementById( 'update' );
		if( updateBtn.hasAttribute( 'disabled' ) )
			updateBtn.removeAttribute( 'disabled' );
		console.log( reader.result );
	}
	reader.onerror = ( error ) => {
		console.error( error );
	}
	
}

function UpdateFromFile( e ) {
	if( fileText ) {
		const rows = fileText.split( '\n' );
		console.log( rows );
		const coord = [];
		const colors = [];

		for (const row of rows) {
			const numbers = row.split( ' ' );
			if( numbers.length === 6 ) {
				for( let i = 0; i < 3; i++ )
					coord.push( parseFloat( numbers[i] ) );
				for( let i = 3; i < 6; i++ )
					colors.push( parseFloat( numbers[i] ) );
			}
		}

		geometry.setAttribute('position', new THREE.BufferAttribute( new Float32Array( coord ), 3 ) );
		geometry.setAttribute('color', new THREE.BufferAttribute( new Float32Array( colors ), 3 ) );
	}
	else
		console.log( 'Error' );
}