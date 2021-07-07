( function( $, QUnit, sinon, wb ) {
	'use strict';

	QUnit.module( 'wikibase.queryService.ui.resultBrowser.helper.Options' );

	var Options = wb.queryService.ui.resultBrowser.helper.Options;

	QUnit.test( 'get', function( assert ) {
		var options = new Options( {
			test1: 'foo',
			test2: [ 'bar' ],
			/* test3 not defined */
			test4: undefined
		} );

		assert.strictEqual( options.get( 'test1', undefined ), 'foo' );
		assert.deepEqual( options.get( 'test2', [ 'foo' ] ), [ 'bar' ] );
		assert.strictEqual( options.get( 'test3', 42.0 ), 42.0 );
		assert.strictEqual( options.get( 'test4', 'value' ), undefined );

		assert.throws( function() { options.get( 'test1' ); } );
	} );

	QUnit.test( 'getArray', function( assert ) {
		var options = new Options( {
			test1: 'foo',
			test2: [ 'bar' ]
			/* test3 not defined */
		} );

		assert.deepEqual( options.getArray( 'test1', undefined ), [ 'foo' ] );
		assert.deepEqual( options.getArray( 'test2', undefined ), [ 'bar' ] );
		assert.deepEqual( options.getArray( 'test3', 'default' ), [ 'default' ] );

		assert.throws( function() { options.getArray( 'test1' ); } );
	} );

	QUnit.test( 'getColumnNames', function( assert ) {
		var options = new Options( {
			test1: '?foo',
			test2: [ '?bar', '?baz' ],
			/* test3 not defined */
			test4: 'reserved'
		} );

		assert.deepEqual( options.getColumnNames( 'test1', undefined ), [ 'foo' ] );
		assert.deepEqual( options.getColumnNames( 'test2', [ '?unused' ] ), [ 'bar', 'baz' ] );
		assert.deepEqual( options.getColumnNames( 'test3', [ '?default' ] ), [ 'default' ] );

		var realWarn = window.console.warn;
		window.console.warn = sinon.spy();
		assert.deepEqual( options.getColumnNames( 'test4', undefined ), [] );
		assert.ok( window.console.warn.calledOnce );
		window.console.warn = realWarn;

		assert.throws( function() { options.getColumnNames( 'test1' ); } );
	} );

}( jQuery, QUnit, sinon, wikibase ) );
