var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.resultBrowser = wikibase.queryService.ui.resultBrowser || {};

wikibase.queryService.ui.resultBrowser.BubbleChartResultBrowser = ( function( $, d3, window ) {
	'use strict';

	/**
	 * A bubble chart result browser
	 *
	 * @class wikibase.queryService.ui.resultBrowser.BubbleChartResultBrowser
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
	 * @property {boolean}
	 * @private
	 */
	SELF.prototype._hasLabel = false;

	/**
	 * @property {boolean}
	 * @private
	 */
	SELF.prototype._hasNumber = false;

	/**
	 * Draw browser to the given element
	 *
	 * @param {jQuery} $element to draw at
	 */
	SELF.prototype.draw = function( $element ) {
		var self = this,
			data = { 'name': 'bubblechart', 'children': [] },
			labelKey = this._getLabelColumns()[0],
			numberKey = this._getNumberColumns()[0],
			prevRow = null;

		this._iterateResult( function( field, key, row ) {

			if ( row !== prevRow ) {
				var item = {
					url: null
				};
				prevRow = row;

				if ( row.rgb && self._getFormatter().isColor( row.rgb ) ) {
					item.color = self._getFormatter().getColorForHtml( row.rgb );
				}

				if ( row[labelKey] && row[numberKey] ) {
					item.name = row[labelKey].value;
					item.size = row[numberKey].value;
					data.children.push( item );
				}
			}

			if ( field && field.value && self._getFormatter().isEntityUri( field.value ) ) {
				var createdItem = data.children[data.children.length - 1];
				if ( createdItem && createdItem.url === null ) {
					createdItem.url = field.value;
				}
			}
		} );

		var $wrapper = $( '<center>' );
		$element.html( $wrapper );

		this._drawBubbleChart( $wrapper, data );
	};

	SELF.prototype._drawBubbleChart = function( $element, root ) {
		var self = this;

		function classes( root ) {
			var classes = [];
			function recurse( name, node ) {
				if ( node.children ) {
					node.children.forEach( function( child ) {
						recurse( node.name, child );
					} );
				} else {
					classes.push( {
						packageName: name,
						className: node.name,
						value: node.size,
						url: node.url,
						color: node.color
					} );
				}
			}
			recurse( null, root );
			return {
				children: classes
			};
		}

		var diameter = Math.min( $( window ).height() * 0.98, $( window ).width() ),
			color = d3.scale.category20c(),
			bubble = d3.layout.pack().sort( null ).size( [ diameter, diameter ] ).padding( 1.5 );

		var svg = d3.select( $element[0] ).append( 'svg' ).attr( {
			'class': 'bubble',
			width: diameter,
			height: diameter
		} );

		var node = svg.selectAll( '.node' ).data(
				bubble.nodes( classes( root ) ).filter( function( d ) {
					return !d.children;
				} ) ).enter().append( 'g' ).attr( 'class', 'node' ).attr( 'transform',
				function( d ) {
					return 'translate(' + d.x + ',' + d.y + ')';
				} );

		node.append( 'title' ).text( function( d ) {
			return d.className + ': ' + d.value;
		} );

		node.append( 'circle' ).attr( 'r', function( d ) {
			return d.r;
		} ).style( 'fill', function( d ) {
			return d.color || color( d.className );
		} );

		node.append( 'text' ).attr( 'dy', '.3em' ).style( 'text-anchor', 'middle' ).text(
				function( d ) {
					return d.className.substring( 0, d.r / 4 );
				} ).on( 'click', function( d ) {
			if ( d.url ) {
				window.open( d.url, '_blank' );
			}
		} ).style( 'fill', function( d ) {
			if ( d.color ) {
				return self._getFormatter().calculateLuminance( d.color ) <= 0.5 ? '#FFF' : '#000';
			}
		} ).style( 'cursor', 'pointer' );
	};

	/**
	 * Checks whether the browser can draw the given result
	 *
	 * @return {boolean}
	 */
	SELF.prototype.isDrawable = function() {
		return this._hasLabel && this._hasNumber;
	};

	/**
	 * Receiving data from the a visit
	 *
	 * @param {Object} data
	 * @return {boolean} false if there is no revisit needed
	 */
	SELF.prototype.visit = function( data ) {
		return this._checkColumn( data );
	};

	/**
	 * Check if this value contains an numeric value.
	 *
	 * @param {Object} value
	 * @return {boolean}
	 * @private
	 */
	SELF.prototype._checkColumn = function( value ) {
		if ( this._getFormatter().isNumber( value ) ) {
			this._hasNumber = true;
		}

		if ( this._getFormatter().isLabel( value ) ) {
			this._hasLabel = true;
		}

		return !this.isDrawable();
	};

	return SELF;
}( jQuery, d3, window ) );
