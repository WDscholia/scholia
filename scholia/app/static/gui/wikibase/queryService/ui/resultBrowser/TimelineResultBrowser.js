var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.resultBrowser = wikibase.queryService.ui.resultBrowser || {};

wikibase.queryService.ui.resultBrowser.TimelineResultBrowser = ( function( $, vis, window, _ ) {
	'use strict';

	var TIMELINE_OPTIONS = {
		minHeight: '400px',
		orientation: {
			axis: 'both',
			item: 'top'
		},
		align: 'auto',
		zoomKey: 'ctrlKey'
	};

	/**
	 * A result browser for dateTime
	 *
	 * @class wikibase.queryService.ui.resultBrowser.TimelineResultBrowser
	 * @licence GNU GPL v2+
	 *
	 * @author Jonas Kress
	 * @constructor
	 *
	 */
	function SELF() {
	}

	SELF.prototype = new wikibase.queryService.ui.resultBrowser.AbstractResultBrowser();

	/**
	 * Draw to the given element
	 *
	 * @param {jQuery} $element target element
	 */
	SELF.prototype.draw = function( $element ) {
		var $container = $( '<div>' );

		var timeline = new vis.Timeline( $container[0], this._getItems(), TIMELINE_OPTIONS );
		// copy width to min-width for T163984 hack
		timeline.on(
			'changed',
			function() {
				$( timeline.dom.root )
					.find( '.vis-item.vis-range' )
					.each(
						function() {
							var $this = $( this );
							/*
							 * First unset the min-width, so that $this.css( 'width' ) below returns the original width calculated by the timeline.
							 * Otherwise, repeated calls of this function would only ever increase the min-width, but never decrease it:
							 * .css() returns the *computed* style, i.e. min(width, min-width) if we don't unset min-width.
							 */
							$this.css( 'min-width', 'unset' );
							/*
							 * Now set the min-width to the width calculated by the timeline,
							 * so that wide time ranges are not shortened when the CSS hack for T163984 unsets the width.
							 * (Unsetting the width lets the browser expand the time range to fit its text content,
							 * but if the range is already wide enough for that, we don’t want the browser to shorten it.)
							 */
							$this.css( 'min-width', $this.css( 'width' ) );
						}
					);
			}
		);
		$element.append( $container.prepend( this._createToolbar( timeline ) ) );
	};

	/**
	 * @private
	 */
	SELF.prototype._getItems = function() {
		var self = this,
			items = [];

		this._iterateResult( function( field, key, row, rowIndex ) {
			if ( self._getFormatter().isDateTime( field ) ) {
				if ( !items[rowIndex] ) {// create new
					items[rowIndex] = {
						id: rowIndex,
						content: self._getHtml( row ).html(),
						start: self._getFormatter().parseDate( field.value )
					};
				} else { // create time span with start and end date
					var dates = [];
					dates.push( self._getFormatter().parseDate( field.value ) );
					if ( items[rowIndex].start ) {
						dates.push( items[rowIndex].start );
					}
					if ( items[rowIndex].end ) {
						dates.push( items[rowIndex].end );
					}

					items[rowIndex].start = dates.reduce( function( a, b ) {
						return a < b ? a : b;
					} );
					items[rowIndex].end = dates.reduce( function( a, b ) {
						return a > b ? a : b;
					} );
				}
			}
		} );

		return new vis.DataSet( _.compact( items ) );
	};

	/**
	 * @private
	 */
	SELF.prototype._getHtml = function( row ) {
		var $result = $( '<div/>' ).append( this._getFormatter().formatRow( row, true ) );

		return $result;
	};

	/**
	 * @private
	 */
	SELF.prototype._createToolbar = function( timeline ) {
		var $toolbar = $( '<div style="margin-top: -35px; text-align: center;">' );

		$( '<a class="btn btn-default">' ).click( $.proxy( timeline.redraw, timeline ) ).append(
				'<span class="glyphicon glyphicon-resize-vertical" aria-hidden="true"></span>' )
				.appendTo( $toolbar );
		$( '<a class="btn btn-default">' ).click( $.proxy( timeline.fit, timeline ) ).append(
				'<span class="glyphicon glyphicon-resize-horizontal" aria-hidden="true"></span>' )
				.appendTo( $toolbar );

		function zoom( percentage ) {
			var range = timeline.getWindow(),
				interval = range.end - range.start;

			timeline.setWindow( {
				start: range.start.valueOf() - interval * percentage,
				end: range.end.valueOf() + interval * percentage
			} );
		}

		$( '<a class="btn btn-default">' ).click( function() {
			zoom( 0.2 );
		} ).append( '<span class="glyphicon glyphicon-zoom-out" aria-hidden="true"></span>' )
				.appendTo( $toolbar );

		$( '<a class="btn btn-default">' ).click( function() {
			zoom( -0.2 );
		} ).append( '<span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>' )
				.appendTo( $toolbar );

		return $toolbar;
	};

	/**
	 * Receiving data from the a visit
	 *
	 * @param {Object} data
	 * @return {boolean} false if there is no revisit needed
	 */
	SELF.prototype.visit = function( data ) {
		if ( this._getFormatter().isDateTime( data ) ) {
			this._drawable = true;
			return false;
		}
		return true;
	};

	return SELF;
}( jQuery, vis, window, _ ) );
