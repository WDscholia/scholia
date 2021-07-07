var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.resultBrowser = wikibase.queryService.ui.resultBrowser || {};

wikibase.queryService.ui.resultBrowser.TreeMapResultBrowser = ( function( $, d3, window ) {
	'use strict';

	/**
	 * A treemap result browser
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
	 * @property {Object}
	 * @private
	 */
	SELF.prototype._labelColumns = null;

	/**
	 * Draw browser to the given element
	 *
	 * @param {jQuery} $element to draw at
	 */
	SELF.prototype.draw = function( $element ) {
		var self = this,
			data = {},
			layer = data,
			size = null,
			url = null,
			prevRow = null;

		this._iterateResult( function( field, key, row ) {
			if ( row !== prevRow ) {
				if ( prevRow !== null ) {
					layer.data = {
						size: size,
						url: url
					};
					size = null;
					url = null;
					layer = data;
				}

				prevRow = row;
			}

			if ( self._getFormatter().isLabel( field ) ) {
				if ( !layer[field.value] ) {
					layer[field.value] = {};
				}
				layer = layer[field.value];
			}
			if ( self._getFormatter().isNumber( field ) ) {
				size = field.value;
			}
			if ( field && field.value && self._getFormatter().isEntityUri( field.value ) ) {
				url = field.value;
			}
		} );

		layer.data = {
			size: size,
			url: url
		};

		var children = this._createTreeData( data );
		var treeData = {
			name: 'treeMap',
			children: children
		};

		this._draw( $element, treeData );
	};

	SELF.prototype._createTreeData = function( data ) {
		var self = this,
			nodes = [],
			node;

		if ( data.data ) {
			return nodes;
		}

		$.each( data, function( key, value ) {
			var children = self._createTreeData( value );

			if ( children.length !== 0 ) {
				node = {
					id: key,
					name: key,
					children: children
				};
			} else {
				var size = 1;
				if ( value.data.size && value.data.size > 0 ) {
					size = value.data.size;
				}
				var id = key;
				var url = value.data.url;
				if ( url ) {
					id = url;
				}

				node = {
					id: id + Math.random(),
					name: key,
					size: size,
					url: url
				};
			}
			nodes.push( node );
		} );

		return nodes;
	};

	/* jshint ignore:start */
	SELF.prototype._draw = function( $element, data ) {
		// copied from http://www.billdwhite.com/wordpress/wp-content/js/treemap_headers_03.html
		// with little modification

		var supportsForeignObject = false;// FIXME:Modernizr.svgforeignobject;
		var chartWidth = $( window ).width(),
			chartHeight = $( window ).height(),
			xscale = d3.scale.linear().range( [ 0, chartWidth ] ),
			yscale = d3.scale.linear().range( [ 0, chartHeight ] ),
			color = d3.scale.category10(),
			headerHeight = 20,
			headerColor = '#555555',
			transitionDuration = 500,
			root,
			node;

		var treemap = d3.layout.treemap().round( false ).size( [ chartWidth, chartHeight ] )
				.sticky( true ).value( function( d ) {
					return d.size;
				} );

		var chart = d3.select( $element[0] ).append( 'svg:svg' ).attr( 'width', chartWidth ).attr(
				'height', chartHeight ).append( 'svg:g' );

		node = root = data;
		var nodes = treemap.nodes( root );

		var children = nodes.filter( function( d ) {
			return !d.children;
		} );
		var parents = nodes.filter( function( d ) {
			return d.children;
		} );

		// create parent cells
		var parentCells = chart.selectAll( 'g.cell.parent' ).data( parents, function( d ) {
			return 'p-' + d.id;
		} );
		var parentEnterTransition = parentCells.enter().append( 'g' ).attr( 'class', 'cell parent' )
				.on( 'click', function( d ) {
					zoom( d );
				} );
		parentEnterTransition.append( 'rect' ).attr( 'width', function( d ) {
			return Math.max( 0.01, d.dx );
		} ).attr( 'height', headerHeight ).style( 'fill', headerColor );
		parentEnterTransition.append( 'foreignObject' ).attr( 'class', 'foreignObject' ).append(
				'xhtml:body' ).attr( 'class', 'labelbody' ).append( 'div' ).attr( 'class', 'label' );
		// update transition
		var parentUpdateTransition = parentCells.transition().duration( transitionDuration );
		parentUpdateTransition.select( '.cell' ).attr( 'transform', function( d ) {
			return 'translate(' + d.dx + ',' + d.y + ')';
		} );
		parentUpdateTransition.select( 'rect' ).attr( 'width', function( d ) {
			return Math.max( 0.01, d.dx );
		} ).attr( 'height', headerHeight ).style( 'fill', headerColor );
		parentUpdateTransition.select( '.foreignObject' ).attr( 'width', function( d ) {
			return Math.max( 0.01, d.dx );
		} ).attr( 'height', headerHeight ).select( '.labelbody .label' ).text( function( d ) {
			return d.name;
		} );
		// remove transition
		parentCells.exit().remove();

		// create children cells
		var childrenCells = chart.selectAll( 'g.cell.child' ).data( children, function( d ) {
			return 'c-' + d.id;
		} );
		// enter transition
		var childEnterTransition = childrenCells.enter().append( 'g' ).attr( 'class', 'cell child' )
				.on( 'click', function( d ) {
					zoom( node === d.parent ? root : d.parent );
				} );
		childEnterTransition.append( 'rect' ).classed( 'background', true ).style( 'fill',
				function( d ) {
					return color( d.parent.name );
				} );
		childEnterTransition.append( 'foreignObject' ).attr( {
			'class': 'foreignObject',
			width: function( d ) {
				return Math.max( 0.01, d.dx );
			},
			height: function( d ) {
				return Math.max( 0.01, d.dy );
			}
		} ).append( 'xhtml:body' ).attr( 'class', 'labelbody' ).append( 'div' ).attr( 'class',
				'label' ).text( function( d ) {
			return d.name;
		} ).on( 'click', function( d ) {
			if ( d.url ) {
				window.open( d.url, '_blank' );
				d3.event.stopPropagation();
			}
		} );

		//		        if (supportsForeignObject) {
		//		            childEnterTransition.selectAll(".foreignObject")
		//		                    .style("display", "none");
		//		        } else {
		//		            childEnterTransition.selectAll(".foreignObject .labelbody .label")
		//		                    .style("display", "none");
		//		        }

		// update transition
		var childUpdateTransition = childrenCells.transition().duration( transitionDuration );
		childUpdateTransition.select( '.cell' ).attr( 'transform', function( d ) {
			return 'translate(' + d.x + ',' + d.y + ')';
		} );
		childUpdateTransition.select( 'rect' ).attr( 'width', function( d ) {
			return Math.max( 0.01, d.dx );
		} ).attr( 'height', function( d ) {
			return d.dy;
		} ).style( 'fill', function( d ) {
			return color( d.parent.name );
		} );
		childUpdateTransition.select( '.foreignObject' ).attr( 'width', function( d ) {
			return Math.max( 0.01, d.dx );
		} ).attr( 'height', function( d ) {
			return Math.max( 0.01, d.dy );
		} ).select( '.labelbody .label' ).text( function( d ) {
			return d.name;
		} );
		// exit transition
		childrenCells.exit().remove();

		d3.select( 'select' ).on( 'change', function() {
			console.log( 'select zoom(node)' );
			treemap.value( value == 'size' ? size : count ).nodes( root );
			zoom( node );
		} );

		zoom( node );

		function size( d ) {
			return d.size;
		}

		function count( d ) {
			return 1;
		}

		//and another one
		function textHeight( d ) {
			var ky = chartHeight / d.dy;
			yscale.domain( [ d.y, d.y + d.dy ] );
			return ( ky * d.dy ) / headerHeight;
		}

		function getRGBComponents( color ) {
			var r = color.substring( 1, 3 ),
				g = color.substring( 3, 5 ),
				b = color.substring( 5, 7 );

			return {
				R: parseInt( r, 16 ),
				G: parseInt( g, 16 ),
				B: parseInt( b, 16 )
			};
		}

		function idealTextColor( bgColor ) {
			var nThreshold = 105;
			var components = getRGBComponents( bgColor );
			var bgDelta = ( components.R * 0.299 ) + ( components.G * 0.587 )
					+ ( components.B * 0.114 );
			return ( ( 255 - bgDelta ) < nThreshold ) ? '#000000' : '#ffffff';
		}

		function zoom( d ) {
			treemap.padding( [ headerHeight / ( chartHeight / d.dy ), 0, 0, 0 ] ).nodes( d );

			// moving the next two lines above treemap layout messes up padding of zoom result
			var kx = chartWidth / d.dx;
			var ky = chartHeight / d.dy;
			var level = d;

			xscale.domain( [ d.x, d.x + d.dx ] );
			yscale.domain( [ d.y, d.y + d.dy ] );

			chart.selectAll( '.labelbody .label' ).style( 'display', 'block' );

			//		        if (node != level) {
			//		            if (supportsForeignObject) {
			//		                chart.selectAll(".cell.child .foreignObject")
			//		                        .style("display", "none");
			//		            } else {
			//		                chart.selectAll(".cell.child .foreignObject .labelbody .label")
			//		                        .style("display", "none");
			//		            }
			//		        }

			var zoomTransition = chart.selectAll( 'g.cell' ).transition().duration(
					transitionDuration ).attr( 'transform', function( d ) {
				return 'translate(' + xscale( d.x ) + ',' + yscale( d.y ) + ')';
			} ).each( 'end', function( d, i ) {
				if ( !i && ( level !== self.root ) ) {
					chart.selectAll( '.cell.child' ).filter( function( d ) {
						return d.parent === self.node; // only get the children for selected group
					} ).select( '.foreignObject .labelbody .label' ).style( 'color', function( d ) {
						return idealTextColor( color( d.parent.name ) );
					} );

					if ( supportsForeignObject ) {
						chart.selectAll( '.cell.child' ).filter( function( d ) {
							return d.parent === self.node; // only get the children for selected group
						} ).select( '.foreignObject' ).style( 'display', '' );
					} else {
						chart.selectAll( '.cell.child' ).filter( function( d ) {
							return d.parent === self.node; // only get the children for selected group
						} ).select( '.foreignObject .labelbody .label' ).style( 'display', '' );
					}
				}
			} );

			zoomTransition.select( '.foreignObject' ).attr( 'width', function( d ) {
				return Math.max( 0.01, kx * d.dx );
			} ).attr( 'height', function( d ) {
				return d.children ? headerHeight : Math.max( 0.01, ky * d.dy );
			} ).select( '.labelbody .label' ).text( function( d ) {
				return d.name;
			} );

			// update the width/height of the rects
			zoomTransition.select( 'rect' ).attr( 'width', function( d ) {
				return Math.max( 0.01, kx * d.dx );
			} ).attr( 'height', function( d ) {
				return d.children ? headerHeight : Math.max( 0.01, ky * d.dy );
			} ).style( 'fill', function( d ) {
				return d.children ? headerColor : color( d.parent.name );
			} );

			node = d;

			if ( d3.event ) {
				d3.event.stopPropagation();
			}
		}
	};
	/* jshint ignore:end */

	/**
	 * Checks whether the browser can draw the given result
	 *
	 * @return {boolean}
	 */
	SELF.prototype.isDrawable = function() {
		return Object.keys( this._labelColumns ).length > 1;
	};

	/**
	 * Receiving data from the a visit
	 *
	 * @param {Object} data
	 * @param {string} key
	 * @return {boolean} false if there is no revisit needed
	 */
	SELF.prototype.visit = function( data, key ) {
		return this._checkColumn( data, key );
	};

	/**
	 * @param {Object} value
	 * @param {string} key
	 * @return {boolean}
	 * @private
	 */
	SELF.prototype._checkColumn = function( value, key ) {
		if ( this._getFormatter().isLabel( value, key ) ) {
			this._labelColumns[key] = true;
			return !this.isDrawable();
		}

		return true;
	};

	return SELF;
}( jQuery, d3, window ) );
