var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.resultBrowser = wikibase.queryService.ui.resultBrowser || {};
window.mediaWiki = window.mediaWiki || {};

wikibase.queryService.ui.resultBrowser.ScatterChartResultBrowser = ( function( dimple ) {
	'use strict';

	var PARENT = wikibase.queryService.ui.resultBrowser.AbstractDimpleChartResultBrowser;

	/**
	 * A scatter chart result browser
	 *
	 * @class wikibase.queryService.ui.resultBrowser.ScatterChartResultBrowser
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
		return dimple.plot.scatter;
	};

	return SELF;
}( dimple ) );
