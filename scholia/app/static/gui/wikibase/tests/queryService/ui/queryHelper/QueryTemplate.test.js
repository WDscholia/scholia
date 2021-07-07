( function ( $, QUnit, sinon, wb ) {
	'use strict';

	QUnit.module( 'wikibase.queryService.ui.queryHelper' );

	var QueryTemplate = wb.queryService.ui.queryHelper.QueryTemplate;

	QUnit.test( '_getQueryTemplateText internal function', function( assert ) {
		assert.expect( 10 );

		assert.strictEqual(
			QueryTemplate._getQueryTemplateText( { template: 'single text' }, 'en' ),
			'single text',
			"template with single text should work"
		);

		assert.strictEqual(
			QueryTemplate._getQueryTemplateText( { template: { en: 'English text' } }, 'en' ),
			'English text',
			"template with single language version should work"
		);

		assert.strictEqual(
			QueryTemplate._getQueryTemplateText( { template: { de: 'deutscher Text' } }, 'de' ),
			'deutscher Text',
			"template with single non-English language version should work"
		);

		assert.strictEqual(
			QueryTemplate._getQueryTemplateText( { template: { en: 'English text', de: 'deutscher Text' } }, 'en' ),
			'English text',
			"template with alternative language version should work"
		);

		assert.strictEqual(
			QueryTemplate._getQueryTemplateText( { template: { de: 'deutscher Text', en: 'English text' } }, 'en' ),
			'English text',
			"template with alternative language version should work regardless of order in JSON"
		);

		assert.strictEqual(
			QueryTemplate._getQueryTemplateText( { template: { de: 'deutscher Text' } }, 'en', {}, 'de' ),
			'deutscher Text',
			"undefined language should fall back to final fallback"
		);

		assert.strictEqual(
			QueryTemplate._getQueryTemplateText( { template: { en: 'English text' } }, 'de' ),
			'English text',
			"undefined language should fall back to English if final fallback not specified"
		);

		assert.strictEqual(
			QueryTemplate._getQueryTemplateText( { template: { en: 'English text', 'de': 'deutscher Text' } }, 'de-at', { 'de-at': [ 'de' ] } ),
			'deutscher Text',
			"language fallbacks between languages should work"
		);

		assert.strictEqual(
			QueryTemplate._getQueryTemplateText( { template: { 'de': 'deutscher Text' } }, 'en' ),
			'deutscher Text',
			"text should ultimately fall back to any available language"
		);

		assert.strictEqual(
			QueryTemplate._getQueryTemplateText( { template: {} }, 'en' ),
			'',
			"blank template should not provoke errors by returning undefined"
		);
	} );

	QUnit.test( '_getQueryTemplateFragments internal function', function( assert ) {
		assert.expect( 7 );

		assert.deepEqual(
			QueryTemplate._getQueryTemplateFragments( { template: 'a ?b c ?d e', variables: { '?b': {}, '?d': {} } } ),
			[ 'a ', '?b', ' c ', '?d', ' e' ],
			"fragments should be split correctly"
		);
		assert.deepEqual(
			QueryTemplate._getQueryTemplateFragments( { template: 'a ?b c ?d e ?f g', variables: { '?b': {}, '?d': {} } } ),
			[ 'a ', '?b', ' c ', '?d', ' e ?f g' ],
			"only variables mentioned in template should be replaced"
		);
		assert.deepEqual(
			QueryTemplate._getQueryTemplateFragments( { template: 'a ?b c ?b a', variables: { '?b': {} } } ),
			[ 'a ', '?b', ' c ', '?b', ' a' ],
			"variables occurring multiple times should work"
		);
		assert.deepEqual(
			QueryTemplate._getQueryTemplateFragments( { template: '?b a ?b', variables: { '?b': {} } } ),
			[ '', '?b', ' a ', '?b', '' ],
			"fragments should always begin and end with text fragment"
		);
		assert.deepEqual(
			QueryTemplate._getQueryTemplateFragments( { template: '', variables: { '?b': {} } } ),
			[ '' ],
			"empty template should convert to single empty fragment"
		);
		assert.throws(
			function() {
				QueryTemplate._getQueryTemplateFragments( { template: 'a \0 c', variables: { '?b': {} } } );
			},
			Error,
			"should not be possible to manipulate the fragment list via null bytes in template"
		);
		assert.throws(
			function() {
				QueryTemplate._getQueryTemplateFragments( { template: 'a b c', variables: { '.*': {} } } );
			},
			Error,
			"should not be possible to manipulate the fragment list via regex characters in variables"
		);
	} );

	QUnit.test( '_buildTemplate internal function', function( assert ) {
		assert.expect( 4 );

		var variables = {};
		var template = QueryTemplate._buildTemplate( [ 'a ', '?b', ' c ', '?d', ' e ?f g' ], variables );

		assert.equal( template.text(), 'a ?b c ?d e ?f g', 'template text should look like template' );
		assert.ok( '?b' in variables, 'variables should contain the variables from the template' );
		assert.ok( '?d' in variables, 'variables should contain the variables from the template' );
		assert.equal( Object.getOwnPropertyNames( variables ).length, 2, 'variables should not contain any other properties' );
	} );

	var testCases = [
		{
			description: 'query template with single variable',
			sparql: '#TEMPLATE={ "template": "Find ?thing\u200Bs", "variables": { "?thing": {} } }\nSELECT ?human WHERE { BIND(wd:Q5 AS ?thing) ?human wdt:P31 ?thing }',
			text: 'Find human\u200Bs'
		},
		{
			description: 'query template with two variables',
			sparql: '#TEMPLATE={ "template": "Find ?thing\u200Bs with ?prop", "variables": { "?thing": {}, "?prop": {} } }\nSELECT ?human ?other WHERE { BIND(wd:Q5 AS ?thing) BIND(wdt:P21 AS ?prop) ?human wdt:P31 ?thing; ?prop ?other }',
			text: 'Find human\u200Bs with sex or gender'
		},
		{
			description: 'query template with the same variable twice',
			sparql: '#TEMPLATE={ "template": "Find ?thing\u200Bs that are ?thing\u200Bs", "variables": { "?thing": {} } }\nSELECT ?human WHERE { BIND(wd:Q5 AS ?thing) ?human wdt:P31 ?thing }',
			text: 'Find human\u200Bs that are human\u200Bs'
		}
	];
	var labels = {
		'?thing': 'human',
		'?prop': 'sex or gender'
	};

	$.each( testCases, function( index, testCase ) {
		QUnit.test( testCase.description, function( assert ) {
			assert.expect( 1 );

			var query = new wb.queryService.ui.queryHelper.SparqlQuery();
			query.parse( testCase.sparql, wb.queryService.RdfNamespaces.ALL_PREFIXES );
			var qt = QueryTemplate.parse( query );
			var $html = qt.getHtml(
				function( variable ) { return $.Deferred().resolve( labels[variable] ).promise(); },
				{ add: function() {} },
				function() {}
			);

			assert.equal( $html.text(), testCase.text );
		} );
	} );
}( jQuery, QUnit, sinon, wikibase ) );
