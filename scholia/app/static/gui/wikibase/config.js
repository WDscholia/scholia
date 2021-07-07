/* exported CONFIG */
var CONFIG = ( function ( window, $ ) {
	'use strict';

	function getUserLanguage() {
		var lang = ( navigator.languages && navigator.languages[0] ) ||
			navigator.language ||
			navigator.userLanguage;

		if ( lang && typeof lang === 'string' ) {
			return lang.split( '-' ).shift();
		}

		return null;
	}

	var presets = {
		language: getUserLanguage() || 'en',
		i18nLoad: function( lang ) {
			var loadFallbackLang = null;
			if ( lang !== this.language ) {
				//load default language as fallback language
				loadFallbackLang = $.i18n().load( 'i18n', this.language );
			}
			return $.when(
				loadFallbackLang,
				$.i18n().load( 'i18n', lang )
			);
		}
	};

	var hostname = window.location.hostname.toLowerCase();

	if ( hostname === '' || hostname === 'localhost' || hostname === '127.0.0.1' ) {
		// Override for local debugging
		presets.i18nLoad = function( lang ) {
			return $.when(
				$.i18n().load( '/static/gui/i18n', lang ),
				$.i18n().load( '/static/gui/node_modules/jquery.uls/i18n', lang )
			);
		};
	}

	var deferred = $.Deferred(),
		defaultConfig, customConfig;

	function getEffectiveConfig() {
		return $.extend( true, {}, presets, defaultConfig, customConfig );
	}

	function onDefaultConfigLoad( config ) {
		defaultConfig = config;
		if ( typeof defaultConfig !== 'undefined' && typeof customConfig !== 'undefined' ) {
			deferred.resolve( getEffectiveConfig() );
		}
	}

	function onCustomConfigLoad( config ) {
		customConfig = config;
		if ( typeof defaultConfig !== 'undefined' && typeof customConfig !== 'undefined' ) {
			deferred.resolve( getEffectiveConfig() );
		}
	}

	function getConfig() {
		if ( deferred.state() === 'resolved' ) {
			return deferred.promise();
		}

		$.getJSON( '/static/gui/default-config.json' )
			.done( onDefaultConfigLoad )
			.fail( function( jqXHR, textStatus, errorThrown ) {
				window.console.error( 'Failed loading default-config.json: ' + errorThrown );
				deferred.reject( 'Failed loading default-config.json: ' + errorThrown );
			} );

		$.getJSON( './custom-config.json' )
			.done( onCustomConfigLoad )
			.fail( function( jqXHR, textStatus, errorThrown ) {
				if ( jqXHR.status === 404 ) {
					// It's ok for this to not exist
					onCustomConfigLoad( {} );
				} else if ( location.protocol === 'file:' && jqXHR.status === 0 ) {
					// WDQS UI is accessed via file://, but custom-config.json doesn't exist
					onCustomConfigLoad( {} );
				} else {
					window.console.error( 'Failed loading custom-config.json: ' + errorThrown );
					deferred.reject( 'Failed loading custom-config.json: ' + errorThrown );
				}
			} );

		return deferred.promise();
	}

	function reset() {
		deferred = $.Deferred();
		defaultConfig = undefined;
		customConfig = undefined;
	}

	return {
		getConfig: getConfig,
		reset: reset
	};

} )( window, jQuery );
