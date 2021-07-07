( function ( $, QUnit, sinon, wb ) {
	'use strict';

	QUnit.module( 'wikibase.queryService.ui.queryHelper' );

	var TEST_CASES = [
			{
				name: 'Cat query',
				sparqlIn: 'SELECT ?item ?itemLabel WHERE { ?item wdt:P31 wd:Q146 . SERVICE wikibase:label { bd:serviceParam wikibase:language "en" } }',
				sparqlOut: 'SELECT ?item ?itemLabel WHERE {\n  ?item wdt:P31 wd:Q146.\n  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }\n}',
				text: 'instance of cat Limit'
			},
			{
				name: 'Any cat query',
				sparqlIn: 'SELECT ?item ?itemLabel WHERE { ?item wdt:P31* wd:Q146 . SERVICE wikibase:label { bd:serviceParam wikibase:language "en" } }',
				sparqlOut: 'SELECT ?item ?itemLabel WHERE {\n  ?item (wdt:P31*) wd:Q146.\n  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }\n}',
				text: 'any instance of cat Limit'
			},
			{
				name: 'Subtype cat query',
				sparqlIn: 'SELECT * WHERE {?c  p:P31/ps:P31 wd:Q146 .}',
				sparqlOut: 'SELECT * WHERE { ?c (p:P31/ps:P31) wd:Q146. }',
				text: 'instance of or subtype instance of cat Limit'
			},
			{
				name: 'List of presidents with causes of death',
				sparqlIn: 'SELECT ?h ?cause ?hl ?causel WHERE { ?h wdt:P39 wd:Q11696 . ?h wdt:P509 ?cause . OPTIONAL {    ?h rdfs:label ?hl filter (lang(?hl) = "en") . } OPTIONAL {   ?cause rdfs:label ?causel filter (lang(?causel) = "en").  }}',
				sparqlOut: 'SELECT ?h ?cause ?hl ?causel WHERE {\n  ?h wdt:P39 wd:Q11696;\n    wdt:P509 ?cause.\n  OPTIONAL {\n    ?h rdfs:label ?hl.\n    FILTER((LANG(?hl)) = \"en\")\n  }\n  OPTIONAL {\n    ?cause rdfs:label ?causel.\n    FILTER((LANG(?causel)) = \"en\")\n  }\n}',
				text: 'position held President of the United States of America cause of death Limit'
			},
			{
				name: 'List of actors with pictures with year of birth and/or death',
				sparqlIn: 'SELECT ?human ?humanLabel ?yob ?yod ?picture WHERE{ ?human wdt:P31 wd:Q5 ; wdt:P106 wd:Q33999 . ?human wdt:P18 ?picture . OPTIONAL { ?human wdt:P569 ?dob . ?human wdt:P570 ?dod }. BIND(YEAR(?dob) as ?yob) . BIND(YEAR(?dod) as ?yod) . SERVICE wikibase:label {  bd:serviceParam wikibase:language "en" . }}LIMIT 88',
				sparqlOut: 'SELECT ?human ?humanLabel ?yob ?yod ?picture WHERE {\n  ?human wdt:P31 wd:Q5;\n    wdt:P106 wd:Q33999;\n    wdt:P18 ?picture.\n  OPTIONAL {\n    ?human wdt:P569 ?dob;\n      wdt:P570 ?dod.\n  }\n  BIND(YEAR(?dob) AS ?yob)\n  BIND(YEAR(?dod) AS ?yod)\n  SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\". }\n}\nLIMIT 88',
				text: 'instance of human occupation actor image Limit 88'
			},
			{
				name: 'Find instance of human using BIND()',
				sparqlIn: 'SELECT ?pid WHERE {  BIND(wd:Q5 AS ?thing)  ?pid wdt:P31 ?thing.}',
				sparqlOut: 'SELECT ?pid WHERE {\n  BIND(wd:Q5 AS ?thing)\n  ?pid wdt:P31 ?thing.\n}',
				text: 'instance of human Limit'
			},
			{
				name: 'Wildcard query with unbound variables',
				sparqlIn: 'SELECT * WHERE { ?item wdt:P31 ?instance. }',
				sparqlOut: 'SELECT * WHERE { ?item wdt:P31 ?instance. }',
				text: 'instance of Limit'
			},
			{
				name: 'Wildcard query with show section and unbound query',
				sparqlIn: 'SELECT * WHERE { ?item wdt:P31 wd:Q146.  OPTIONAL { ?item wdt:P39 ?position. } }',
				sparqlOut: 'SELECT * WHERE {\n  ?item wdt:P31 wd:Q146.\n  OPTIONAL { ?item wdt:P39 ?position. }\n}',
				text: 'instance of cat position held Limit'
			}
	];

	var LABELS = {
		P18: 'image',
		P569: 'date of birth',
		P570: 'date of birth',
		P31: 'instance of',
		P39: 'position held',
		P509: 'cause of death',
		P106: 'occupation',
		Q146: 'cat',
		Q5: 'human',
		Q11696: 'President of the United States of America',
		Q33999: 'actor'
	};

	QUnit.test( 'When instantiating QueryHelper there should be no error ', function ( assert ) {
		assert.expect( 2 );
		var qh = new wb.queryService.ui.queryHelper.QueryHelper();

		assert.ok( true, 'Instantiating must not throw an error' );
		assert.ok( ( qh instanceof wb.queryService.ui.queryHelper.QueryHelper ),
				'Instantiating must not throw an error' );
	} );

	$.each( TEST_CASES, function ( index, testCase ) {
		QUnit.test( 'When setting SPARQL  \'' + testCase.name
				+ '\' query to QueryHelper then there should be the expected outcome', function (
				assert ) {
			assert.expect( 2 );

			var api = new wb.queryService.api.Wikibase();
			sinon.stub( api, 'searchEntities' ).callsFake( function ( id ) {
				var label = id;
				if ( LABELS[id] ) {
					label = LABELS[id];
				}
				return $.Deferred().resolve( {
					search: [ {
						label: label,
						id: id,
						description: 'DESCRIPTION'
					} ]
				} ).promise();
			} );

			var qh = new wb.queryService.ui.queryHelper.QueryHelper( api );
			qh.setQuery( testCase.sparqlIn );

			var $html = $( '<div>' );
			qh.draw( $html );
			$html.find( '.btn' ).remove();
			$html.find( '.select2' ).remove();

			assert.equal( qh.getQuery().trim(), testCase.sparqlOut );
			assert.equal( $html.text().trim(), testCase.text );
		} );
	} );

}( jQuery, QUnit, sinon, wikibase ) );
