var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};

wikibase.queryService.ui.App = ( function( $, window, _, Cookies, moment ) {
	'use strict';

	var TRACKING_NAMESPACE = 'wikibase.queryService.ui.app.',
		DEFAULT_QUERY = 'SELECT * WHERE {  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". } } LIMIT 100';

	var COOKIE_SHOW_QUERY_HELPER = 'query-helper-show';

	/**
	 * A ui application for the Wikibase query service
	 *
	 * @class wikibase.queryService.ui.App
	 * @license GNU GPL v2+
	 *
	 * @author Stanislav Malyshev
	 * @author Jonas Kress
	 * @constructor
	 *
	 * @param {jQuery} $element
	 * @param {wikibase.queryService.ui.editor.Editor} editor
	 * @param {wikibase.queryService.ui.queryHelper.QueryHelper} queryHelper
	 * @param {wikibase.queryService.api.Sparql} sparqlApi
	 * @param {wikibase.queryService.api.QuerySamples} querySamplesApi
	 * @param {wikibase.queryService.api.Wikibase} wikibaseApi
	 * @param {wikibase.queryService.api.CodeSamples} codeSamplesApi
	 * @param {wikibase.queryService.api.UrlShortener} shortUrlApi
	 * @param {string} queryBuilderUrl
	 */
	function SELF(
		$element,
		editor,
		queryHelper,
		sparqlApi,
		querySamplesApi,
		wikibaseApi,
		codeSamplesApi,
		shortUrlApi,
		queryBuilderUrl
	) {
		this._$element = $element;
		this._editor = editor;
		this._queryHelper = queryHelper;
		this._sparqlApi = sparqlApi;
		this._querySamplesApi = querySamplesApi;
		this._wikibaseApi = wikibaseApi;
		this._codeSamplesApi = codeSamplesApi;
		this._shorten = shortUrlApi;
		this._queryBuilderUrl = queryBuilderUrl;

		this._init();
	}

	/**
	 * @property {string}
	 * @private
	 */
	SELF.prototype._$element = null;

	/**
	 * @property {wikibase.queryService.ui.ResultView}
	 * @private
	 */
	SELF.prototype._resultView = null;

	/**
	 * @property {wikibase.queryService.api.Sparql}
	 * @private
	 */
	SELF.prototype._sparqlApi = null;

	/**
	 * @property {wikibase.queryService.api.QuerySamples}
	 * @private
	 */
	SELF.prototype._querySamplesApi = null;

	/**
	 * @property {wikibase.queryService.api.Wikibase}
	 * @private
	 */
	SELF.prototype._wikibaseApi = null;

	/**
	 * @property {wikibase.queryService.api.CodeSamples}
	 * @private
	 */
	SELF.prototype._codeSamplesApi = null;

	/**
	 * @property {wikibase.queryService.ui.editor.Editor}
	 * @private
	 */
	SELF.prototype._editor = null;

	/**
	 * @property {wikibase.queryService.ui.queryHelper.QueryHelper}
	 * @private
	 */
	SELF.prototype._queryHelper = null;

	/**
	 * @property {boolean}
	 * @private
	 */
	SELF.prototype._isHistoryDisabled = false;

	/**
	 * @property {wikibase.queryService.api.Tracking}
	 * @private
	 */
	SELF.prototype._trackingApi = null;

	/**
	 * @property {wikibase.queryService.api.UrlShortener}
	 * @private
	 */
	SELF.prototype._shorten = null;

	/**
	 * @property {string}
	 * @private
	 */
	SELF.prototype._queryBuilderUrl = null;

	/**
	 * @property {boolean}
	 * @private
	 */
	SELF.prototype._hasRunFirstQuery = false;

	/**
	 * @property {boolean}
	 * @private
	 */
	SELF.prototype._isQueryUnparsable = false;

	SELF.prototype._navbarLabelTexts = {};
	SELF.prototype._navbarLabelIDs = [ '#help-label', '#examples-label', '#tools-label', '#language-toggle' ];

	SELF.prototype._maximumWidthBeforeLineBroke = 0;
	SELF.prototype._languageSelectorDefaultWidth = 0;

	/**
	 * Initialize private members and call delegate to specific init methods
	 *
	 * @private
	 */
	SELF.prototype._init = function() {
		if ( !this._trackingApi ) {
			this._trackingApi = new wikibase.queryService.api.Tracking();
		}

		if ( !this._resultView ) {
			this._resultView = new wikibase.queryService.ui.ResultView(
				this._sparqlApi,
				this._querySamplesApi,
				this._wikibaseApi,
				this._codeSamplesApi,
				this._shorten,
				this._editor,
				this._queryBuilderUrl
			);
		}

		this._track( 'init' );

		this._initApp();
		this._initEditor();
		this._initQueryHelper();
		this._initDataUpdated();
		this._initQuery();
		this._initRdfNamespaces();
		this._initHandlers();
		/*
		// Temporarily disabled as fix for T172728
		// TODO: re-enable once the problems are resolved
		$( window ).scroll( function () {
			var minScroll = $( '#query-box' ).offset().top + $( '#query-box' ).height() - $( window ).height();

			if ( minScroll + 100 < $( this ).scrollTop() && $( this ).scrollTop() > 1 ) {
				if (
					$( '#query-result' ).is( ':visible' ) &&
					$( document ).height() - $( '#query-box' ).height() > $( window ).height()
				) {
					$( '#query-box' ).hide( {
						duration: 500
					} );
				}
			} else {
				$( '#query-box' ).show( {
					duration: 100
				} );
			}
		} ); */
	};

	/**
	 * @private
	 */
	SELF.prototype._initApp = function() {
		var self = this;

		$( window ).keydown( function( e ) {
			return self._keyboardShortcut( e );
		} );

		// add tooltip to dropdown
		$( '#display-button' ).tooltip();
		$( '#download-button' ).tooltip();
		$( '#link-button' ).tooltip();

		this._actionBar = new wikibase.queryService.ui.toolbar.Actionbar( $( '.action-bar' ) );

		$( 'body' ).on( 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', '.navbar-collapse', function ( event ) {
			if ( $( this ).hasClass( 'in' ) ) {
				// Normally this will not be called unless user is resizing browser with navbar hidden
				$( window ).trigger( 'resize' );
			}
		} );

		$( window ).on( 'resize', function() {
			self._toggleLabelOnResize();
			self._toggleBrandIconOnResize();
			self._updateQueryEditorSize();
		} );
	};

	SELF.prototype.resizeNavbar = function () {
		this._calculateNavBarWidth();
		this._calculateNavBarText();

		$( window ).trigger( 'resize' );

		// Hide navbar by default after getting sizes and texts
		$( '.navbar-collapse' ).removeClass( 'in' );

		this.resizableQueryHelper();
	};

	/**
	 * @private
	 */
	SELF.prototype._calculateNavBarWidth = function () {
		var totalLeftNavBarWidth = 0;
		$( '#left-navbar li' ).each( function () { totalLeftNavBarWidth += $( this ).width(); } );
		// 30px here is .navbar-collapse's padding-left plus padding-right after collapse
		this._maximumWidthBeforeLineBroke = 30 + totalLeftNavBarWidth;

		this._languageSelectorDefaultWidth = $( '#language-toggle' ).outerWidth();
	};

	/**
	 * @private
	 */
	SELF.prototype._calculateNavBarText = function () {
		var self = this;
		self._navbarLabelIDs.forEach( function ( label ) {
			self._navbarLabelTexts[label] = $( label ).text();
		} );
	};

	/**
	 * @private
	 */
	SELF.prototype._toggleLabelOnResize = function( e ) {
		var self = this;

		// To prevent getting .position and .width when the navbar is hidden
		if ( !$( '.navbar-collapse' ).is( ':visible' ) ) {
			return;
		}

		// This is to find a fix value, to prevent the following code run repeatingly during resizing because of #right-navbar's left and width's change
		var languageLeft = $( '#right-navbar' ).position().left + $( '#right-navbar' ).width() - this._languageSelectorDefaultWidth;

		if ( languageLeft < self._maximumWidthBeforeLineBroke ) {
			self._navbarLabelIDs.forEach( function ( label ) {
				var targetText = '';
				if ( label === '#language-toggle' ) {
					targetText = '&nbsp;';
				}
				$( label ).html( targetText );
			} );
		} else {
			self._navbarLabelIDs.forEach( function ( label ) {
				$( label ).text( self._navbarLabelTexts[label] );
			} );
		}
	};

	/**
	 * @private
	 */
	SELF.prototype._toggleBrandIconOnResize = function( e ) {
		// Hide site name when the window width is way too small
		$( '.navbar-brand a span' ).css( 'vertical-align', 'middle' );
		if ( ( $( '.navbar-brand a span' ).position().top - $( '.navbar-brand a img' ).position().top ) > 30 ) {
			$( '.navbar-brand a span' ).css( 'opacity', 0 );
		} else {
			$( '.navbar-brand a span' ).css( 'opacity', 1 );
		}
	};

	/**
	 * @private
	 */
	SELF.prototype._keyboardShortcut = function( e ) {
		if ( ( e.ctrlKey || e.metaKey ) && e.key === 'Enter' ) {
			// e.metaKey is used for Mac (https://stackoverflow.com/a/21996827)
			$( 'button#execute-button' ).click();
			return false;
		}

		if ( $( document.activeElement ).is( 'textarea, input' ) ||
			$( document.activeElement ).hasClass( 'CodeMirror-code' ) ) {
			if ( e.key === 'Escape' ) {
				$( document.activeElement ).blur();
			}
			return;
		}

		if ( this._KeyboardShortcutKeys( e ) ) {
			return false;
		}
	};

	/**
	 * @private
	 */
	SELF.prototype._KeyboardShortcutKeys = function( e ) {

		if ( e.ctrlKey || e.metaKey || e.altKey ) {
			return false;
		}

		var keys = {
			'?': function () { $( '#keyboardShortcutHelpModal' ).modal( 'toggle' ); },
			i: function () { $( '.CodeMirror textarea' ).focus(); },
			r: function () { $( '#query-result' ).find( 'a.item-link' ).first().focus(); },
			f: function () { $( 'a#query-helper-filter' ).focus(); },
			s: function () { $( 'a#query-helper-show' ).focus(); },
			m: function () { $( 'a#query-helper-limit' ).click(); },
			e: function () { if ( !$( '#QueryExamples' ).is( ':visible' ) ) { $( 'button#open-example' ).click(); } },
			h: function () { $( 'button#help-toggle' ).click(); },
			l: function () { $( 'a#language-toggle' ).click(); }
		};

		if ( e.key in keys ) {
			keys[e.key]();
			return true;
		}

		return false;
	};

	/**
	 * @private
	 */
	SELF.prototype._initEditor = function() {
		var self = this;

		this._editor.fromTextArea( this._$element.find( '.queryEditor' )[0] );

		this._editor.registerCallback( 'change', function( editor, changeObj ) {
			if ( changeObj.text[0] === ':' ) {
				var $help = $( '<a target="_blank" rel="noopener" href="https://www.wikidata.org/wiki/Special:MyLanguage/Wikidata:SPARQL_query_service/Wikidata_Query_Help/SPARQL_Editor#Code_Completion">' )
					.append( $.i18n( 'wdqs-app-footer-help' ) );
				self._toast( $help, 'wdqs-app-footer-help' );
			}
		} );

		// if(window.history.pushState) {//this works only in modern browser
		// this._editor.registerCallback( 'change', $.proxy( this._updateQueryUrl, this) );
		// }

		$( '#query-box .toolbar-top' ).css( { visibility: 'visible' } );
	};

	/**
	 * @private
	 */
	SELF.prototype.resizableQueryHelper = function() {
		$( '.query-helper' ).resizable( {
			handleSelector: '.splitter',
			resizeHeight: false,
			onDrag: this._updateQueryHelperMinWidth.bind( this ),
			onDragEnd: this._updateQueryEditorSize.bind( this ),
			resizeWidthFrom: ( document.dir === 'rtl' ) ? 'left' : 'right' // T189972
		} );
	};

	SELF.prototype._initQueryHelper = function() {
		var self = this;

		if ( !this._queryHelper ) {
			this._queryHelper = new wikibase.queryService.ui.queryHelper.QueryHelper();
		}
		this._queryHelper.setChangeListener( function( ve ) {
			self._editor.setValue( ve.getQuery() );

			_.debounce( function () {
				self._resultView.drawPreview( ve.getQuery() );
			}, 1000 )();
		} );
		this.resizableQueryHelper();
		if ( Cookies.get( COOKIE_SHOW_QUERY_HELPER ) === 'true' ) {
			$( '.query-helper' ).removeClass( 'query-helper-hidden' );
			$( '.query-helper-tag-cloud' ).removeClass( 'query-helper-hidden' );
		}

		if ( this._editor ) {
			this._editor.registerCallback( 'change', _.debounce( function() {
				if ( self._editor.getValue() === self._queryHelper.getQuery() ) {
					return;
				}

				self._drawQueryHelper();
			}, 1500 ) );
		}

		$( '.query-helper' ).bind( 'DOMSubtreeModified', _.debounce( function () {
			self._updateQueryHelperMinWidth();
			self._updateQueryEditorSize();
		}, 100 ) );

		$( '.query-helper .panel-heading .close' ).click( function() {
			Cookies.set( COOKIE_SHOW_QUERY_HELPER, false );
			self._hideQueryHelper();
			self._track( 'buttonClick.queryHelperTrigger.close' );
			return false;
		} );

		$( '.query-helper-trigger' ).click( function () {
			var visible = $( '.query-helper' ).is( ':visible' );
			$( '.query-helper' ).toggleClass( 'query-helper-hidden', visible );
			$( '.query-helper-tag-cloud' ).toggleClass( 'query-helper-hidden' );
			Cookies.set( COOKIE_SHOW_QUERY_HELPER, !visible );
			self._updateQueryEditorSize();
			self._track( 'buttonClick.queryHelperTrigger.' + ( visible ? 'close' : 'open' ) );
			return false;
		} );

		window.setTimeout( $.proxy( this._drawQueryHelper, this ), 500 );
	};

	SELF.prototype._hideQueryHelper = function() {
		$( '.query-helper' ).addClass( 'query-helper-hidden' );
		$( '.query-helper-tag-cloud' ).addClass( 'query-helper-hidden' );
		this._updateQueryEditorSize();
	};

	SELF.prototype._setUnparsable = function( changeTo ) {
		if ( changeTo ) {
			this._isQueryUnparsable = true;
			$( '#format-button' ).addClass( 'disabled' );
		} else {
			this._isQueryUnparsable = false;
			$( '#format-button' ).removeClass( 'disabled' );
		}
	};

	SELF.prototype._drawQueryHelper = function() {
		try {
			this._queryHelper.setQuery( this._editor.getValue() || DEFAULT_QUERY );
			this._queryHelper.draw( $( '.query-helper .panel-body' ) );
			$( '.query-helper' ).css( 'min-width', '' );
			this._setUnparsable( false );
		} catch ( e ) {
			// Temporarily disabled due to T171935
			// TODO: Re-enable when handling of WITH is fixed
			// this._editor.highlightError( e.message );
			this._setUnparsable( true );
			window.console.error( e );
		}
		var storedValue = this._editor.getStoredValue();
		var currentValue = this._editor.getValue();
		if ( !storedValue || storedValue.toString() === currentValue.toString() ) {
			// nothing to restore
			$( '#restore-button' ).addClass( 'disabled' );
		} else {
			$( '#restore-button' ).removeClass( 'disabled' );
		}
	};

	/**
	 * @private
	 */
	SELF.prototype._updateQueryHelperMinWidth = function() {
		var $queryHelper = $( '.query-helper' ),
			$tables = $queryHelper.find( 'table' ),
			tableWidth = _.max( _.map(
				$tables,
				function( e ) {
					return $( e ).width();
				}
			) );
		if ( tableWidth > $queryHelper.width() ) {
			$queryHelper.css(
				'min-width',
				Math.min(
					tableWidth + $tables.offset().left - $queryHelper.offset().left,
					$( window ).width() * 0.5
				)
			);
		}
	};

	/**
	 * @private
	 */
	SELF.prototype._updateQueryEditorSize = function() {
		if ( this._editor ) {
			// set CodeMirror width to container width determined by Flex
			this._editor._editor.setSize( 0, null ); // unset width so container width is unaffected by CodeMirror
			this._editor._editor.setSize( $( '.query-editor-container' ).width(), null ); // set width to container width
		}
	};

	/**
	 * @private
	 */
	SELF.prototype._initRdfNamespaces = function() {
		var category,
			select,
			ns,
			container = $( '.namespace-shortcuts' ),
			namespaces = wikibase.queryService.RdfNamespaces.NAMESPACE_SHORTCUTS;

		container.click( function( e ) {
			e.stopPropagation();
		} );

		// add namespaces to dropdowns
		for ( category in namespaces ) {
			select = $( '<select>' ).attr( 'class', 'form-control' ).append(
					$( '<option>' ).text( category ) ).appendTo( container );
			for ( ns in namespaces[category] ) {
				select.append(
					$( '<option>' ).text( ns ).attr( 'value', namespaces[category][ns] )
				);
			}
		}
	};

	/**
	 * @private
	 */
	SELF.prototype._initQuery = function() {
		if ( window.location.hash !== '' ) {
			if ( location.hash.indexOf( '#result#' ) === 0 ) {
				location.hash = location.hash.replace( '#result#', '#' );
			}

			this._isHistoryDisabled = true;
			this._editor.setValue( decodeURIComponent( window.location.hash.substr( 1 ) ) );
			this._editor.refresh();
			this._isHistoryDisabled = false;
		}
	};

	/**
	 * @private
	 */
	SELF.prototype._initDataUpdated = function() {
		var self = this,
			$label = $( '.dataUpdated' );

		var updateDataStatus = function() {
			self._sparqlApi.queryDataUpdatedTime().done( function( time, difference ) {
				var labelClass = 'list-group-item-danger';
				if ( difference <= 60 * 2 ) {
					labelClass = 'list-group-item-success';
				} else if ( difference <= 60 * 15 ) {
					labelClass =  'list-group-item-warning';
				}

				$label.html( $( '<a>' ).addClass( 'fa fa-refresh badge ' + labelClass ).html( ' ' ) );
			} );
		};

		updateDataStatus();

		window.setInterval( updateDataStatus, 10 * 60 * 1000 );

		$label.hover( function() {
			updateDataStatus();

			var e = $( this );
			self._sparqlApi.queryDataUpdatedTime().done( function( time, difference ) {
				var text = moment.duration( -difference, 'seconds' ).humanize( true ),
					title = time,
					badge = '<span class="badge">' + text + '</span>';

				$label.attr( 'title', title );
				e.popover( {
					html: true,
					trigger: 'hover',
					placement: 'top',
					content: $.i18n( 'wdqs-app-footer-updated-ago', badge )
				} );
			} ).fail( function() {
				e.popover( {
					content: '[unable to connect]'
				} );
			} );
		}, function() {
			var e = $( this );
			e.popover( 'destroy' );
		} );
	};

	/**
	 * @private
	 */
	SELF.prototype._isEmptyQuery = function() {
		if ( this._editor.getValue() === '' ) {
			return true;
		}
	};

	/**
	 * @private
	 */
	SELF.prototype._initHandlers = function() {
		var self = this;
		$( '#query-form' ).submit( $.proxy( this._handleQuerySubmit, this ) );
		$( '.namespace-shortcuts' ).on( 'change', 'select',
				$.proxy( this._handleNamespaceSelected, this ) );

		$( '.addPrefixes' ).click( function() {
			var standardPrefixes = wikibase.queryService.RdfNamespaces.STANDARD_PREFIXES,
				prefixes = Object.keys( standardPrefixes ).map( function( x ) {
					return standardPrefixes[x];
				} ).join( '\n' );

			self._editor.prepandValue( prefixes + '\n\n' );
			self._track( 'buttonClick.addPrefixes' );
		} );

		$( '#format-button' ).click( function() {
			self._drawQueryHelper();
			if ( self._isQueryUnparsable !== true ) {
				self._editor.setValue( self._queryHelper.getQuery() );
			}
			self._track( 'buttonClick.standardizeFormat' );
		} );

		$( '[data-target="#QueryExamples"]' ).click( function() {
			self._track( 'buttonClick.examples' );
		} );

		$( '#clear-button' ).click( function() {
			self._editor.setValue( '' );
			self._drawQueryHelper();
			self._track( 'buttonClick.clear' );
		} );

		$( '.restore' ).click( function( e ) {
			self._track( 'buttonClick.restore' );
			e.preventDefault();
			self._editor.restoreValue();
			self._drawQueryHelper();
		} );

		$( '.fullscreen-toggle' ).click( function( e ) {
			self._track( 'buttonClick.fullscreen' );
			e.preventDefault();
			self._toggleFullscreen();
		} );

		$( window ).on( 'popstate', $.proxy( this._initQuery, this ) );

		this._initPopovers();
	};

	/**
	 * @private
	 */
	SELF.prototype._toggleFullscreen = function () {
		if ( document.fullscreenElement || document.mozFullScreenElement ||
				document.webkitIsFullScreen || document.msFullscreenElement ) {
			if ( document.exitFullscreen ) {
				document.exitFullscreen();
			} else if ( document.msExitFullscreen ) {
				document.msExitFullscreen();
			} else if ( document.mozCancelFullScreen ) {
				document.mozCancelFullScreen();
			} else if ( document.webkitExitFullscreen ) {
				document.webkitExitFullscreen();
			}
		} else {
			var el = document.documentElement;

			if ( el.requestFullscreen ) {
				el.requestFullscreen();
			} else if ( el.msRequestFullscreen ) {
				el = document.body; // overwrite the element (for IE)
				el.msRequestFullscreen();
			} else if ( el.mozRequestFullScreen ) {
				el.mozRequestFullScreen();
			} else if ( el.webkitRequestFullscreen ) {
				el.webkitRequestFullScreen();
			}
		}
	};

	/**
	 * @private
	 */
	SELF.prototype._initPopovers = function() {
		var self = this;

		$( '.shortUrlTrigger.query' ).clickover( {
			'placement': 'right',
			'global_close': true,
			'html': true,
			'sanitize': false,
			'content': function() {
				self._updateQueryUrl();
				return self._shorten.shorten( window.location.href );
			}
		} ).click( function() {
			self._track( 'buttonClick.shortUrlQuery' );
		} );

		$( '.embed.result' ).clickover( {
			'placement': 'left',
			'global_close': true,
			'html': true,
			'content': function() {
				self._updateQueryUrl();

				var b = '';
				if ( self._selectedResultBrowser ) {
					b = '#defaultView:' + self._selectedResultBrowser + '\n';
					b = encodeURIComponent( b );
				}
				var $link = $( '<a>' )
					.attr( 'href', 'embed.html#' + b + window.location.hash.substring( 1 ) );
				var $html = $( '<textarea>' ).text(
					'<iframe ' +
						'style="width: 80vw; height: 50vh; border: none;" ' +
						'src="' + $link[0].href + '" ' +
						'referrerpolicy="origin" ' +
						'sandbox="allow-scripts allow-same-origin allow-popups" ' +
						'></iframe>'
				).click( function() {
					$html.select();
				} );

				return $html;
			}
		} ).click( function() {
			self._track( 'buttonClick.embedResult' );
		} );
	};

	/**
	 * @private
	 */
	SELF.prototype._handleQuerySubmit = function( e ) {
		var self = this;
		this._track( 'buttonClick.execute' );
		if ( !this._hasRunFirstQuery ) {
			this._track( 'firstQuery' );
			this._hasRunFirstQuery = true;
		}

		e.preventDefault();
		this._editor.save();
		this._updateQueryUrl();

		$( '#execute-button' ).prop( 'disabled', true );
		if ( this._isEmptyQuery() ) {
			$( '#query-result' ).hide();
			$( '#query-error' ).hide();
			$( '.label-danger' ).hide();
			$( '#empty-query-error' ).show();
			$( '#execute-button' ).prop( 'disabled', false );
		} else {
			$( '#empty-query-error' ).hide();
			this._resultView.draw( this._editor.getValue() ).catch( function ( error ) {
				try {
					self._editor.highlightError( error );
				} catch ( err ) {
					// ignore
				}
			} )
			.then( function () {
				$( '#execute-button' ).prop( 'disabled', false );
			} );
		}
	};

	/**
	 * @private
	 */
	SELF.prototype._handleNamespaceSelected = function( e ) {
		var ns,
			uri = e.target.value,
			current = this._editor.getValue();

		if ( current.indexOf( '<' + uri + '>' ) === -1 ) {
			ns = $( e.target ).find( ':selected' ).text();
			this._editor.setValue( 'PREFIX ' + ns + ': <' + uri + '>\n' + current );
		}

		// reselect group label
		e.target.selectedIndex = 0;
	};

	/**
	 * @private
	 */
	SELF.prototype._updateQueryUrl = function() {
		if ( this._isHistoryDisabled ) {
			return;
		}

		var hash = encodeURIComponent( this._editor.getValue() );
		hash = hash.replace( /[!'()*]/g, function( c ) {
			return '%' + c.charCodeAt( 0 ).toString( 16 );
		} );

		if ( window.location.hash !== hash ) {
			if ( window.history.pushState ) {
				window.history.pushState( null, null, '#' + hash );
			} else {
				window.location.hash = hash;
			}
		}
	};

	/**
	 * @private
	 */
	SELF.prototype._toast = function( $el, id ) {
		var cookie = 'hide-toast-' + id;
		if ( Cookies.get( cookie ) ) {
			return;
		}

		$.toast( {
			loader: false,
			stack: 1,
			text: $el[0].outerHTML,
			afterShown: function () {
				$( '.close-jq-toast-single' ).click( function () {
					Cookies.set( cookie, true );
				} );
			}
		} );
	};

	/**
	 * @private
	 */
	SELF.prototype._track = function( metricName, value, valueType ) {
		this._trackingApi.track( TRACKING_NAMESPACE + metricName, value, valueType );
	};

	return SELF;

}( jQuery, window, _, Cookies, moment ) );
