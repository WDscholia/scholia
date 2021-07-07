var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.i18n = wikibase.queryService.ui.i18n || {};

wikibase.queryService.ui.i18n.LanguageSelector = ( function( $, wikibase ) {
	'use strict';

	/**
	 * A language selector to selectt the UI language
	 *
	 * @class wikibase.queryService.ui.i18n.LanguageSelector
	 * @license GNU GPL v2+
	 *
	 * @author Jonas Kress
	 * @constructor
	 * @param {jQuery} $element
	 * @param {wikibase.queryService.api.Wikibase} api
	 * @param {string} lang default language
	 */
	function SELF( $element, api, lang ) {
		this._$element = $element;

		if ( api ) {
			this._api = api;
		} else {
			this._api = new wikibase.queryService.api.Wikibase();
		}

		this._defaultLanguage = lang;

		this._create();
	}

	/**
	 * @property {wikibase.queryService.api.Wikibase}
	 * @private
	 */
	SELF.prototype._api = null;

	/**
	 * @property {Function}
	 * @private
	 */
	SELF.prototype._$element = null;

	/**
	 * @property {string}
	 * @private
	 */
	SELF.prototype._defaultLanguage = null;

	/**
	 * @property {Function}
	 * @private
	 */
	SELF.prototype._changeListener = null;

	/**
	 * Set the change listener
	 *
	 * @param {Function} listener a function called when value selected
	 */
	SELF.prototype.setChangeListener = function( listener ) {
		this._changeListener = listener;
	};

	/**
	 * @private
	 */
	SELF.prototype._create = function( listener ) {
		var self = this;

		this._$element.text( $.uls.data.getAutonym( this._defaultLanguage ) );
		this._getLanguages().done( function( langs ) {
			self._$element.uls( {
				onSelect: function( lang ) {
					self._$element.text( $.uls.data.getAutonym( lang ) );

					if ( self._changeListener ) {
						self._changeListener( lang );
					}
				},
				languages: langs
			// quickList: langs
			} ).click( function() {
				$( '.uls-menu' ).addClass( 'uls-mobile' ).css( 'left', '' ).css( 'right', '2.5%' );
			} ).css( 'display', 'block' );
		} );
	};

	/**
	 * @private
	 */
	SELF.prototype._getLanguages = function() {
		var deferred = $.Deferred();

		this._api.getLanguages().done( function( data ) {

			var langs = {};
			$.each( data.query.languages, function( k, v ) {
				langs[v.code] = v['*'];
			} );

			deferred.resolve( langs );
		} );

		return deferred.promise();
	};

	return SELF;
}( jQuery, wikibase ) );
