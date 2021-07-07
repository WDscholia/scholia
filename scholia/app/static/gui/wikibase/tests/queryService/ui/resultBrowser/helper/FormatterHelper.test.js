( function( QUnit, wb ) {
	'use strict';

	QUnit.module( 'wikibase.queryService.ui.resultBrowser.helper' );

	wb.queryService.ui.resultBrowser.helper.FormatterHelper.initMoment();

	var helper = new wb.queryService.ui.resultBrowser.helper.FormatterHelper();

	QUnit.test( 'Setup', function( assert ) {
		assert.expect( 1 );

		assert.ok( helper instanceof wb.queryService.ui.resultBrowser.helper.FormatterHelper );
	} );

	QUnit.test( 'parseDate', function( assert ) {
		var testCases = [
			[ '2016-12-31', '2016-12-31' ],
			[ '2016-12-31T00:00:00', '2016-12-31' ],

			// Testing the supported range
			[ '-1000000-12-31T00:00:00Z', 'Invalid date' ],
			[ '-271821-01-01T00:00:00Z', 'Invalid date' ],
			[ '-271820-01-01T00:00:00Z', '-271820-01-01' ],
			[ '-2016-12-31T00:00:00Z', '-2016-12-31' ],
			[ '-1-12-31T00:00:00Z', '-0001-12-31' ],
			[ '+0-00-00T00:00:00Z', 'Invalid date' ],
			[ '+1-12-31T00:00:00Z', '0001-12-31' ],
			[ '+2016-12-31T00:00:00Z', '2016-12-31' ],
			[ '+275760-01-01T00:00:00Z', '275760-01-01' ],
			[ '+275761-01-01T00:00:00Z', 'Invalid date' ],
			[ '+1000000-12-31T00:00:00Z', 'Invalid date' ]
		];

		assert.expect( testCases.length );

		testCases.forEach( function( testCase ) {
			var result = helper.parseDate( testCase[0] );
			assert.strictEqual( result.format( 'YYYY-MM-DD' ), testCase[1] );
		} );
	} );

	QUnit.test( '_formatDate', function( assert ) {
		var testCases = [
			[ '-1000000-12-31T00:00:00Z', '1000001 BCE' ],
			[ '-275760-01-01T00:00:00Z', '275761 BCE' ],
			[ '-275759-01-01T00:00:00Z', '1 January 275760 BCE' ],
			[ '-2016-12-31T00:00:00Z', '31 December 2017 BCE' ],
			[ '-2016-00-00T00:00:00Z', '2017 BCE' ],
			[ '-1-12-31T00:00:00Z', '31 December 0002 BCE' ],
			[ '0-00-00T00:00:00Z', '0001 BCE' ],
			[ '+0-00-00T00:00:00Z', '0001 BCE' ],
			[ '+000000-00-00T00:00:00Z', '0001 BCE' ],
			[ '+1-12-31T00:00:00Z', '31 December 0001' ],
			[ '+2016-00-00T00:00:00Z', '2016' ],
			[ '+2016-12-31T00:00:00Z', '31 December 2016' ],
			[ '+275760-01-01T00:00:00Z', '1 January 275760' ],
			[ '+275761-01-01T00:00:00Z', '275761' ],
			[ '+1000000-12-31T00:00:00Z', '1000000' ]
		];

		assert.expect( testCases.length );

		testCases.forEach( function( testCase ) {
			assert.strictEqual( helper._formatDate( testCase[0] ), testCase[1] );
		} );
	} );

	QUnit.test( 'abbreviateUri', function( assert ) {
		var namespaces = wb.queryService.RdfNamespaces.NAMESPACE_SHORTCUTS,
			testCases = [],
			groupName, group, prefixName, prefixUri;

		for ( groupName in namespaces ) {
			group = namespaces[ groupName ];
			for ( prefixName in group ) {
				prefixUri = group[ prefixName ];
				testCases.push( [ prefixUri, prefixName + ':' ] );
			}
		}

		assert.expect( testCases.length + 1 );

		assert.ok( testCases.length > 0, "should have at least one test case" );

		testCases.forEach( function( testCase ) {
			assert.strictEqual( helper.abbreviateUri( testCase[0] ), testCase[1] );
		} );
	} );

	QUnit.test( '_isHiddenField', function( assert ) {
		var Options = wb.queryService.ui.resultBrowser.helper.Options;

		helper.setOptions( new Options( {} ) );
		assert.strictEqual( helper._isHiddenField( 'foo' ), false );

		helper.setOptions( new Options( { hide: '?bar' } ) );
		assert.strictEqual( helper._isHiddenField( 'bar' ), true );

		helper.setOptions( new Options( { hide: [ '?bar', '?baz' ] } ) );
		assert.strictEqual( helper._isHiddenField( 'foo' ), false );
		assert.strictEqual( helper._isHiddenField( 'bar' ), true );
		assert.strictEqual( helper._isHiddenField( 'baz' ), true );

		helper.setOptions( new Options( {} ) );
	} );

}( QUnit, wikibase ) );
