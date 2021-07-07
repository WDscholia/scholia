( function( $, QUnit, sinon, wb ) {
	'use strict';

	QUnit.module( 'wikibase.queryService.ui.editor.hint.Rdf' );
	var Rdf = wb.queryService.ui.editor.hint.Rdf;

	var HINT_UNKNOWN_PREFIX = {'list':[{'text':'','displayText':'Unknown prefix \'XXX:\''}],'from':{'line':1,'char':4},'to':{'line':1,'char':5}};
	var HINT_START_SEARCH = { 'from' : {	'char' : 7,	'line' : 1	},	'list' : [ {'displayText' : 'Type to search for an entity',	'text' : ''	} ],'to' : {'char' : 8,	'line' : 1}};

	var VALID_SCENARIOS = [
            { scenario:'PREFIX0:TERM', prefix:'PREFIX0', content:'PREFIX0:TERM', line:'PREFIX0:TERM', y:1, x:8,
            	result: {'from':{'char':8,'line':1},'list':[{'className':'wikibase-rdf-hint','displayText':'LABEL (ID) DESCRIPTION\n','text':'ID'}],'to':{'char':12,'line':1}}},

            { scenario:'PREFIX1:TERM',prefix:'PREFIX1', content:'PREFIX1:TERM', line:'PREFIX1:TERM', y:1, x:8 ,
            	result: {'from':{'char':8,'line':1},'list':[{'className':'wikibase-rdf-hint','displayText':'LABEL (ID) DESCRIPTION\n','text':'ID'}],'to':{'char':12,'line':1}}},

             { scenario:'Defined prefix PREFIXDEF',prefix:'', content:'PREFIX PREFIXDEF: <ENTITY_URI>\nPREFIXDEF:TERM', line:'PREFIXDEF:TERM', y:2, x:10,
         		result: {'from':{'char':10,'line':2},'list':[{'className':'wikibase-rdf-hint','displayText':'LABEL (ID) DESCRIPTION\n','text':'ID'}],'to':{'char':14,'line':2}}},

         	{ scenario:'?p wdt:P31/^PREFIX1:TERM',prefix:'PREFIX1', content:'?p wdt:P31/^PREFIX1:TERM', line:'?p wdt:P31/PREFIX1:TERM', y:1, x:19,
           		result: {'from':{'char':19,'line':1},'list':[{'className':'wikibase-rdf-hint','displayText':'LABEL (ID) DESCRIPTION\n','text':'ID'}],'to':{'char':23,'line':1}}},

       		{ scenario:'?p wdt:P31/|PREFIX1:TERM',prefix:'PREFIX1', content:'?p wdt:P31/|PREFIX1:TERM', line:'?p wdt:P31/PREFIX1:TERM', y:1, x:19,
           		result: {'from':{'char':19,'line':1},'list':[{'className':'wikibase-rdf-hint','displayText':'LABEL (ID) DESCRIPTION\n','text':'ID'}],'to':{'char':23,'line':1}}},

         	{ scenario:'?p PREFIX:TERM/wdt:p1',prefix:'PREFIX', content:'?p PREFIX:TERM/wdt:p1', line:'?p PREFIX:TERM/wdt:p1', y:1, x:10,
           		result: {'from':{'char':10,'line':1},'list':[{'className':'wikibase-rdf-hint','displayText':'LABEL (ID) DESCRIPTION\n','text':'ID'}],'to':{'char':14,'line':1}}},

            { scenario:'?p wdt:P31/PREFIX1:TERM',prefix:'PREFIX1', content:'?p wdt:P31/PREFIX1:TERM', line:'?p wdt:P31/PREFIX1:TERM', y:1, x:19,
          		result: {'from':{'char':19,'line':1},'list':[{'className':'wikibase-rdf-hint','displayText':'LABEL (ID) DESCRIPTION\n','text':'ID'}],'to':{'char':23,'line':1}}},

            { scenario:'?p wdt:P31/PREFIXß:TERM',prefix:'PREFIXß', content:'?p wdt:P31/PREFIXß:TERM', line:'?p wdt:P31/PREFIXß:TERM', y:1, x:19,
          		result: {'from':{'char':19,'line':1},'list':[{'className':'wikibase-rdf-hint','displayText':'LABEL (ID) DESCRIPTION\n','text':'ID'}],'to':{'char':23,'line':1}}}
       		];

	QUnit.test( 'is constructable', function( assert ) {
		assert.expect( 1 );
		assert.ok( new Rdf() instanceof Rdf );
	} );

	QUnit.test( 'When there is nothing to autocomplete', function( assert ) {
		assert.expect( 1 );

		var rdf = new Rdf( null, {getPrefixMap:sinon.stub().returns({})} );
		rdf.getHint('XXX', 'XXX', 1, 3).done( function( hint ){
			assert.notOk( true, 'Hinting should not succed');
		} ).fail( function(){
			assert.ok( true, 'Hinting must fail' );
		} );
	} );

	QUnit.test( 'When empty prefix map', function( assert ) {
		assert.expect( 1 );

		var rdf = new Rdf( null,  {getPrefixMap:sinon.stub().returns({})} );
		rdf.getHint('XXX:', 'XXX:', 1, 4).done( function( hint ){
			assert.deepEqual( hint, HINT_UNKNOWN_PREFIX , 'Hint must be a unknown prefix hint');
		} );
	} );

	QUnit.test( 'When prefix exist, but there is nothing to search for', function( assert ) {
		assert.expect( 1 );

		var rdf = new Rdf( null, {getPrefixMap:sinon.stub().returns({'PREFIX' : 'item'})} );
		rdf.getHint('PREFIX:', 'PREFIX:', 1, 7).done( function( hint ){
			assert.deepEqual( hint, HINT_START_SEARCH , 'Hint equals start search');
		} );
	} );


	$.each( VALID_SCENARIOS, function( key, test){

		var api = new wb.queryService.api.Wikibase();
		var apiStub = sinon.stub( api, 'searchEntities' ).returns(  $.Deferred().resolve( { search:[{label:'LABEL', id:'ID', description:'DESCRIPTION'}] } ).promise() );

		QUnit.test( 'When running valid scenario: ' + this.scenario, function( assert ) {
			assert.expect( 1 );

			var prefix = {};
			prefix[test.prefix] = 'item';
			var rdf = new Rdf( api, {getPrefixMap:sinon.stub().returns( prefix ), ENTITY_TYPES: { 'ENTITY_URI': 'item' } } );
			rdf.getHint( test.content, test.line, test.y, test.x ).done( function( hint ){
				sinon.assert.calledWith( apiStub , 'TERM', 'item' );

				$.each( hint.list, function( key, hint ) {
					var hintElement = $( '<span>' )[0];
					hint.render( hintElement );
					hint.displayText = hintElement.textContent;
					delete hint.render;
				} );
				assert.deepEqual( hint, test.result , 'Hint must return valid hint');
			} );
		} );
	} );

}( jQuery, QUnit, sinon, wikibase ) );
