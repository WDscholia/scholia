var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.resultBrowser = wikibase.queryService.ui.resultBrowser || {};
window.mediaWiki = window.mediaWiki || {};

wikibase.queryService.ui.resultBrowser.AbstractDimpleChartResultBrowser =
	( function( $, _, d3, window, dimple ) {
	'use strict';

	/**
	 * A line dimple chart result browser
	 *
	 * @class wikibase.queryService.ui.resultBrowser.AbstractDimpleChartResultBrowser
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
	 * @property {object}
	 * @private
	 */
	SELF.prototype._dataColumns = null;

	/**
	 * @property {string[]}
	 * @private
	 */
	SELF.prototype._data = null;

	/**
	 * @property {jQuery}
	 * @private
	 */
	SELF.prototype._$element = null;

	/**
	 * @property {HTMLElement}
	 * @private
	 */
	SELF.prototype._svg = null;

	/**
	 * @property {dimple.chart}
	 * @private
	 */
	SELF.prototype._chart = null;

	/**
	 * @property {dimple.legend}
	 * @private
	 */
	SELF.prototype._chartLegend = null;

	/**
	 * @property {string}
	 * @private
	 */
	SELF.prototype._chartSeriesKey = null;

	/**
	 * @property {string}
	 * @private
	 */
	SELF.prototype._chartStoryKey = null;

	/**
	 * @property {boolean}
	 * @private
	 */
	SELF.prototype._isStoryPaused = false;

	/**
	 * Draw browser to the given element
	 *
	 * @param {jQuery} $element to draw at
	 */
	SELF.prototype.draw = function( $element ) {
		var self = this;

		this._$element = $( '<div>' ).css( { width: '100%', height: '100%' } );
		$element.html( this._$element );

		this._createData();
		this._drawSvg();
		this._createChart();
		this._drawChart();
		this._createLegendFilter();

		window.onresize = function() {
			self._drawChart( 250, true );
		};
	};

	SELF.prototype._createData = function() {
		var data = [],
			rowData = {},
			prevRow = null;

		this._iterateResult( function( field, key, row ) {
			if ( prevRow === null ) {
				prevRow = row;
			}

			if ( row !== prevRow ) {
				prevRow = row;
				data.push( rowData );
				rowData = {};
			}

			if ( field && field.value ) {
				rowData[key] = field.value;
			}
		} );

		data.push( rowData );
		this._data = data;
	};

	SELF.prototype._drawSvg = function() {
		this._svg = dimple.newSvg( this._$element[0], '100%', '100%' );
	};

	SELF.prototype._createChart = function() {

		this._chart = new dimple.chart( this._svg, this._data );
		this._chart.setBounds( 0, 0, '100%', '100%' );
		this._chart.setMargins( '5%', '5%', '2%', '25%' );

		this._createChartAxis();

		var series = this._chart.addSeries( this._chartSeriesKey, this._getPlotType() );
		series.addOrderRule( this._chartSeriesKey );
		series.lineMarkers = true;

		if ( this._chartStoryKey ) {
			this._createChartStory();
		}

		this._chartLegend = this._chart.addLegend( '1%', '85%', '100%', '15%' );
	};

	SELF.prototype._getPlotType = function() {
		jQuery.error( 'Method _getPlotType() needs to be implemented!' );
	};

	SELF.prototype._createChartAxis = function() {
		var self = this,
			row = this._getRows()[0],
			formatter = this._getFormatter(),
			chart = this._chart,
			axis = [ 'y', 'x' ],
			hasSeriesAxis = false;

		$.each( this._getColumns(), function( i, key ) {
			if ( axis.length === 0 ) {
				if ( formatter.isLabel( row[key] ) ) {

					if ( !self._chartSeriesKey ) {
						self._chartSeriesKey = key;
						return;
					}
					if ( !self._chartStoryKey ) {
						self._chartStoryKey = key;
						return false;
					}
				}
				return;
			}
			if ( formatter.isLabel( row[key] ) ) {
				chart.addCategoryAxis( axis.pop(), key );
				hasSeriesAxis = true;
			}
			if ( formatter.isNumber( row[key] ) ) {
				chart.addMeasureAxis( axis.pop(), key );
			}
			if ( formatter.isDateTime( row[key] ) ) {
				chart.addTimeAxis( axis.pop(), key, '%Y-%m-%dT%H:%M:%SZ', '%m-%d-%Y' );
				hasSeriesAxis = true;
			}
		} );

		if ( !hasSeriesAxis && !this._chartSeriesKey && chart.axes[0] ) {
			this._chartSeriesKey = chart.axes[0].measure;
		}
	};

	SELF.prototype._createChartStory = function() {
		var self = this,
			story = this._chart.setStoryboard( this._chartStoryKey );

		story.frameDuration = 5 * 1000;
		this._$element.click( function() {
			if ( self._isStoryPaused ) {
				story.startAnimation();
				self._isStoryPaused = false;
				return;
			}

			story.pauseAnimation();
			self._isStoryPaused = true;
		} );
	};

	SELF.prototype._createLegendFilter = function() {
		var self = this,
			filterValues = dimple.getUniqueValues( this._data, this._chartSeriesKey );
		this._chart.legends = [];

		this._chartLegend.shapes.selectAll( 'rect' ).on( 'click', function( e ) {
			var hide = false,
				newFilters = [];

			filterValues.forEach( function( field ) {
				if ( field === e.aggField.slice( -1 )[0] ) {
					hide = true;
				} else {
					newFilters.push( field );
				}
			} );

			d3.select( this ).style( 'opacity', hide ? 0.2 : 0.8 );
			if ( !hide ) {
				newFilters.push( e.aggField.slice( -1 )[0] );
			}
			filterValues = newFilters;

			self._chart.data = dimple.filterData( self._data, self._chartSeriesKey, filterValues );
			self._drawChart( 800 );
		} );
	};

	SELF.prototype._drawChart = function( duration, noDataChange ) {
		var self = this;

		this._chart.draw( duration, noDataChange );

		_.delay( function() {
			self._svg.selectAll( '.dimple-marker,.dimple-marker-back' ).attr( 'r', 2 );
		}, duration * 1.2 );
	};

	/**
	 * Checks whether the browser can draw the given result
	 *
	 * @return {boolean}
	 */
	SELF.prototype.isDrawable = function() {
		return ( Object.keys( this._dataColumns ).length >= 2 );
	};

	/**
	 * Receiving data from the a visit
	 *
	 * @param {Object} value
	 * @param {string} key
	 * @return {boolean} false if there is no revisit needed
	 */
	SELF.prototype.visit = function( value, key ) {
		return this._checkColumn( value, key );
	};

	/**
	 * Check if this value contains an coordinate value.
	 *
	 * @param {Object} value
	 * @param {string} key
	 * @return {boolean}
	 * @private
	 */
	SELF.prototype._checkColumn = function( value, key ) {
		if ( this._getFormatter().isLabel( value ) ) {
			this._dataColumns[key] = true;
		}

		if ( this._getFormatter().isNumber( value ) ) {
			this._dataColumns[key] = true;
		}

		if ( this._getFormatter().isDateTime( value ) ) {
			this._dataColumns[key] = true;
		}

		return !this.isDrawable();
	};

	return SELF;
}( jQuery, _, d3, window, dimple ) );
