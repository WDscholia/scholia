if ( window.parent && document.location.hash ) {
	try {
		window.vguiData = JSON.parse( decodeURIComponent( location.hash.substr( 1 ) ) );
	} catch ( ex ) {
	}
}

