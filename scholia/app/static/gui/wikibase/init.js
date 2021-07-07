( function( $, CONFIG, moment ) {
	'use strict';

	$.when(
		$.ready,
		CONFIG.getConfig()
	)
	.then( function ( _, config ) {
		var wb = wikibase.queryService,
			app;

		function setExamplesHelpLink( url ) {
			$( 'a#examples-link' ).attr( 'href', url );
		}

		function setBrand() {
			$( '.navbar-brand img' ).attr( 'src', config.brand.logo );
			$( '.navbar-brand a > span' ).text( config.brand.title );
			document.title = config.brand.title;
			$( 'a#copyright-link' ).attr( 'href', config.brand.copyrightUrl );
			$( '#favicon' ).attr( 'href', config.brand.favicon );
		}

		function setLogoutLink() {
			if ( config.logout ) {
				var $link = $( '<a id="logout" data-i18n="wdqs-app-logout">' ).attr( 'href', config.logout.url );
				var $entry = $( '<li>' ).append( $link );
				$( 'ul#right-navbar' ).append( $entry );
			}
		}

		function setLanguage( lang, save, callback ) {
			if ( save ) {
				Cookies.set( 'lang', lang );
			}

			$.i18n.debug = true;
			$.i18n().locale = lang;
			moment.locale( lang );

			$.when(
				config.i18nLoad( lang )
			).done( function() {
				$( '.wikibase-queryservice' ).i18n();
				$( '#keyboardShortcutHelpModal' ).i18n();
				$( 'html' ).attr( { lang: lang, dir: $.uls.data.getDir( lang ) } );
				app.resizeNavbar();
				if ( callback ) {
					callback();
				}
			} );
		}

		setBrand();
		setLogoutLink();
		wb.ui.resultBrowser.helper.FormatterHelper.initMoment();

		$( '#query-form' ).attr( 'action', config.api.sparql.uri );
		var lang = Cookies.get( 'lang' ) ? Cookies.get( 'lang' ) : config.language,
			api = new wb.api.Wikibase( config.api.wikibase.uri, lang ),
			sparqlApi = new wb.api.Sparql( config.api.sparql.uri, lang ),
			sparqlApiHelper = new wb.api.Sparql( config.api.sparql.uri, lang ),
			querySamplesApi = new wb.api.QuerySamples(
				lang,
				config.api.examples
			),
			codeSamplesApi = new wb.api.CodeSamples(
				config.api.sparql.uri,
				config.location.root,
				config.location.index
			),
			shortenApi = new wb.api.UrlShortener( config.api.urlShortener ),
			languageSelector = new wb.ui.i18n.LanguageSelector( $( '.uls-trigger' ), api, lang );

		setExamplesHelpLink( querySamplesApi.getExamplesPageUrl() );

		var isTopWindow = window.top === window;

		var rdfHint = new wb.ui.editor.hint.Rdf( api ),
				rdfTooltip = new wb.ui.editor.tooltip.Rdf( api ),
				editor = new wb.ui.editor.Editor( rdfHint, null, rdfTooltip, { focus: isTopWindow } );

		if ( config.prefixes ) {
			wb.RdfNamespaces.addPrefixes( config.prefixes );
		}

		function afterLanguageChange() {
			editor.updatePlaceholder();
		}

		setLanguage( lang, false, afterLanguageChange );

		languageSelector.setChangeListener( function( lang ) {
			api.setLanguage( lang );
			sparqlApi.setLanguage( lang );
			sparqlApiHelper.setLanguage( lang );
			querySamplesApi.setLanguage( lang );
			setLanguage( lang, true, afterLanguageChange );
		} );

		app = new wb.ui.App(
			$( '.wikibase-queryservice ' ),
			editor,
			new wb.ui.queryHelper.QueryHelper( api, sparqlApiHelper ),
			sparqlApi,
			querySamplesApi,
			api,
			codeSamplesApi,
			shortenApi,
			config.api['query-builder'].server
		);
	} );

} )( jQuery, CONFIG, moment );
