var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.queryHelper = wikibase.queryService.ui.queryHelper || {};

wikibase.queryService.ui.queryHelper.SelectorBox = ( function( $, wikibase ) {
	'use strict';

	var SPARQL_TIMEOUT = 4 * 1000;

/*jshint multistr: true */
	var SPARQL_QUERY = {
			item: {
				suggest:// Find items that are used with a specifc property
					'SELECT ?id ?label ?description WHERE {\
					hint:Query hint:optimizer "None".\
							{\
								SELECT DISTINCT ?id WHERE { ?i <{PROPERTY_URI}> ?id. }\
								LIMIT 100\
							}\
						?id rdfs:label ?label.\
						?id schema:description ?description.\
						FILTER((LANG(?label)) = "{LANGUAGE}")\
						FILTER((LANG(?description)) = "{LANGUAGE}")\
					}\
					LIMIT 100',
				genericSuggest: function() { // Find items that are most often used with the first selected item of the current query
					var popularItemsTemplate =// Find items that have topic's main template
						'SELECT ?id ?label ?description WHERE {\
						hint:Query hint:optimizer "None".\
							{\
								SELECT DISTINCT ?id WHERE { ?id wdt:P1424 ?p. }\
								LIMIT 100\
							}\
							?id rdfs:label ?label.\
							?id schema:description ?description.\
							FILTER((LANG(?label)) = "{LANGUAGE}")\
							FILTER((LANG(?description)) = "{LANGUAGE}")\
						}\
						LIMIT 100';
					if ( this._query.getTriples().length === 0 ) {
						return popularItemsTemplate;
					}

					var template = '{PREFIXES}\n\
						SELECT ?id ?label ?description ?property (?count as ?rank) WITH {\n\
							{QUERY}\n\
						} AS %query WITH {\n\
							SELECT ({VARIABLE} AS ?item) WHERE {\n\
								INCLUDE %query.\n\
							}\n\
						} AS %item WITH {\n\
							SELECT ?value ?property (COUNT(?statement) AS ?count) WHERE {\n\
								INCLUDE %item.\n\
								?item ?p ?statement.\n\
								?statement ?ps ?value.\n\
								?property a wikibase:Property; wikibase:claim ?p; wikibase:statementProperty ?ps.\n\
							}\n\
							GROUP BY ?value ?property\n\
							HAVING(isIRI(?value) && STRSTARTS(STR(?value), STR(wd:Q)))\n\
							ORDER BY DESC(?count)\n\
							LIMIT 100\n\
						} AS %values WHERE {\n\
							INCLUDE %values.\n\
							BIND(?value AS ?id).\n\
							SERVICE wikibase:label {\n\
								bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en".\n\
								?id rdfs:label ?label; schema:description ?description.\n\
							}\n\
						}\n\
						ORDER BY DESC(?count)',
						variable = this._query.getBoundVariables().shift() || this._query.getTripleVariables().shift(),
						query = this._query.clone().setLimit( 1000 )
							.removeService( 'http://wikiba.se/ontology#label' )
							.addVariable( variable )
							.getQueryString(),
						prefixes = query.match( /.*\bPREFIX\b(.*)/gi ).join( '\n' );

					query = query.replace( /.*\bPREFIX\b.*/gi, '' );
					return template.replace( '{QUERY}', query )
						.replace( '{VARIABLE}', variable )
						.replace( '{PREFIXES}', prefixes );
				},
				search: null,
// Disable for now as requested by Smalyshev
//					'SELECT ?id ?label ?description WHERE {\
//						hint:Query hint:optimizer "None".\
//							{\
//								SELECT DISTINCT ?id WHERE { ?i <{PROPERTY_URI}> ?id. }\
//							}\
//						?id rdfs:label ?label.\
//						?id schema:description ?description.\
//						FILTER((LANG(?label)) = "{LANGUAGE}")\
//						FILTER((LANG(?description)) = "{LANGUAGE}")\
//						FILTER(STRSTARTS(LCASE(?label), LCASE("{TERM}")))\
//					}\
//					LIMIT 20',
				instanceOf:// Find items that are used with property 'instance of'
					'SELECT ?id ?label ?description WHERE {\
					hint:Query hint:optimizer "None".\
						{\
							SELECT DISTINCT ?id WHERE { ?i wdt:P31 ?id. }\
							LIMIT 100\
						}\
						?id rdfs:label ?label.\
						?id schema:description ?description.\
						FILTER((LANG(?label)) = "en")\
						FILTER((LANG(?description)) = "en")\
					}\
					LIMIT 100'
		},
		property: {
			suggest:// Find properties that are used with a specific item
				'SELECT ?id ?label ?description WHERE {\
				hint:Query hint:optimizer "None".\
					{\
						SELECT DISTINCT ?id WHERE {\
						?i ?prop <{ITEM_URI}>.\
						?id ?x ?prop.\
						?id rdf:type wikibase:Property.\
						}\
						LIMIT 100\
					}\
				?id rdfs:label ?label.\
				?id schema:description ?description.\
				FILTER((LANG(?label)) = "{LANGUAGE}")\
				FILTER((LANG(?description)) = "{LANGUAGE}")\
				}\
				LIMIT 100',
			genericSuggest: function() { // Find properties that are most often used with the first selected item of the current query

				var genericTemplate = // Find properties that are most often used with all items
				'SELECT ?id ?label ?description (?count as ?rank) WITH {\
					SELECT ?pred (COUNT(?value) AS ?count) WHERE\
					{\
					?subj ?pred ?value .\
					} GROUP BY ?pred ORDER BY DESC(?count) LIMIT 1000\
					} AS %inner\
				WHERE {\
					INCLUDE %inner\
					?id wikibase:claim ?pred.\
					?id rdfs:label ?label.\
					?id schema:description ?description.\
					FILTER((LANG(?label)) = "en")\
					FILTER((LANG(?description)) = "en")\
				} ORDER BY DESC(?count)\
				LIMIT 100';

				if ( this._query.getTriples().length === 0 ) {
					return genericTemplate;
				}

				var template = '{PREFIXES}\n\
					SELECT ?id ?label ?description (?count as ?rank) WITH {\n\
						{QUERY}\n\
					} AS %query WITH {\n\
						SELECT ({VARIABLE} AS ?item) WHERE {\n\
							INCLUDE %query.\n\
						}\n\
					} AS %item WITH {\n\
						SELECT ?property (COUNT(?statement) AS ?count) WHERE {\n\
							INCLUDE %item.\n\
							?item ?p ?statement.\n\
							?property a wikibase:Property; wikibase:claim ?p.\n\
						}\n\
						GROUP BY ?property\n\
						ORDER BY DESC(?count)\n\
						LIMIT 100\n\
					} AS %properties WHERE {\n\
						INCLUDE %properties.\n\
						BIND(?property AS ?id).\n\
						SERVICE wikibase:label {\n\
							bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en".\n\
							?id rdfs:label ?label; schema:description ?description.\n\
						}\n\
					}\n\
					ORDER BY DESC(?count)',
					variable = this._query.getBoundVariables().shift() || this._query.getTripleVariables().shift(),
					query = this._query.clone()
						.setLimit( 500 )
						.removeService( 'http://wikiba.se/ontology#label' )
						.addVariable( variable )
						.getQueryString(),
					prefixes = query.match( /.*\bPREFIX\b(.*)/gi ).join( '\n' );

				query = query.replace( /.*\bPREFIX\b.*/gi, '' );
				return template.replace( '{QUERY}', query )
					.replace( '{VARIABLE}', variable )
					.replace( '{PREFIXES}', prefixes );
			},
			search: null,
//			search:// Find properties that are most often used with a specific item and filter with term prefix
//				'SELECT ?id ?label ?description WHERE {\
//					{\
//					SELECT ?id (COUNT(?id) AS ?count) WHERE {\
//						?i ?prop <{ITEM_URI}>.\
//						?id ?x ?prop.\
//						?id rdf:type wikibase:Property.\
//						}\
//						GROUP BY ?id\
//					}\
//				?id rdfs:label ?label.\
//				?id schema:description ?description.\
//				FILTER((LANG(?label)) = "{LANGUAGE}")\
//				FILTER((LANG(?description)) = "{LANGUAGE}")\
//				FILTER(STRSTARTS(LCASE(?label), LCASE("{TERM}")))\
//				}\
//				ORDER BY DESC(?count)\
//				LIMIT 20',
			seeAlso:// Read see also property from a specific property
				'SELECT ?id ?label ?description WHERE {\
					BIND( <{PROPERTY_URI}> as ?prop).\
					?props ?x  ?prop.\
					?props rdf:type wikibase:Property.\
					?props wdt:P1659 ?id.\
					?id rdfs:label ?label.\
					?id schema:description ?description.\
					FILTER((LANG(?label)) = "{LANGUAGE}")\
					FILTER((LANG(?description)) = "{LANGUAGE}")\
				}'
		},

		sparql: {
			search:
				'SELECT ?id ?label ?description WITH {\
					{SPARQL}\
					} AS %inner\
				WHERE {\
					INCLUDE %inner\
					?id rdfs:label ?label.\
					?id schema:description ?description.\
					FILTER((LANG(?label)) = "{LANGUAGE}")\
					FILTER((LANG(?description)) = "{LANGUAGE}")\
					FILTER(STRSTARTS(LCASE(?label), LCASE("{TERM}")))\
				} ORDER BY DESC(?count)\
				LIMIT 100',
			suggest:
				'SELECT ?id ?label ?description WITH {\
				{SPARQL}\
				} AS %inner\
			WHERE {\
				INCLUDE %inner\
				?id rdfs:label ?label.\
				?id schema:description ?description.\
				FILTER((LANG(?label)) = "{LANGUAGE}")\
				FILTER((LANG(?description)) = "{LANGUAGE}")\
			} ORDER BY DESC(?count)\
			LIMIT 100'
		}
	};

	/**
	 * A selector box for selecting and changing properties and items
	 *
	 * @class wikibase.queryService.ui.queryHelper.SelectorBox
	 * @license GNU GPL v2+
	 *
	 * @author Jonas Kress
	 * @constructor
	 * @param {wikibase.queryService.api.Wikibase} [api]
	 */
	function SELF( api, sparqlApi ) {
		this._api = api || new wikibase.queryService.api.Wikibase();
		this._sparqlApi = sparqlApi || new wikibase.queryService.api.Sparql();
	}

	/**
	 * @property {wikibase.queryService.api.Wikibase}
	 * @private
	 */
	SELF.prototype._api = null;

	/**
	 * @property {wikibase.queryService.api.Sparql}
	 * @private
	 */
	SELF.prototype._sparqlApi = null;

	/**
	 * @property {wikibase.queryService.ui.queryHelper.SparqlQuery}
	 * @private
	 */
	SELF.prototype._query = null;

	/**
	 * @param {wikibase.queryService.ui.queryHelper.SparqlQuery} query
	 */
	SELF.prototype.setQuery = function( query ) {
		this._query = query;
	};

	/**
	 * Add selector box to element
	 *
	 * @param {jQuery} $element
	 * @param {Object} triple
	 * @param {Function} listener a function called when value selected
	 * @param {Object} toolbar {icon:callback}
	 */
	SELF.prototype.add = function( $element, triple, listener, toolbar ) {
		switch ( $element.data( 'type' ).toLowerCase() ) {
		case 'number':
			this._createInput( $element, listener, toolbar );
			break;
		case 'tagcloud':
			this._createTagCloud( $element, triple, listener, toolbar );
			break;
		default:
			this._createSelect( $element, triple, listener, toolbar );
		}
	};

	/**
	 * @private
	 */
	SELF.prototype._createInput = function( $element, listener, toolbar ) {
		var $input = $( '<input>' ).attr( 'type', $element.data( 'type' ) ),
			$close = this._getCloseButton(),
			$toolbar = this._getToolbar( toolbar, $element ),
			$content = $( '<div>' ).append( $close, ' ', $input, ' ', $toolbar );

		$element.clickover( {
			placement: 'bottom',
			'global_close': false,
			'html': true,
			'sanitize': false,
			'content': function() {
				return $content;
			}
		} ).click( function( e ) {
			$input.val( $element.data( 'value' ) || '' );
		} );

		$input.on( 'keyup mouseup', function() {
			if ( listener ) {
				listener( $input.val() );
			}
		} );
	};

	/**
	 * @private
	 */
	SELF.prototype._createTagCloud = function( $element, triple, listener, toolbar ) {
		var self = this,
			entity = $element.data( 'entity' ),
			sparql = $element.data( 'sparql' ),
			tags = [],
			createTags = function () {
				tags = [];

				return self._searchEntitiesSparql( null, entity, triple, sparql  ).then(  function ( d ) {
						d.forEach( function ( t ) {
							tags.push( {
								text: t.text,
								weight: t.data.rank || ( Math.round( Math.random() * 10 ) > 9 ? 5 : Math
										.round( Math.random() * 3 ) ),
								link: '#',
								html: {
									title: t.data.description + ( t.data.rank ? ' (' + t.data.rank + ')' : '' ),
									'data-id': t.id
								},
								handlers: {
									click: function ( e ) {

										if ( t.data.propertyId ) {
											listener( t.id, t.text, t.data.propertyId );
											return false;
										}

										self._suggestPropertyId( t.id ).always(
												function ( propertyId ) {
													listener( t.id, t.text, propertyId );
												} );
										return false;
									}
								}
							} );
						} );
					} );
			};

		createTags().then( function() {
			if ( tags.length === 0 ) {
				$element.hide();
				return;
			}
			$element.show();
			$element.jQCloud( tags, {
				delayedMode: true,
				autoResize: true
			} );
		} );

	};

	/**
	 * @private
	 */
	SELF.prototype._createSelect = function( $element, triple, listener, toolbar ) {
		var self = this,
			$select = this._getSelectBox( $element ),
			$close = this._getCloseButton(),
			$toolbar = this._getToolbar( toolbar, $element ),
			$content = $( '<div>' ).append( $close, ' ', $select, ' ', $toolbar );

		if ( $element.children().length === 0 ) {
			this._createSelectInline( $element, triple, listener );
			return;
		}

		$element.clickover( {
			placement: 'bottom',
			'global_close': false,
			'html': true,
			'sanitize': false,
			'content': function() {
				return $content;
			}
		} ).click( function( e ) {
			$select.toggleClass( 'open' );

			if ( !$select.data( 'select2' ) ) {
				$.proxy( self._renderSelect2( $select, $element, triple ), self );
			}

			if ( $select.hasClass( 'open' ) ) {
				if ( $element.data( 'auto_open' ) ) {
					$select.data( 'select2' ).open();
				}
			}
			return false;
		} );

		$select.change( function( e ) {
			if ( listener ) {
				var id = $select.val(),
					text = $select.find( 'option:selected' ).text(),
					data = $element.data( 'items' ),
					propertyId = data && data[id] && data[id].propertyId || null;

				if ( propertyId ) {
					listener( id, text, propertyId );
				} else {
					self._suggestPropertyId( id ).always( function ( propertyId ) {
						listener( id, text, propertyId );
					} );
				}
			}
			$element.click();// hide clickover
			$select.html( '' );
		} );
	};

	/**
	 * @private
	 */
	SELF.prototype._suggestPropertyId = function( id ) {
		var deferred = $.Deferred(),
				query = 'SELECT ?id (COUNT(?id) AS ?count) WHERE { { SELECT ?id WHERE {\
							?i ?prop wd:{ITEM_ID}.\
							?id wikibase:directClaim ?prop.\
							?id rdf:type wikibase:Property.\
							}\
							LIMIT 10000 } } GROUP BY ?id ORDER BY DESC(?count) LIMIT 1'
					.replace( '{ITEM_ID}', id );

		this._sparqlApi.query( query, ( SPARQL_TIMEOUT / 2 ) ).done( function ( data ) {

			try {
				deferred.resolve( data.results.bindings[0].id.value.split( '/' ).pop() );
			} catch ( e ) {
				deferred.reject();
			}

		} ).fail( function() {
			deferred.reject();
		} );

		return deferred.promise();
	};

	/**
	 * @private
	 */
	SELF.prototype._createSelectInline = function( $element, triple, listener ) {
		var $select = this._getSelectBox( $element );

		$element.replaceWith( $select );
		this._renderSelect2( $select, $element, triple );

		$select.change( function( e ) {
			if ( listener ) {
				var id = $select.val(),
					data = $element.data( 'items' ),
					propertyId = data && data[id] && data[id].propertyId || null ;

				listener( id, $select.find( 'option:selected' ).text(), propertyId );
			}
		} );

	};

	/**
	 * @private
	 */
	SELF.prototype._getSelectBox = function( $element ) {
		var id = $element.data( 'id' );
		var label = $element.text();

		var $select = $( '<select>' );
		if ( id ) {
			$select.append( $( '<option>' ).attr( 'value', id ).text( label ) );
		}

		return $select;
	};

	/**
	 * @private
	 */
	SELF.prototype._getCloseButton = function() {
		return $( '<a href="#" data-dismiss="clickover">' ).append(
				'<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' );
	};

	/**
	 * @private
	 */
	SELF.prototype._getToolbar = function( toolbar, $element ) {
		var $toolbar = $( '<span>' );

		$.each( toolbar, function( icon, callback ) {
			var $link = $( '<a>' ).attr( 'href', '#' );
			$link.prepend( '<span class="glyphicon glyphicon-' + icon +
					'" aria-hidden="true"></span>', ' ' );

			$link.click( function() {
				if ( callback() ) {
					$element.click();// close popover
				}

				return false;
			} );
			$toolbar.append( $link, ' ' );
		} );

		return $toolbar;
	};

	/**
	 * @private
	 */
	SELF.prototype._createLookupService = function( $element, triple ) {
		var self = this,
			type = $element.data( 'type' ),
			sparql = $element.data( 'sparql' );

		return function( params, success, failure ) {
			$.when(
					self._searchEntitiesSparql( params.data.term, type, triple, sparql ),
					self._searchEntities( params.data.term, type )
					).done( function ( r1, r2 ) {

					self._addItemMetaData( $element, r1.concat( r2 ) );

					if ( r1.length > 0 ) {
						r1 = [ {
								text: wikibase.queryService.ui.i18n.getMessage( 'wdqs-ve-sb-suggestions', 'Suggestions' ),
								children: r1
						} ];
					}

					if ( r2.length > 0 &&  r1.length > 0 ) {
						r2 = [ {
							text: wikibase.queryService.ui.i18n.getMessage( 'wdqs-ve-sb-other', 'Other' ),
							children: r2
						} ];
					}

					success( {
						results: r1.concat( r2 )
					} );
			} );
		};
	};

	/**
	 * @private
	 */
	SELF.prototype._addItemMetaData = function( $element, items ) {
		var data = {};

		items.forEach( function ( item ) {

			if ( !data[item.data.id] ) {
				data[item.data.id] = {};
			}

			data[item.data.id].text = item.text;

			if ( item.data.propertyId ) {
				data[item.data.id].propertyId = item.data.propertyId;
			}

		} );

		$element.data( 'items', data );
	};

	/**
	 * @private
	 * @param {string} term
	 * @param {string} type
	 * @param {Object} triple
	 * @param {string} [sparql]
	 * @return {string}
	 */
	SELF.prototype._getSparqlTemplate = function( term, type, triple, sparql ) {
		var definition = this._getSparqlTemplateDefinition( term, type, triple, sparql ),
			template =  typeof definition === 'function' ? definition.apply( this ) : definition;

		if ( sparql ) {
			template = template.replace( '{SPARQL}', sparql );
		}

		return template;
	};

	/**
	 * @private
	 * @return {string|Function|null}
	 */
	SELF.prototype._getSparqlTemplateDefinition = function( term, type, triple, sparql ) {
		if ( sparql ) {
			if ( term ) {
				return SPARQL_QUERY.sparql.search;
			}

			return SPARQL_QUERY.sparql.suggest;
		}

		var query = SPARQL_QUERY[ type ];
		if ( term && term.trim() !== '' ) {
			if ( !triple ) {
				return null;
			}

			return query.search;

		} else {
			if ( type === 'property' ) {
				if ( !triple  ) {
					return query.genericSuggest;
				}

				if ( triple.object. indexOf( '?' ) === 0  ) {
					return query.seeAlso;
				}
			} else {
				if ( !triple ) {
					return query.genericSuggest;
				}
			}
			return query.suggest;
		}

	};

	/**
	 * @private
	 */
	SELF.prototype._searchEntitiesSparqlCreateQuery = function( term, type, triple, sparql ) {

		var query = this._getSparqlTemplate( term, type, triple, sparql );

		function findFirstStringProperty( predicate ) {
			if ( typeof predicate === 'string' ) {
				return predicate;
			} else {
				return findFirstStringProperty( predicate.items[0] );
			}
		}

		if ( query ) {
			if ( triple ) {
				query = query
						.replace( '{PROPERTY_URI}', findFirstStringProperty( triple.predicate ) )
						.replace( '{ITEM_URI}', triple.object );
			}
			if ( term ) {
				query = query.replace( '{TERM}', term );
			}

			query = query.replace( /\{LANGUAGE\}/g, $.i18n && $.i18n().locale || 'en' );
		}

		return query;
	};

	/**
	 * @private
	 */
	SELF.prototype._searchEntitiesSparql = function( term, type, triple, sparql ) {
		var deferred = $.Deferred();

		var query = this._searchEntitiesSparqlCreateQuery( term, type, triple, sparql );
		if ( !query ) {
			return deferred.resolve( [] ).promise();
		}

		this._sparqlApi.query( query, SPARQL_TIMEOUT ).done( function( data ) {
			var r = data.results.bindings.map( function( d ) {
				var id = d.id.value.split( '/' ).pop(),
					propertyId = d.property && d.property.value.split( '/' ).pop() || null;
				return {
					id: id,
					text: d.label.value,
					data: {
						id: id,
						propertyId: propertyId,
						description: d.description && d.description.value || '',
						rank: d.rank && d.rank.value || null
					}
				};
			} );

			deferred.resolve( r );
		} ).always( function () {
			deferred.resolve( [] );
		} );

		return deferred.promise();
	};

	/**
	 * @private
	 */
	SELF.prototype._searchEntities = function( term, type ) {
		var deferred = $.Deferred();

		if ( !term || term.trim() === '' ) {
			return deferred.resolve( [] ).promise();
		}

		this._api.searchEntities( term, type ).done( function( data ) {
			var r = data.search.map( function( d ) {
				return {
					id: d.id,
					text: d.label,
					data: d
				};
			} );
			deferred.resolve( r );
		} );

		return deferred.promise();
	};

	/**
	 * @private
	 */
	SELF.prototype._renderSelect2 = function( $select, $element, triple ) {
		var formatter = function( item, li ) {
				if ( !item.data ) {
					return item.text;
				}

				return $( '<span><b>' + item.text + ' (' + item.data.id + ')' + '</b></span><br/><small>' +
						item.data.description + '</small>' );

			},
			transport = this._createLookupService( $element, triple );

		$select.select2( {
			width: 'auto',
			templateResult: formatter,
			ajax: {
				delay: 250,
				transport: transport
			},
			cache: true
		} );
	};

	return SELF;
}( jQuery, wikibase ) );
