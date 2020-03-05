const DOMInput = {
	'init': document.getElementById( 'init' ),
	'update0': document.getElementById( 'update0' ),
	'update1': document.getElementById( 'update1' ),
	'centerOfMass0': document.getElementById( 'com0' ),
	'centerOfMass1': document.getElementById( 'com1' ),
	'compare': document.getElementById( 'compare' ),
	'file0': document.getElementById( 'file0' ),
	'file1': document.getElementById( 'file1' ),
	'range': document.getElementById( 'range' ),
	'rangeLabel': document.getElementById( 'rs-label' )
}

// Деактивировать кнопку
function disableBtn( obj ) {
	if( !obj.hasAttribute( 'disabled' ) )
		obj.setAttribute( 'disabled', 'disabled' );
}

// Активировать кнопку
function enableBtn( obj ) {
	if( obj.hasAttribute( 'disabled' ) )
		obj.removeAttribute( 'disabled' );
}

const clouds = []; // облака
const lines = []; // линии