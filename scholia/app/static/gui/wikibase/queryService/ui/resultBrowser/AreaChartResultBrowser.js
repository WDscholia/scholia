var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.resultBrowser = wikibase.queryService.ui.resultBrowser || {};
window.mediaWiki = window.mediaWiki || {};

wikibase.queryService.ui.resultBrowser.AreaChartResultBrowser = ( function( dimple ) {
	'use strict';

	var PARENT = wikibase.queryService.ui.resultBrowser.AbstractDimpleChartResultBrowser;

	/**
	 * A area chart result browser
	 *
	 * @class wikibase.queryService.ui.resultBrowser.AreaChartResultBrowser
	 * @license GNU GPL v2+
	 *
	 * @author Jonas Kress
	 *
	 * @constructor
	 */
	function SELF() {
		this._dataColumns = {};
	}

	SELF.prototype = new PARENT();

	SELF.prototype._getPlotType = function() {
		return dimple.plot.area;
	};

	return SELF;
}( dimple ) );
