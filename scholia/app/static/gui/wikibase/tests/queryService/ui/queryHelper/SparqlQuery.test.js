( function( $, QUnit, sinon, wb ) {
	'use strict';

	QUnit.module( 'wikibase.queryService.ui.queryHelper' );

	var PACKAGE = wb.queryService.ui.queryHelper;
	var QUERY = {
		SIMPLE: 'SELECT * WHERE {}',
		LIMIT: 'SELECT * WHERE {} LIMIT 10',
		VARIABLES: 'SELECT ?x1 ?x2 ?x3 WHERE {} LIMIT 10',
		TRIPLE_VARIABLES: 'SELECT ?y1 ?y2 ?y3 WHERE { ?x1 ?x2 ?x3. }\nLIMIT 10',
		TRIPLES_UNION: 'PREFIX : <http://a.test/> SELECT ?x1 ?x2 ?x3 WHERE { :S :P :O.  OPTIONAL{ :S1 :P1 :O1 }  :S2 :P2 :O2. { :SU1 :PU1 :OU1 } UNION { :SU2 :PU2 :OU2 } }',
		TRIPLES: 'PREFIX : <http://a.test/> SELECT ?x1 ?x2 ?x3 WHERE { :S :P :O.  OPTIONAL{ :S1 :P1 :O1 }  :S2 :P2 :O2.}',
		SUBQUERIES: 'SELECT * WHERE {  {SELECT * WHERE { {SELECT * WHERE {}} }} }',
		BOUND: 'PREFIX : <http://a.test/> SELECT * WHERE { ?bound :P :O.  OPTIONAL{ :S1 ?x ?bound2 }  :S2 :P2 :O2.}',
		COMMENTS: '#foo:bar\n#6*9=42\nSELECT * WHERE {  }',
		LABEL_SERVICE: 'PREFIX wikibase: <http://wikiba.se/ontology#> PREFIX bd: <http://www.bigdata.com/rdf#> SELECT * WHERE { SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" } }',
	};

	QUnit.test( 'When instantiating new SparqlQuery then', function( assert ) {
		assert.expect( 2 );
		var q = new PACKAGE.SparqlQuery();

		assert.ok( true, 'must not throw an error' );
		assert.ok( ( q instanceof PACKAGE.SparqlQuery ), 'object must be type of SparqlQuery' );
	} );

	QUnit.test( 'When parsing query is \'' + QUERY.SIMPLE + '\' then', function( assert ) {
		assert.expect( 1 );

		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.SIMPLE );
		q.getQueryString();

		assert.ok( true, 'parsing must not throw an error' );
	} );

	QUnit.test( 'When parsing query ' + QUERY.LIMIT, function( assert ) {
		assert.expect( 1 );

		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.LIMIT );
		var limit = q.getLimit();

		assert.equal( 10, limit, 'then LIMIT must be 10' );
	} );

	QUnit.test( 'When query is \'' + QUERY.LIMIT + '\' and I change LIMIT to LIMIT * 2 then',
			function( assert ) {
				assert.expect( 1 );

				var q = new PACKAGE.SparqlQuery();
				q.parse( QUERY.LIMIT );
				var limit = q.getLimit();
				q.setLimit( ( limit * 2 ) );

				assert.equal( 20, q.getLimit(), 'LIMIT must be 20' );
			} );

	QUnit.test( 'When query is \'' + QUERY.LIMIT + '\' and I set LIMIT to NULL then', function(
			assert ) {
		assert.expect( 2 );

		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.LIMIT );
		q.setLimit( null );

		assert.equal( null, q.getLimit(), 'LIMIT should be NULL' );
		assert.equal( 'SELECT * WHERE {  }', q.getQueryString(),
				'query string should not contain LIMIT ' );
	} );

	QUnit.test( 'When query is \'' + QUERY.VARIABLES + '\' then', function( assert ) {
		assert.expect( 5 );

		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.VARIABLES );

		assert.ok( q.hasVariable( '?x1' ), '?x1 must be a variable' );
		assert.ok( q.hasVariable( '?x2' ), '?x1 must be a variable' );
		assert.ok( q.hasVariable( '?x3' ), '?x1 must be a variable' );

		assert.notOk( q.hasVariable( 'x4' ), 'x1 must not be a variable' );
		assert.notOk( q.hasVariable( '?x4' ), '?x1 must not be a variable' );
	} );


	QUnit.test( 'When query is \'' + QUERY.VARIABLES + '\' and I delete ?x2 then', function( assert ) {
		assert.expect( 4 );

		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.VARIABLES );
		q.removeVariable( '?x2' );

		assert.ok( q.hasVariable( '?x1' ), '?x1 must be a variable' );
		assert.ok( q.hasVariable( '?x3' ), '?x3 must be a variable' );

		assert.notOk( q.hasVariable( 'x4' ), 'x1 must not be a variable' );
		assert.notOk( q.hasVariable( '?x2' ), '?x1 must not be a variable' );
	} );

	QUnit.test( 'When query is \'' + QUERY.SIMPLE + '\' THEN', function( assert ) {
		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.SIMPLE );

		assert.notOk( q.hasVariable( '?XX' ), '?XX must not be a variable' );
		assert.notOk( q.hasVariable( 'XX' ), 'XX must not be a variable' );
		assert.notOk( q.hasVariable( 'YY' ), 'XX must not be a variable' );
		assert.notOk( q.hasVariable( 'ZZ' ), 'XX must not be a variable' );
	} );

	QUnit.test( 'When query is \'' + QUERY.TRIPLES_UNION + '\' then', function( assert ) {
		assert.expect( 16 );

		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.TRIPLES_UNION );
		var triples = q.getTriples();

		assert.equal( triples.length, 5, 'there should be 5 triples' );

		assert.equal( triples[0].optional, false, 'triple0 must not be optional' );
		assert.deepEqual( triples[0].query, q, 'query of triple1 must be query' );
		assert.deepEqual( triples[0].triple, {
			"subject": "http://a.test/S",
			"predicate": "http://a.test/P",
			"object": "http://a.test/O"
		}, 'tripl1 must be S, P, O' );

		assert.equal( triples[1].optional, true, 'triple1 must be optional' );
		assert.deepEqual( triples[1].query, q, 'query of triple1 must be query' );
		assert.deepEqual( triples[1].triple, {
			"object": "http://a.test/O1",
			"predicate": "http://a.test/P1",
			"subject": "http://a.test/S1"
		}, 'tripl1 must be S1, P1, O1' );

		assert.equal( triples[2].optional, false, 'triple2 must not be optional' );
		assert.deepEqual( triples[2].query, q, 'query of triple1 must be query' );
		assert.deepEqual( triples[2].triple, {
			"object": "http://a.test/O2",
			"predicate": "http://a.test/P2",
			"subject": "http://a.test/S2"
		}, 'tripl2 must be S2, P2, O2' );


		assert.equal( triples[3].optional, false, 'triple3 must not be optional' );
		assert.deepEqual( triples[3].query, q, 'query of triple3 must be query' );
		assert.deepEqual( triples[3].triple, {
			"subject": "http://a.test/SU1",
			"predicate": "http://a.test/PU1",
			"object": "http://a.test/OU1"
		}, 'triple3 must be SU1, PU1, OU1' );

		assert.equal( triples[4].optional, false, 'triple3 must not be optional' );
		assert.deepEqual( triples[4].query, q, 'query of triple3 must be query' );
		assert.deepEqual( triples[4].triple, {
			"subject": "http://a.test/SU2",
			"predicate": "http://a.test/PU2",
			"object": "http://a.test/OU2"
		}, 'triple3 must be SU2, PU2, OU2' );
	} );

	QUnit.test( 'When query is \'' + QUERY.TRIPLES + '\' and I delete 2 triples then', function(
			assert ) {
		assert.expect( 2 );

		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.TRIPLES );
		var triples = q.getTriples();

		triples[0].remove();
		triples[2].remove();

		triples = q.getTriples();

		assert.equal( triples.length, 1, 'there should be 1 triple left' );
		assert.deepEqual( triples[0].triple, {
			"object": "http://a.test/O1",
			"predicate": "http://a.test/P1",
			"subject": "http://a.test/S1"
		}, 'tripl left must be S1, P1, O1' );
	} );

	QUnit.test( 'When query is \'' + QUERY.SUBQUERIES + '\' then', function( assert ) {
		assert.expect( 4 );

		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.SUBQUERIES );
		var queries = q.getSubQueries();

		assert.equal( queries.length, 1, 'expecting one subquery' );
		assert.ok( ( queries[0] instanceof PACKAGE.SparqlQuery ),
				'that must be instance of SparqlQuery' );

		queries = queries[0].getSubQueries();
		assert.equal( queries.length, 1, 'expecting one sub query of sub query' );
		assert.ok( ( queries[0] instanceof PACKAGE.SparqlQuery ),
				'that must be instance of SparqlQuery' );
	} );

	QUnit.test( 'When query is \'' + QUERY.TRIPLES + '\' and I add two triples',
			function( assert ) {
				assert.expect( 5 );

				var q = new PACKAGE.SparqlQuery();
				q.parse( QUERY.TRIPLES );

				q.addTriple( 'SX', 'PX', 'OX' );
				q.addTriple( 'SY', 'PY', 'OY', true );

				var triples = q.getTriples();

				assert.equal( triples.length, 5, 'there should be 5 triple ' );

				assert.deepEqual( triples[3].triple, {
					"object": "OX",
					"predicate": "PX",
					"subject": "SX"
				}, 'triple added must be SX, PX, OX' );
				assert.notOk( triples[3].optional, 'triple must not be optional' );

				assert.deepEqual( triples[4].triple, {
					"object": "OY",
					"predicate": "PY",
					"subject": "SY"
				}, 'triple added must be SY, PY, OY' );
				assert.ok( triples[4].optional, 'triple must  be optional' );
			} );

	QUnit.test( 'When query is \'' + QUERY.BOUND + '\'', function( assert ) {
		assert.expect( 1 );

		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.BOUND );

		assert.deepEqual( q.getBoundVariables(), [
				"?bound", "?bound2"
		], 'bound subject variables must be ?bound and ?bound2' );
	} );

	QUnit.test( 'When query is \'' + QUERY.COMMENTS + '\'', function( assert ) {
		assert.expect( 3 );

		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.COMMENTS );

		assert.strictEqual( q.getQueryString(), QUERY.COMMENTS,
			'formatted query must be identical' );
		assert.strictEqual( q.getCommentContent( 'foo:' ), 'bar',
			'content of #foo: comment must be bar' );
		assert.strictEqual( q.getCommentContent( '6*9=' ), '42',
			'six times nine must be forty-two' );
	} );

	QUnit.test( 'When query is \'' + QUERY.LABEL_SERVICE + '\'', function( assert ) {
		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.LABEL_SERVICE );
		var s = q.getServices();

		assert.equal( s.length, 1, 'There should be one service' );
		assert.equal( s[0].name, 'http://wikiba.se/ontology#label', 'Wikibase label service should be in services' );
	} );

	QUnit.test( 'When query is \'' + QUERY.LABEL_SERVICE + '\' and Wikibase label is removed', function( assert ) {
		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.LABEL_SERVICE );
		q.removeService( 'http://wikiba.se/ontology#label' );

		var s = q.getServices();

		assert.equal( s.length, 0, 'There should be no services' );
	} );

	QUnit.test( 'When query is \'' + QUERY.LABEL_SERVICE + '\' and some service is removed', function( assert ) {
		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.LABEL_SERVICE );
		q.removeService( 'SOME_SERVICE' );

		var s = q.getServices();

		assert.equal( s.length, 1, 'There should be one service' );
		assert.equal( s[0].name, 'http://wikiba.se/ontology#label', 'Wikibase label service should be in services' );
	} );

	QUnit.test( 'When query is \'' + QUERY.TRIPLE_VARIABLES + '\'', function( assert ) {
		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.TRIPLE_VARIABLES );

		assert.deepEqual( q.getTripleVariables(), [ '?x1', '?x2', '?x3' ], 'all variables should be returned' );
	} );

	QUnit.test( 'When query is \'' + QUERY.TRIPLE_VARIABLES + '\' and variables are cleaned up ', function( assert ) {
		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.TRIPLE_VARIABLES );
		q.cleanupVariables();

		assert.deepEqual( q.getQueryString(), QUERY.TRIPLE_VARIABLES.replace( /SELECT(.*)WHERE/, 'SELECT * WHERE' ),
				'Unused variables should be removed' );
	} );

	QUnit.test( 'When query is \'' + QUERY.TRIPLE_VARIABLES + '\' and variables are cleaned up with filter ', function( assert ) {
		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.TRIPLE_VARIABLES );
		q.cleanupVariables( [ '?someUnrelatedVariable' ] );

		assert.deepEqual( q.getQueryString(), QUERY.TRIPLE_VARIABLES , 'Unused variables in filter list should not be removed' );
	} );

	QUnit.test( 'When query is \'' + QUERY.SIMPLE + '\' ', function( assert ) {
		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.SIMPLE );

		assert.ok( q.isWildcardQuery(), 'isWildcardQuery returns true' );
	} );

	QUnit.test( 'When query is \'' + QUERY.VARIABLES + '\' ', function( assert ) {
		var q = new PACKAGE.SparqlQuery();
		q.parse( QUERY.VARIABLES );

		assert.notOk( q.isWildcardQuery(), 'isWildcardQuery returns false' );
	} );

}( jQuery, QUnit, sinon, wikibase ) );
