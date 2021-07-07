var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.resultBrowser = wikibase.queryService.ui.resultBrowser || {};

wikibase.queryService.ui.resultBrowser.GraphResultBrowserNodeBrowser = ( function( $, vis, window, _ ) {
	'use strict';

	var SPARQL_PROPERTIES = 'SELECT ?p (SAMPLE(?pl) AS ?pl_) (COUNT(?o) AS ?count ) (group_concat(?ol;separator=", ") AS ?ol_)  WHERE {'
			+ '<{entityUri}> ?p ?o .'
			+ '   ?o <http://www.w3.org/2000/01/rdf-schema#label> ?ol .'
			+ '    FILTER ( LANG(?ol) = "[AUTO_LANGUAGE]" )'
			+ '    ?s <http://wikiba.se/ontology#directClaim> ?p .' + '    ?s rdfs:label ?pl .'
			+ '    FILTER ( LANG(?pl) = "[AUTO_LANGUAGE]" )' + '} group by ?p';

	var SPARQL_ENTITES = 'SELECT ?o ?ol WHERE {'
			+ '<{entityUri}> <{propertyUri}> ?o .'
			+ '?o <http://www.w3.org/2000/01/rdf-schema#label> ?ol .'
			+ 'FILTER ( LANG(?ol) = "[AUTO_LANGUAGE]" )' + '} LIMIT 50';

	var SPARQL_PROPERTIES_INCOMING = 'SELECT ?p (SAMPLE(?pl) AS ?pl_) (COUNT(?o) AS ?count ) (group_concat(?ol;separator=", ") AS ?ol_)  WHERE {'
			+ '?o ?p <{entityUri}> .'
			+ '   ?o <http://www.w3.org/2000/01/rdf-schema#label> ?ol .'
			+ '    FILTER ( LANG(?ol) = "[AUTO_LANGUAGE]" )'
			+ '    ?s <http://wikiba.se/ontology#directClaim> ?p .' + '    ?s rdfs:label ?pl .'
			+ '    FILTER ( LANG(?pl) = "[AUTO_LANGUAGE]" )' + '} group by ?p';

	var SPARQL_ENTITES_INCOMING = 'SELECT ?o ?ol WHERE {'
			+ '?o <{propertyUri}> <{entityUri}> .'
			+ '?o <http://www.w3.org/2000/01/rdf-schema#label> ?ol .'
			+ 'FILTER ( LANG(?ol) = "[AUTO_LANGUAGE]" )' + '} LIMIT 50';

	var EXPAND_TYPE_INCOMING = 'incoming';

	var EXPAND_TYPE_OUTGOING = 'outgoing';
	/**
	 * A browser for network nodes
	 *
	 * @constructor
	 * @param {DataSet} nodes
	 * @param {DataSet} edges
	 * @param {wikibase.queryService.api.Sparql} sparqlApi
	 */
	function SELF( nodes, edges, sparqlApi ) {
		this._nodes = nodes;
		this._incomingNodes = nodes;
		this._edges = edges;
		this._incomingEdges = edges;
		this._sparql = sparqlApi;
	}

	/**
	 * @property {DataSet}
	 * @private
	 */
	SELF.prototype._incomingNodes = null;

	/**
	 * @property {DataSet}
	 * @private
	 */
	SELF.prototype._nodes = null;

	/**
	 * @property {DataSet}
	 * @private
	 */
	SELF.prototype._sparql = null;

	/**
	 * @property {string}
	 * @private
	 */
	SELF.prototype._selectedNodeId = null;

	/**
	 * @property {object}
	 * @private
	 */
	SELF.prototype._temporaryNodes = {};

	/**
	 * @property {object}
	 * @private
	 */
	SELF.prototype._incomingTemporaryNodes = {};

	/**
	 * @property {object}
	 * @private
	 */
	SELF.prototype._temporaryEdges = {};

	/**
	 * @property {object}
	 * @private
	 */
	SELF.prototype._incomingTemporaryEdges = {};

	/**
	 * @private
	 */
	SELF.prototype._getEntites = function( entityUri, propertyUri ) {
		var self = this;

		return this._sparql.query(
				SPARQL_ENTITES.replace( '{entityUri}', entityUri ).replace( '{propertyUri}',
						propertyUri ) ).then( function() {
			var data = self._sparql.getResultRawData();
			var result = [];

			$.each( data.results.bindings, function( i, row ) {
				result.push( {
					id: row.o.value,
					label: row.ol.value
				} );
			} );

			return result;
		} );
	};

	/**
	 * @private
	 */
	SELF.prototype._getIncomingEntites = function( entityUri, propertyUri ) {
		var self = this;

		return this._sparql.query(
				SPARQL_ENTITES_INCOMING.replace( '{entityUri}', entityUri ).replace( '{propertyUri}',
						propertyUri ) ).then( function() {
            var data = self._sparql.getResultRawData();
			var result = [];

			$.each( data.results.bindings, function( i, row ) {
				result.push( {
					id: row.o.value,
					label: row.ol.value
				} );
			} );

			return result;
		} );
	};

	/**
	 * @private
	 */
	SELF.prototype._getProperties = function( entityUri ) {
		var self = this;

		return this._sparql.query( SPARQL_PROPERTIES.replace( '{entityUri}', entityUri ) ).then(
				function() {
					var data = self._sparql.getResultRawData();
					var result = [];

					$.each( data.results.bindings, function( i, row ) {
						result.push( {
							id: row.p.value,
							label: row.pl_.value,
							count: row.count.value,
							items: row.ol_.value
						} );
					} );

					return result;
				} );
	};

	/**
	 * @private
	 */
	SELF.prototype._getIncomingProperties = function( entityUri ) {
		var self = this;

		return this._sparql.query( SPARQL_PROPERTIES_INCOMING.replace( '{entityUri}', entityUri ) ).then(
				function() {
					var data = self._sparql.getResultRawData();
					var result = [];

					$.each( data.results.bindings, function( i, row ) {
						result.push( {
							id: row.p.value,
							label: row.pl_.value,
							count: row.count.value,
							items: row.ol_.value
						} );
					} );

					return result;
				} );
	};

	/**
	 * @private
	 */
	SELF.prototype._removeTemporaryNodes = function( entityUri ) {
		var self = this;

		$.each( this._temporaryNodes, function( i, n ) {
			self._nodes.remove( n.id );
		} );
		$.each( this._temporaryEdges, function( i, e ) {
			self._edges.remove( e.id );
		} );

		this._temporaryNodes = {};
		this._temporaryEdges = {};
	};

	/**
	 * @private
	 */
	SELF.prototype._removeIncomingTemporaryNodes = function( entityUri ) {
		var self = this;

		$.each( this._incomingTemporaryNodes, function( i, n ) {
			self._incomingNodes.remove( n.id );
		} );
		$.each( this._incomingTemporaryEdges, function( i, e ) {
			self._incomingEdges.remove( e.id );
		} );

		this._incomingTemporaryNodes = {};
		this._incomingTemporaryEdges = {};
	};

	/**
	 * @private
	 */
	SELF.prototype._expandPropertyNode = function( nodeId ) {
		var self = this,
			node = this._temporaryNodes[nodeId];
		var expandedNode = self._nodes.get( nodeId );

		this._getEntites( node.entityId, node.id ).then( function( entites ) {

			$.each( entites, function( i, e ) {
				if ( self._nodes.get( e.id ) === null ) {
					self._nodes.add( {
						id: e.id,
						label: e.label,
						type: EXPAND_TYPE_OUTGOING
					} );
				}
				self._edges.add( {
					dashes: true,
					from: node.entityId,
					to: e.id,
					label: node.propertyLabel,
					linkType: node.id,
					type: EXPAND_TYPE_OUTGOING
				} );
			} );

			if ( expandedNode.label > 50 ) {
				self._getRemainingOutgoingNodes( node, expandedNode );
			}
		}, window.console.error );
	};

	/**
	 * @private
	 */
	SELF.prototype._getRemainingOutgoingNodes = function( node, expandedNode ) {
		var self = this;
		var remainingResults = expandedNode.label - 50;
		self._incomingNodes.add( {
			id: 'remaining',
			label: '+' + remainingResults + ' results ',
			color: '#e3eed9',
			type: EXPAND_TYPE_OUTGOING
		} );
		self._incomingEdges.add( {
			dashes: true,
			from: 'remaining',
			to: node.entityId,
			linkType: node.id,
			type: EXPAND_TYPE_OUTGOING
		} );
	};

	/**
	 * @private
	 */
	SELF.prototype._expandIncomingPropertyNode = function( nodeId ) {
		var self = this,
			node = this._incomingTemporaryNodes[nodeId];
		var expandedNode = self._incomingNodes.get( nodeId );

		this._getIncomingEntites( node.entityId, node.id ).then( function( entites ) {
			$.each( entites, function( i, e ) {
				if ( self._incomingNodes.get( e.id ) === null ) {
					self._incomingNodes.add( {
						id: e.id,
						label: e.label,
						type: EXPAND_TYPE_INCOMING
					} );
				}
				self._incomingEdges.add( {
					dashes: true,
					from: e.id,
					to: node.entityId,
					label: node.propertyLabel,
					linkType: node.id,
					type: EXPAND_TYPE_INCOMING
				} );
			} );

			if ( expandedNode.label > 50 ) {
				self._getRemainingIncomingNodes( node, expandedNode );
			}
		}, window.console.error );
	};

	/**
	 * @private
	 */
	SELF.prototype._getRemainingIncomingNodes = function( node, expandedNode ) {
		var self = this;
		var remainingResults = expandedNode.label - 50;
		self._incomingNodes.add( {
			id: 'remaining',
			label: '+' + remainingResults + ' results ',
			color: '#e3eed9',
			type: EXPAND_TYPE_INCOMING
		} );
		self._incomingEdges.add( {
			dashes: true,
			from: 'remaining',
			to: node.entityId,
			linkType: node.id,
			type: EXPAND_TYPE_INCOMING
		} );
	};

	/**
	 * @private
	 */
	SELF.prototype._expandEntityNode = function( nodeId ) {
		var self = this;

		this._getProperties( nodeId ).then( function( properties ) {
			$.each( properties, function( i, p ) {
				//if already expanded skip
				if ( self._edges.get( {
					filter: function( e ) {
						return e.linkType === p.id && e.from === nodeId && e.type === EXPAND_TYPE_OUTGOING;
					}
				} ).length > 0 ) {
					return;
				}

				var node = {
					id: p.id,
					label: p.count === '1' ? p.items : p.count,
					title: p.items,
					entityId: nodeId,
					propertyLabel: p.label,
					color: '#abc9f2',
					type: EXPAND_TYPE_OUTGOING
				};
				var edge = {
					id: p.id,
					dashes: true,
					label: p.label,
					from: nodeId,
					to: p.id,
					type: EXPAND_TYPE_OUTGOING
				};
				self._temporaryNodes[node.id] = node;
				self._nodes.add( node );

				self._temporaryEdges[edge.id] = edge;
				self._edges.add( edge );
			} );
		}, window.console.error );
	};

	/**
	 * @private
	 */
	SELF.prototype._expandIncomingEntityNode = function( nodeId ) {
		var self = this;

		this._getIncomingProperties( nodeId ).then( function( properties ) {
			$.each( properties, function( i, p ) {
				// if already expanded skip
				if ( self._incomingEdges.get( {
					filter: function( e ) {
						return e.linkType === p.id && e.to === nodeId && e.type === EXPAND_TYPE_INCOMING;
					}
				} ).length > 0 ) {
					return;
				}

				var node = {
					id: p.id,
					label: p.count === '1' ? p.items : p.count,
					title: p.items,
					entityId: nodeId,
					propertyLabel: p.label,
					color: '#abc9f2',
					type: EXPAND_TYPE_INCOMING
				};
				var edge = {
					id: p.id,
					dashes: true,
					label: p.label,
					from: p.id,
					to: nodeId,
					type: EXPAND_TYPE_INCOMING
				};
				self._incomingTemporaryNodes[node.id] = node;
				self._incomingNodes.add( node );

				self._incomingTemporaryEdges[edge.id] = edge;
				self._incomingEdges.add( edge );
			} );
		}, window.console.error );
	};

	/**
	 * Browse a node
	 *
	 * @param {string} nodeId
	 */
	SELF.prototype.browse = function( nodeId, expandType ) {
        if ( expandType === EXPAND_TYPE_OUTGOING ) {
            this.handleOutgoingNodes( nodeId );
        } else {
			this.handleIncomingNodes( nodeId );
		}
	};

	/**
	 * @private
	 */
	SELF.prototype.handleOutgoingNodes = function( nodeId ) {
		this._removeIncomingTemporaryNodes();
			if ( nodeId === null ) {
					this._removeTemporaryNodes();
					return;
			}

			if ( this._temporaryNodes[nodeId] ) {
				this._expandPropertyNode( nodeId );
				this._removeTemporaryNodes();
				return;
			}

			if ( this._selectedNodeId !== null && nodeId !== this._selectedNodeId ) {
				this._removeTemporaryNodes();
			}
			this._expandEntityNode( nodeId );
			this._selectedNodeId = nodeId;
	};

	/**
	 * @private
	 */
	SELF.prototype.handleIncomingNodes = function( nodeId ) {
		this._removeTemporaryNodes();
			if ( nodeId === null ) {
				this._removeIncomingTemporaryNodes();
				return;
			}

			if ( this._incomingTemporaryNodes[nodeId] ) {
				this._expandIncomingPropertyNode( nodeId );
				this._removeIncomingTemporaryNodes();
				return;
			}

			if ( this._selectedNodeId !== null && nodeId !== this._selectedNodeId ) {
				this._removeIncomingTemporaryNodes();
			}
			this._expandIncomingEntityNode( nodeId );
			this._selectedNodeId = nodeId;
	};

	return SELF;
}( jQuery, vis, window, _ ) );
