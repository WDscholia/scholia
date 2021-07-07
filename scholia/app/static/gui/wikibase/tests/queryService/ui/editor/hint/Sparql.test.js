( function( $, QUnit, sinon, wb ) {
	'use strict';

	QUnit.module( 'wikibase.queryService.ui.editor.hint.Sparql' );
	var Sparql = wb.queryService.ui.editor.hint.Sparql;

	var VALID_SCENARIOS = [
		{ scenario:'New variable', content:'?a', line:'?a', y:1, x:2,
		  result: {'from':{'char':0,'line':1},'to':{'char':2,'line':1},'list':['?a']}},

		{ scenario:'Existing variable with the same first characters', content:'?a ?aa ?a', line:'?a ?aa ?a', y:1, x:9,
		  result: {'from':{'char':7,'line':1},'to':{'char':9,'line':1},'list':['?a', '?aa']}},

		{ scenario:'Existing variable with the same first characters (non-ASCII version)', content:'?a ?aé ?a', line:'?a ?aé ?a', y:1, x:9,
		  result: {'from':{'char':7,'line':1},'to':{'char':9,'line':1},'list':['?a', '?aé']}},

	];

	QUnit.test( 'is constructable', function( assert ) {
		assert.expect( 1 );
		assert.ok( new Sparql() instanceof Sparql );
	} );

	QUnit.test( 'When there is nothing to autocomplete', function( assert ) {
		assert.expect( 1 );
		var done = assert.async();

		var sparql = new Sparql();
		sparql.getHint('XXX', 'XXX', 1, 3).then(
			function( hint ) {
				assert.notOk( true, 'Hinting should not succeed');
			},
			function() {
				assert.ok( true, 'Hinting must fail' );
			}
		).always( done );
	} );

	$.each( VALID_SCENARIOS, function( key, test) {

		QUnit.test( 'When running valid scenario: ' + this.scenario, function( assert ) {
			assert.expect( 1 );
			var done = assert.async();

			var sparql = new Sparql();
			sparql.getHint( test.content, test.line, test.y, test.x ).done( function( hint ) {
				assert.deepEqual( hint, test.result , 'Hint must return valid hint');
			} ).always( done );
		} );
	} );
}( jQuery, QUnit, sinon, wikibase ) );
