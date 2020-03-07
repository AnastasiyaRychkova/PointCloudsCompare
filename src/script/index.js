const DOMInput = {
	'init': document.getElementById( 'init' ),
	'clouds': [
	{
		'file': document.getElementById( 'file0' ),
		'update': document.getElementById( 'update0' ),
		'centerOfMass': document.getElementById( 'com0' ),
		'toCenter': document.getElementById( 'to00' ),
	},
	{
		'file': document.getElementById( 'file1' ),
		'update': document.getElementById( 'update1' ),
		'centerOfMass': document.getElementById( 'com1' ),
		'toCenter': document.getElementById( 'to01' ),
	} ],
	'compare': document.getElementById( 'compare' ),
	'range': document.getElementById( 'range' ),
	'rangeLabel': document.getElementById( 'rs-label' )
}

// Деактивировать кнопку
function disableBtn( obj )
{
	if( !obj.hasAttribute( 'disabled' ) )
		obj.setAttribute( 'disabled', 'disabled' );
}

// Активировать кнопку
function enableBtn( obj )
{
	if( obj.hasAttribute( 'disabled' ) )
		obj.removeAttribute( 'disabled' );
}
