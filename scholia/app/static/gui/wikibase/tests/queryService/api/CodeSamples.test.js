( function( $, QUnit, sinon, wb ) {
	'use strict';

	QUnit.module( 'wikibase.queryService.api.CodeSamples' );

	var CodeSamples = wb.queryService.api.CodeSamples;

	var tests = [
		{
			name: 'simple',
			endpoint: 'http://sparql.example/endpoint',
			root: 'http://sparql.example/',
			index: 'http://sparql.example/index.html'
		},
		{
			name: 'empty',
			endpoint: '',
			root: '/',
			index: '/'
		}
	];

	$.each( tests, function( index, test ) {
		QUnit.test( test.name, function( assert ) {
			var done = assert.async();

			function handleError( part ) {
				return function() {
					if ( location.protocol === 'file:' ) {
						window.console.error( 'Could not run code samples test because CORS is not available on file:// pages.' );
						window.console.error( 'To run this test, you must serve and access the tests over HTTP.' );
						assert.expect( 0 );
					} else {
						assert.ok( false, 'could not load ' + part );
					}
					done();
				};
			}

			$.get(
				'queryService/api/code-examples/' + test.name + '/query.sparql',
				function( query ) {
					new CodeSamples( test.endpoint, test.root, test.index )
						.getExamples( query )
						.then( function( examples ) {
							var promises = [];
							$.each( examples, function( lang, data ) {
								promises.push( $.get(
									'queryService/api/code-examples/' + test.name + '/' + lang + '.txt',
									function( expected ) {
										assert.strictEqual( data.code, expected );
									},
									'text'
								) );
							} );
							$.when.apply( $, promises )
								.then( done )
								.fail( handleError( 'expected code' ) );
						} ).fail( handleError( 'code samples' ) );
				},
				'text'
			).fail( handleError( 'query' ) );
		} );
	} );

}( jQuery, QUnit, sinon, wikibase ) );
