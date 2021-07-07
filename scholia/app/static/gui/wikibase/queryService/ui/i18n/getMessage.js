var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.i18n = wikibase.queryService.ui.i18n || {};

wikibase.queryService.ui.i18n.getMessage = ( function( $ ) {
	'use strict';

	function getMessage( key, message, args ) {
		var i18nMessage = null;

		if ( $.i18n ) {
			try {
				i18nMessage = $.i18n.apply( $, [ key ].concat( args || [] ) );
				if ( i18nMessage !== key ) {
					return i18nMessage;
				}
			} catch ( e ) {
				window.console.warn( '$.i18n( "' + key + '" ) threw error, invalid translation?' );
				window.console.warn( e );
			}
		}

		i18nMessage = message;
		if ( args ) {
			$.each( args, function( index, arg ) {
				i18nMessage = i18nMessage.replace(
					new RegExp( '\\$' + ( index + 1 ), 'g' ),
					arg
				);
			} );
		}

		return i18nMessage;
	}

	return getMessage;
}( jQuery ) );
