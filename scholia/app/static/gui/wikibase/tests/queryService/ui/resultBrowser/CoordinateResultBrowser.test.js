( function( $, QUnit, sinon, wb ) {
	'use strict';

	QUnit.module( 'wikibase.queryService.ui.resultBrowser' );
	var crb = new wb.queryService.ui.resultBrowser.CoordinateResultBrowser();

	QUnit.test( '_splitWktLiteral internal helper function', function( assert ) {
		assert.expect( 2 );

		assert.deepEqual(
			crb._splitWktLiteral( '<http://www.wikidata.org/entity/Q2> Point(1 2)' ),
			{ crs: 'http://www.wikidata.org/entity/Q2', wkt: 'Point(1 2)' },
			'_splitWktLiteral should split crs and wkt correctly'
		);

		assert.deepEqual(
			crb._splitWktLiteral( 'Point(1 2)' ),
			{ crs: 'http://www.opengis.net/def/crs/OGC/1.3/CRS84', wkt: 'Point(1 2)' },
			'_splitWktLiteral without explicit reference system should use standard default value'
		);
	} );

	QUnit.test( '_extractGeoJsonWktLiteral internal helper function', function( assert ) {
		var testCases = [
			[
				'<http://www.wikidata.org/entity/Q2> Point(1 2)',
				{ "type": "Point", "coordinates": [ 1, 2 ] },
				'should extract Wikidata terrestrial coordinate values'
			],
			[
				'<http://www.wikidata.org/entity/Q405> Point(1 2)',
				null,
				'should not extract Wikidata lunar coordinate values'
			],
			[
				'Point(1 2)',
				{ "type": "Point", "coordinates": [ 1, 2 ] },
				'should extract coordinate values without explicit reference system'
			],
			[
				'Linestring(1 2,3 4)',
				{ "type": "LineString", "coordinates": [ [ 1, 2 ], [ 3, 4 ] ] },
				'should extract non-point literals'
			]
		];
		assert.expect( testCases.length );

		testCases.forEach( function( testCase ) {
			var done = assert.async();
			var result = crb._extractGeoJsonWktLiteral( testCase[0] );
			var message = '_extractGeoJsonWktLiteral ' + testCase[2];
			if ( result === null ) {
				assert.strictEqual( result, testCase[1], message );
				done();
			} else {
				result.done( function( result ) {
					assert.deepEqual( result, testCase[1], message );
					done();
				} );
			}
		} );
	} );

}( jQuery, QUnit, sinon, wikibase ) );
