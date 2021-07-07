var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.api = wikibase.queryService.api || {};

wikibase.queryService.api.Tracking = ( function( $ ) {
	'use strict';

	var API_ENDPOINT = 'https://www.wikidata.org/beacon/statsv';

	/**
	 * API for the Tracking API
	 *
	 * @class wikibase.queryService.api.Tracking
	 * @license GNU GPL v2+
	 *
	 * @author Addshore
	 * @constructor
	 * @param {string} endpoint default: 'https://www.wikidata.org/beacon/statsv'
	 */
	function SELF( endpoint ) {
		this._endpoint = API_ENDPOINT;

		if ( endpoint ) {
			this._endpoint = endpoint;
		}
	}

	/**
	 * @property {string}
	 * @private
	 */
	SELF.prototype._endpoint = null;

	/**
	 * @param {string} metricName
	 * @param {number} value
	 * @param {string} valueType
	 *
	 * @return {jQuery.Promise}
	 */
	SELF.prototype.track = function( metricName, value, valueType ) {
		if ( !value ) {
			value = 1;
		}
		if ( !valueType ) {
			valueType = 'c';
		}

		if (
			location.hostname !== 'query.wikidata.org' ||
			/^1|yes/.test( navigator.doNotTrack || window.doNotTrack )
		) {
			// skip tracking
			return $.when();
		}

		// https://www.wikidata.org/beacon/statsv?test.statsv.foo2=5c
		return this._track( metricName + '=' + value + valueType );
	};

	/**
	 * @private
	 */
	SELF.prototype._track = function( query ) {
		// This may cause a warning due to lack of CORS header.
		// We do not need to read the result, so that is ok.
		return $.ajax( {
			url: this._endpoint + '?' + query
		} );
	};

	return SELF;

}( jQuery ) );
