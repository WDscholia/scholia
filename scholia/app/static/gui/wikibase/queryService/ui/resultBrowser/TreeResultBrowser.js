var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.resultBrowser = wikibase.queryService.ui.resultBrowser || {};

wikibase.queryService.ui.resultBrowser.TreeResultBrowser = ( function( $, _, window ) {
	'use strict';

	// jscs:disable
	var SPARQL_ITEM_PROPERTIES =  'SELECT ?property ?propertyLabel ?value ?valueItemLabel ?valueImage WHERE {  '  +
	 '     {  '  +
	 '       SELECT ?property ?value ?valueImage ?valueItem WHERE {  '  +
	 '         BIND(<{ENTITY_URI}> AS ?item)  '  +
	 '         ?item ?prop ?value.  '  +
	 '         ?property wikibase:directClaim ?prop.  '  +
	 '         ?property rdf:type wikibase:Property.  '  +
	 '         OPTIONAL { ?value wdt:P18 ?valueImage. }  '  +
	 '         OPTIONAL { BIND(?value AS ?valueItem).  FILTER(STRSTARTS(STR(?value), STR(wd:))) }  '  +
	 '       }  '  +
	 '     }  '  +
	 '     SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }  '  +
	 '  }  ' ;
	// jscs:enable

	/**
	 * A tree result browser
	 *
	 * @class wikibase.queryService.ui.resultBrowser.TreeResultBrowser
	 * @license GNU GPL v2+
	 *
	 * @author Jonas Kress
	 *
	 * @constructor
	 */
	function SELF() {
		this._labelColumns = {};
	}

	SELF.prototype = new wikibase.queryService.ui.resultBrowser.AbstractChartResultBrowser();

	/**
	 * @property {boolean}
	 * @private
	 */
	SELF.prototype._isDrawable = false;

	/**
	 * @property {object}
	 * @private
	 */
	SELF.prototype._jsTree = null;

	/**
	 * @property {object}
	 * @private
	 */
	SELF.prototype._nodes = null;

	/**
	 * Draw browser to the given element
	 *
	 * @param {jQuery} $element to draw at
	 */
	SELF.prototype.draw = function( $element ) {

		var self = this;
		this._nodes = this._extractNodes( $.proxy( this._iterateResult, this )  );

		var $container = $( '<div>' ).jstree( {
			core: {
				data: _.compact( self._nodes ),
				'check_callback': true
			},
			plugins: [
				'types', 'wholerow', 'contextmenu', 'unique'
			],
			types: {
				default: {
					icon: 'glyphicon glyphicon-barcode'
				}
			},
			contextmenu: {
				items: function( $node ) {
					return {
						Open: {
							label: self._nodes[$node.id].url,
							icon: 'glyphicon glyphicon-link',
							action: function() {
								window.open( self._nodes[ $node.id ].url, '_blank' );
							}
						},
						explore: {
							label: self._nodes[$node.id].url,
							icon: 'glyphicon glyphicon-download-alt',
							action: function() {
								self._expandTree( self._nodes[ $node.id ] );
							}
						}

					};
				}
			}
		} );

		this._jsTree = $container.jstree();
		$element.empty().append( $container );
	};

	/**
	 * @private
	 */
	SELF.prototype._extractNodes = function( iterator, parentNode ) {
		var prevRow = null,
			node = {},
			currentNode = null,
			nodes = {},
			format = this._getFormatter();

		iterator( function ( field, key, row ) {
			if ( row !== prevRow ) {
				currentNode = null;
				prevRow = row;
			}

			if ( field && field.value ) {

				if ( currentNode && ( format.isLabel( field ) || format.isNumber( field ) ) ) {
					nodes[currentNode].text = ( nodes[currentNode].text || '' ) + ' ' + field.value;
				}

				if ( currentNode && format.isCommonsResource( field.value ) ) {
					nodes[currentNode].icon = format.getCommonsResourceThumbnailUrl( field.value, 24 );
				}

				if ( format.isEntity( field ) ) {
					node = {};
					node.parent = currentNode ||  parentNode || '#';
					node.id = node.parent + field.value;
					node.url = field.value;
					node.state = { opened: false };

					nodes[node.id] = node;
					currentNode = node.id;
				}
			}

		} );

		return nodes;
	};

	SELF.prototype._expandTree = function( node ) {
		var self = this;

		this.getSparqlApi().query( SPARQL_ITEM_PROPERTIES.replace( '{ENTITY_URI}', node.url ) ).done(
			function() {
				var data = self.getSparqlApi().getResultRawData(),
					iterator = function( cb ) {
						$.each( data.results.bindings, function( rowNum, row ) {
							$.each( data.head.vars, function( rowNum1, key ) {
								var field = row[key] || null;
								cb( field, key, row, rowNum );
							} );
						} );
					},
					nodes = self._extractNodes( iterator, node.id );

				$.extend( self._nodes, nodes );
				$.each( nodes, function ( key, node ) {
					// jscs:disable
					self._jsTree.create_node( node.parent, node );// jshint ignore:line
					// jscs:enable
				} );
			}
		);
	};

	/**
	 * Checks whether the browser can draw the given result
	 *
	 * @return {boolean}
	 */
	SELF.prototype.isDrawable = function() {
		return this._isDrawable;
	};

	/**
	 * Receiving data from the visit
	 *
	 * @param {Object} data
	 * @return {boolean} false if there is no revisit needed
	 */
	SELF.prototype.visit = function( data ) {
		if ( this._getFormatter().isEntity( data ) ) {
			this._isDrawable = true;
			return false;
		}
		return true;
	};

	return SELF;
}( jQuery, _, window ) );
