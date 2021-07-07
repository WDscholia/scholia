( function ( $, CONFIG ) {
	'use strict';
	$.when(
		$.ready,
		CONFIG.getConfig()
	)
	.then( function ( documentReady, config ) {
		function renderEdit( qh, query, $editor, callback ) {
			qh.setChangeListener( _.debounce( function( v ) {
				callback( v.getQuery() );
			}, 1500 ) );
			try {
				qh.setQuery( query );
				qh.draw( $editor );
			} catch ( e ) {
				return;
			}
			if ( /^#TEMPLATE=/m.test( query ) ) {
				// expand query template popover after allowing some time for labels to load
				setTimeout( function() { $( '.edit' ).click(); }, 500 );
			}
		}

		function setBrand() {
			$( '.brand img' ).attr( 'src', config.brand.logo );
			$( '.brand > span' ).text( config.brand.title );
			document.title = config.brand.title;
		}

		function initToolbarVisibilityHandler() {
			$( 'body' ).mousemove( function( event ) {
				var timer;

				clearTimeout( timer );
				$( '.toolbar-right' ).addClass( 'toolbar-visible' );
				$( '.header-toolbar' ).addClass( 'toolbar-visible' );

				timer = window.setTimeout( function() {
					$( '.toolbar-right' ).removeClass( 'toolbar-visible' );
					$( '.header-toolbar' ).removeClass( 'toolbar-visible' );
				}, 1000 );
			} );
		}

		var lang = Cookies.get( 'lang' ) ? Cookies.get( 'lang' ) : config.language,
			api = new wikibase.queryService.api.Wikibase( config.api.wikibase.uri, lang ),
			sparqlApi = new wikibase.queryService.api.Sparql( config.api.sparql.uri, lang ),
			querySamplesApi = new wikibase.queryService.api.QuerySamples(
				lang,
				config.api.examples
			),
			codeSamplesApi = null,
			shortenApi = new wikibase.queryService.api.UrlShortener( config.api.urlShortener ),
			resultView = new wikibase.queryService.ui.ResultView(
				sparqlApi,
				querySamplesApi,
				api,
				codeSamplesApi,
				shortenApi,
				null,
				config.api['query-builder'].server
			),
			query = decodeURIComponent( window.location.hash.substr( 1 ) ),
			qh = new wikibase.queryService.ui.queryHelper.QueryHelper( api, sparqlApi ),
			$editor = $( '<div>' );

		resultView.trackingNamespace = 'wikibase.queryService.ui.embed.';

		setBrand();
		$.i18n().locale = lang;
		$.when(
			config.i18nLoad( lang )
		).done( function() {
			$( 'body' ).i18n();
			$( 'html' ).attr( { lang: lang, dir: $.uls.data.getDir( lang ) } );

			resultView.draw( query ).then( function() {
				$( '.logo' ).hide();
			} );
			renderEdit( qh, query, $editor, function( q ) {
				resultView.draw( q );
				window.location.hash = '#' + encodeURIComponent( q );
				$( '.edit-link' ).attr( 'href', config.location.index + window.location.hash );
			} );
			$( '.edit-link' ).attr( 'href', config.location.index + window.location.hash );

		} );

		$( '#display-button' ).closest( '.navbar' ).addClass( 'dropup' );

		$( '#expand-type-switch' ).change( function() {
			if ( $( this ).prop( 'checked' ) ) {
				$( '.expand-type' ).attr( 'title', $.i18n( 'wdqs-embed-explorer-button-incoming' ) );
			} else {
				$( '.expand-type' ).attr( 'title', $.i18n( 'wdqs-embed-explorer-button-outgoing' ) );
			}
		} );

		$( 'a.result-browser' ).click( function( e ) {
			if ( $( this ).text() !== 'Graph' ) {
				$( '.expand-type' ).hide();
			} else {
				$( '.expand-type' ).show();
			}

		} );

		initToolbarVisibilityHandler();
		$( '.header-toolbar' ).hover( function() {
			$( '.header-toolbar' ).addClass( 'hovered' );
			$( '.toolbar-label' ).css( 'display', 'block' );
			}, function() {
				$( '.toolbar-label' ).css( 'display', 'none' );
				$( '.header-toolbar' ).removeClass( 'hovered' );
		} );

		$( window ).on( 'hashchange', function( e ) {
			$( '.edit-link' ).attr( 'href', config.location.index + window.location.hash );
			query = decodeURIComponent( window.location.hash.substr( 1 ) );
			qh.setQuery( query );
			qh.draw( $editor );
		} );

		$( '.edit' ).on( 'click', function( e ) {
			e.preventDefault();
			$( '.toolbar-right' ).toggleClass( 'hovered' );
		} ).popover( {
				placement: 'bottom',
				'html': true,
				'content': $editor
		} );

		$( '.download-dropdown' ).on( 'show.bs.dropdown', function () {
			$( '.toolbar-right' ).toggleClass( 'hovered' );
		} );

		$( '.download-dropdown' ).on( 'hide.bs.dropdown', function () {
			$( '.toolbar-right' ).toggleClass( 'hovered' );
		} );

	} );
}( jQuery, CONFIG ) );

