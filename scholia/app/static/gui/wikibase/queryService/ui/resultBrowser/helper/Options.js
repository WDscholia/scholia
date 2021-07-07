var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.resultBrowser = wikibase.queryService.ui.resultBrowser || {};
wikibase.queryService.ui.resultBrowser.helper = wikibase.queryService.ui.resultBrowser.helper || {};

wikibase.queryService.ui.resultBrowser.helper.Options = ( function ( $ ) {
	'use strict';

	/**
	 * A set of options for result views,
	 * with some convenience accessor methods.
	 *
	 * @class wikibase.queryService.ui.resultBrowser.helper.Options
	 * @license GNU GPL v2+
	 *
	 * @author Lucas Werkmeister
	 * @constructor
	 */
	function SELF( options ) {
		if ( typeof options !== 'object' ) {
			throw new Error( 'options must be an object' );
		}

		// TODO clone+freeze options?
		this._options = options;
	}

	/**
	 * @property {Object}
	 * @private
	 */
	SELF.prototype._options = null;

	/**
	 * @private
	 */
	SELF.prototype._requireTwoArguments = function( args ) {
		if ( args.length !== 2 ) {
			throw new Error( 'must be called with exactly two arguments' );
		}
	};

	/**
	 * Get a single option,
	 * using a certain default value
	 * if the option is not specified.
	 *
	 * @param {string} name The name of the option.
	 * @param {*} defaultValue The default value to use if the option is not specified.
	 * This parameter is not optional – if the option may be absent,
	 * explicitly pass undefined as the default value.
	 * @return {*}
	 */
	SELF.prototype.get = function( name, defaultValue ) {
		this._requireTwoArguments( arguments );

		if ( name in this._options ) {
			return this._options[ name ];
		} else {
			return defaultValue;
		}
	};

	/**
	 * Get an option that should be an array.
	 * If the options specify a single value,
	 * it is wrapped in a single-element array.
	 *
	 * @param {string} name
	 * @param {*} defaultValue
	 * @return {Array}
	 */
	SELF.prototype.getArray = function( name, defaultValue ) {
		this._requireTwoArguments( arguments );

		var option = this.get( name, defaultValue );
		if ( Array.isArray( option ) ) {
			return option;
		} else {
			return [ option ];
		}
	};

	/**
	 * Get a list of column names
	 * from an option specifying an array of variables names.
	 * (The variable names start with a question mark,
	 * the returned column names don’t.)
	 *
	 * @param {string} name
	 * @param {*} defaultValue
	 * @return {Array}
	 */
	SELF.prototype.getColumnNames = function( name, defaultValue ) {
		this._requireTwoArguments( arguments );

		return this.getArray( name, defaultValue )
			.filter( function( variableName ) {
				if ( typeof variableName !== 'string' ||
					!variableName.startsWith( '?' ) ) {
					window.console.warn(
						'column name ' + variableName + ' is not a variable name, ignoring'
					);
					return false;
				}
				return true;
			} )
			.map( function( variableName ) {
				return variableName.substring( 1 );
			} );
	};

	return SELF;

}( jQuery ) );
