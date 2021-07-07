var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.resultBrowser = wikibase.queryService.ui.resultBrowser || {};

wikibase.queryService.ui.resultBrowser.MultiDimensionResultBrowser = ( function( $, d3, window ) {
	'use strict';

	var TIME_DATATYPE = 'http://www.w3.org/2001/XMLSchema#dateTime';
	/**
	 * A result browser for multi dimensional data
	 *
	 * @class wikibase.queryService.ui.resultBrowser.MultiDimensionResultBrowser
	 * @license GNU GPL v2+
	 *
	 * @author Jonas Kress
	 *
	 * @constructor
	 */
	function SELF() {
	}

	SELF.prototype = new wikibase.queryService.ui.resultBrowser.AbstractChartResultBrowser();

	/**
	 * Draw browser to the given element
	 *
	 * @param {jQuery} $element to draw at
	 */
	SELF.prototype.draw = function( $element ) {
		var dimensions = {},
			data = [],
			f = this._getFormatter();

		this._iterateResult( function( field, key, row, rowNum ) {
			if ( !data[rowNum] ) {
				data[rowNum] = {};
			}

			data[rowNum][key] = field && field.value || 'undefined';
			if ( field && field.type === TIME_DATATYPE ) {
				data[rowNum][key] = new Date( field.value ).toLocaleDateString();
			}

			if ( !dimensions[key] ) {
				var d = {
					key: key,
					description: key,
					type: 'STRING'
				};
				if ( f.isNumber( field ) ) {
					d.type = 'NUMBER';
				}
				if ( field && field.type === TIME_DATATYPE ) {
					d.type = 'DATE';
				}
				dimensions[key] = d;
			}
		} );

		this._draw( $element, data, _.values( dimensions ) );

		$element.children( 'svg' ).css( {
			display: 'block'
		} );
	};

	SELF.prototype._draw = function( $graph, data, dimensions ) {
		// source: http://bl.ocks.org/syntagmatic/94be812f8b410ae29ee2

		var margin = {
				top: 50,
				right: 80,
				bottom: 10,
				left: 100
			},
			width = $( window ).width() - ( margin.left + margin.right ),
			height = $( window ).height() - ( margin.top + margin.bottom );

		var types = {
			'NUMBER': {
				key: 'Number',
				coerce: function( d ) {
					return +d;
				},
				extent: d3.extent,
				within: function( d, extent ) {
					return extent[0] <= d && d <= extent[1];
				},
				defaultScale: d3.scale.linear().range( [ height, 0 ] )
			},
			'STRING': {
				key: 'String',
				coerce: String,
				extent: function( data ) {
					return data.sort();
				},
				within: function( d, extent, dim ) {
					return extent[0] <= dim.scale( d ) && dim.scale( d ) <= extent[1];
				},
				defaultScale: d3.scale.ordinal().rangePoints( [ 0, height ] )
			},
			'DATE': {
				key: 'Date',
				coerce: function( d ) {
					return new Date( d );
				},
				extent: d3.extent,
				within: function( d, extent ) {
					return extent[0] <= d && d <= extent[1];
				},
				defaultScale: d3.time.scale().range( [ 0, height ] )
			}
		};

		$.each( dimensions, function() {
			this.type = types[this.type];
		} );

		var x = d3.scale.ordinal().domain( dimensions.map( function( dim ) {
			return dim.key;
		} ) ).rangePoints( [ 0, width ] );

		var line = d3.svg.line().defined( function( d ) {
			return !isNaN( d[1] );
		} );

		var yAxis = d3.svg.axis().orient( 'left' );

		var svg = d3.select( $graph[0] )
			.append( 'svg' ).attr( {
				width: width + margin.left + margin.right,
				height: height + margin.top + margin.bottom
			} )
			.append( 'g' ).attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')' );

		var foreground = svg.append( 'g' ).attr( 'class', 'foreground' );

		var axes = svg.selectAll( '.axis' ).data( dimensions ).enter().append( 'g' ).attr( 'class',
				'axis' ).attr( 'transform', function( d ) {
			return 'translate(' + x( d.key ) + ')';
		} );

		data.forEach( function( d ) {
			dimensions.forEach( function( p ) {
				d[p.key] = p.type.coerce( d[p.key] );
			} );
		} );

		function draw( d ) {
			return line( dimensions.map( function( dim ) {
				return [
						x( dim.key ), dim.scale( d[dim.key] )
				];
			} ) );
		}

		function brushstart() {
			d3.event.sourceEvent.stopPropagation();
		}

		// Handles a brush event, toggling the display of foreground lines.
		function brush() {
			var actives = dimensions.filter( function( p ) {
					return !p.brush.empty();
				} ),
				extents = actives.map( function( p ) {
					return p.brush.extent();
				} );

			d3.selectAll( '.foreground path' ).style( 'display', function( d ) {
				if ( actives.every( function( dim, i ) {
					// test if point is within extents for each active brush
					return dim.type.within( d[dim.key], extents[i], dim );
				} ) ) {
					return null;
				}
				return 'none';
			} );
		}

		// type/dimension default setting happens here
		dimensions.forEach( function( dim ) {
			if ( !( 'domain' in dim ) ) {
				// detect domain using dimension type's extent function
				dim.domain = d3.functor( dim.type.extent )( data.map( function( d ) {
					return d[dim.key];
				} ) );

				// TODO - this line only works because the data encodes data with integers
				// Sorting/comparing should be defined at the type/dimension level
				dim.domain.sort( function( a, b ) {
					return a - b;
				} );
			}
			if ( !( 'scale' in dim ) ) {
				// use type's default scale for dimension
				dim.scale = dim.type.defaultScale.copy();
			}
			dim.scale.domain( dim.domain );
		} );

		foreground.selectAll( 'path' ).data( data ).enter().append( 'path' ).attr( 'd', draw )
				.style( 'stroke', function( d ) {
					return '#6ac';
				} );

		axes.append( 'g' ).attr( 'class', 'axis' ).each( function( d ) {
			var renderAxis = ( d.axis && d.axis.scale( d.scale ) ) // custom axis
				|| yAxis.scale( d.scale ); // default axis
			d3.select( this ).call( renderAxis );
		} ).append( 'text' ).attr( 'class', 'title' ).attr( 'text-anchor', 'start' ).text(
				function( d ) {
					return d.description || d.key;
				} );

		// Add and store a brush for each axis.
		axes.append( 'g' ).attr( 'class', 'brush' ).each(
				function( d ) {
					d3.select( this ).call(
							d.brush = d3.svg.brush().y( d.scale ).on( 'brushstart', brushstart )
									.on( 'brush', brush ) );
				} ).selectAll( 'rect' ).attr( 'x', -8 ).attr( 'width', 16 );
	};

	/**
	 * Checks whether the browser can draw the given result
	 *
	 * @return {boolean}
	 */
	SELF.prototype.isDrawable = function() {
		return this._drawable;
	};

	/**
	 * Receiving data from the visit
	 *
	 * @param {Object} data
	 * @return {boolean} false if there is no revisit needed
	 */
	SELF.prototype.visit = function( data ) {
		this._drawable = true;
		return false;
	};

	return SELF;
}( jQuery, d3, window ) );
