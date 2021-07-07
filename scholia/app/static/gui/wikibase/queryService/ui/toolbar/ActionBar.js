var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.toolbar = wikibase.queryService.toolbar || {};

wikibase.queryService.ui.toolbar.Actionbar = ( function( $ ) {
	'use strict';

	/**
	 * An action bar showing actions like loading, rendering and also errors
	 *
	 * @class wikibase.queryService.ui.toolbar.Actionbar
	 * @license GNU GPL v2+
	 *
	 * @author Jonas Kress
	 * @constructor
	 *
	 * @param {jQuery} $element
	 */
	function SELF( $element ) {
		this._$element = $element;
	}

	/**
	 * @property {string}
	 * @private
	 */
	SELF.prototype._$element = null;

	/**
	 * Show action bar
	 *
	 * @param {string} messageKey primary message key
	 * @param {string} extraText to be appended to the primary message
	 * @param {string} type of message: primary, success, info, warning, danger
	 * @param {number|boolean} [progress] false if no progress, or actual progress 0-100
	 */
	SELF.prototype.show = function( messageKey, extraText, type, progress ) {
		var text = messageKey;

		if ( $.i18n ) {
			text = $.i18n( messageKey );
		}
		if ( extraText !== '' ) {
			text = text + ': ' + extraText;
		}

		this._$element.find( '.message' ).html( '' );

		if ( !type ) {
			type = 'info';
		}

		if ( progress === undefined || progress === false ) {
			this._$element.find( '.message' ).append( this._getBar( text, type ) );
		} else {
			this._$element.find( '.message' ).append( this._getProgressbar( text, type, progress ) );
		}

		this._$element.show();
	};

	/**
	 * @param {string} text
	 * @param {string} type
	 * @param {number} progress in percent (0 to 100)
	 * @private
	 */
	SELF.prototype._getProgressbar = function( text, type, progress ) {
		return $( '<div class="progress"><div class="progress-bar progress-bar-' + type +
				' progress-bar-striped active" role="progressbar" style="width: ' + progress +
				'%">' + text + '</div></div>' );
	};

	/**
	 * @param {string} text
	 * @param {string} type
	 * @private
	 */
	SELF.prototype._getBar = function( text, type ) {
		return $( '<div class="label label-' + type + '"/>' ).text( text );
	};

	/**
	 * Hide the action bar
	 */
	SELF.prototype.hide = function() {
		this._$element.hide();
	};

	return SELF;

}( jQuery ) );
