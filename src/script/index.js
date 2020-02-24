export const DOMInput = {
	'init': document.getElementById( 'init' ),
	'update': document.getElementById( 'update' ),
	'compare': document.getElementById( 'compare' ),
	'file1': document.getElementById( 'file1' ),
	'file2': document.getElementById( 'file2' )
}

export function disableBtn( obj ) {
	if( !obj.hasAttribute( 'disabled' ) )
		obj.setAttribute( 'disabled', 'disabled' );
}

export function enableBtn( obj ) {
	if( obj.hasAttribute( 'disabled' ) )
		obj.removeAttribute( 'disabled' );
}

export const clouds = [];
export const lines = [];