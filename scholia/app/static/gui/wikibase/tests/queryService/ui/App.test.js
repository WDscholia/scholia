( function( $, QUnit, sinon, download ) {
	'use strict';

	QUnit.module( 'wikibase.queryService.ui.App' );

	QUnit.test( 'DownloadJS works with utf-8 ', function( assert ) {

		var stub = sinon.stub( window.document.body, 'appendChild' ),
			data = '{ "foo": "testöäüРоссийская中华人民共和国😀🤩𝄞😈" }',
			filename = 'file.json',
			mimetype =  'application/json;charset=utf-8',
			done = assert.async();

		stub.callsFake( function ( a ) {
			var url = $( a ).attr( 'href' ),
				xhr = new XMLHttpRequest();

		    xhr.open( 'GET', url, false );
		    xhr.send();
		    URL.revokeObjectURL( url );

			assert.strictEqual( data, xhr.responseText, 'original data and blob data should be the same' );
			stub.restore();
			window.document.body.appendChild( a );
			done();
		} );

		download( data, filename, mimetype );
	} );

}( jQuery, QUnit, sinon, download ) );
