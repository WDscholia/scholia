var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};

wikibase.queryService.ui.ResultView = ( function( $, download, window ) {
	'use strict';

	var PREVIEW_TIMEOUT = 1000,
        RAWGRAPHS_BASE_URL = 'http://wikidata.rawgraphs.io/?url=',
		PREVIEW_LIMIT = 20;

	/**
	 * A result view for sparql queries
	 *
	 * @class wikibase.queryService.ui.ResultView
	 * @license GNU GPL v2+
	 *
	 * @author Jonas Kress
	 * @constructor
	 *
	 * @param {wikibase.queryService.api.Sparql} sparqlApi
	 * @param {wikibase.queryService.api.QuerySamples} querySamplesApi
	 * @param {wikibase.querService.api.Wikibase} wikibaseApi
	 * @param {?wikibase.queryService.api.CodeSamples} codeSamplesApi
	 * @param {wikibase.queryService.api.UrlShortener} shortUrlApi
	 * @param {wikibase.queryService.ui.editor.Editor} [editor]
	 * @param {string} queryBuilderUrl
	 */
	function SELF(
		sparqlApi,
		querySamplesApi,
		wikibaseApi,
		codeSamplesApi,
		shortUrlApi,
		editor,
		queryBuilderUrl
	) {
		this._sparqlApi = sparqlApi;
		this._querySamplesApi = querySamplesApi;
		this._wikibaseApi = wikibaseApi;
		this._codeSamplesApi = codeSamplesApi;
		this._shorten = shortUrlApi;
		this._editor = editor || null;
		this._queryBuilderUrl = queryBuilderUrl;
		this._originalDocumentTitle = document.title;

		this._init();
	}

	/**
	 * @property {string}
	 * @private
	 */
	SELF.prototype._query = null;

	/**
	 * @property {string}
	 * @private
	 */
	SELF.prototype._sparqlQuery = null;

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
	 * @property {?wikibase.queryService.api.CodeSamples}
	 * @private
	 */
	SELF.prototype._codeSamplesApi = null;

	/**
	 * @property {?wikibase.queryService.ui.editor.Editor}
	 * @private
	 */
	SELF.prototype._editor = null;

	/**
	 * @property {wikibase.queryService.api.UrlShortener}
	 * @private
	 */
	SELF.prototype._shorten = null;

	/**
	 * @property {string}
	 * @private
	 */
	SELF.prototype._selectedResultBrowser = null;

	/**
	 * @property {wikibase.queryService.ui.toolbar.Actionbar}
	 * @private
	 */
	SELF.prototype._actionBar = null;

	/**
	 * @property {wikibase.queryService.api.Tracking}
	 * @private
	 */
	SELF.prototype._trackingApi = null;

	/**
	 * @property {boolean}
	 * @private
	 */
	SELF.prototype._hasRunFirstQuery = false;

	/**
	 * @property {string}
	 * @private
	 */
	SELF.prototype._queryBuilderUrl = null;

	/**
	 * @property {string}
	 * @private
	 */
	SELF.prototype._originalDocumentTitle = null;

	/**
	 * @property {Object}
	 * @private
	 */
	SELF.prototype._resultBrowsers = {
		Table: {
			icon: 'glyphicon-th-list',
			label: [ 'wdqs-app-resultbrowser-table', 'Table' ],
			class: 'TableResultBrowser',
			object: null,
			$element: null
		},
		ImageGrid: {
			icon: 'glyphicon-picture',
			label: [ 'wdqs-app-resultbrowser-image-grid', 'Image grid' ],
			class: 'ImageResultBrowser',
			object: null,
			$element: null
		},
		Polestar: {
			icon: 'fa-certificate',
			label: [ 'wdqs-app-resultbrowser-graph-builder', 'Graph builder' ],
			class: 'PolestarResultBrowser',
			object: null,
			$element: null
		},
		Map: {
			icon: 'glyphicon-map-marker',
			label: [ 'wdqs-app-resultbrowser-map', 'Map' ],
			class: 'CoordinateResultBrowser',
			object: null,
			$element: null
		},
		LineChart: {
			icon: 'fa-line-chart',
			label: [ 'wdqs-app-resultbrowser-line-chart', 'Line chart' ],
			class: 'LineChartResultBrowser',
			object: null,
			$element: null
		},
		BarChart: {
			icon: 'fa-bar-chart',
			label: [ 'wdqs-app-resultbrowser-bar-chart', 'Bar chart' ],
			class: 'BarChartResultBrowser',
			object: null,
			$element: null
		},
		ScatterChart: {
			icon: 'fa-braille',
			label: [ 'wdqs-app-resultbrowser-scatter-chart', 'Scatter chart' ],
			class: 'ScatterChartResultBrowser',
			object: null,
			$element: null
		},
		AreaChart: {
			icon: 'fa-area-chart',
			label: [ 'wdqs-app-resultbrowser-area-chart', 'Area chart' ],
			class: 'AreaChartResultBrowser',
			object: null,
			$element: null
		},
		BubbleChart: {
			icon: 'glyphicon-tint',
			label: [ 'wdqs-app-resultbrowser-bubble-chart', 'Bubble chart' ],
			class: 'BubbleChartResultBrowser',
			object: null,
			$element: null
		},
		TreeMap: {
			icon: 'glyphicon-th',
			label: [ 'wdqs-app-resultbrowser-tree-map', 'Tree map' ],
			class: 'TreeMapResultBrowser',
			object: null,
			$element: null
		},
		Tree: {
			icon: 'fa-tree',
			label: [ 'wdqs-app-resultbrowser-tree', 'Tree' ],
			class: 'TreeResultBrowser',
			object: null,
			$element: null
		},
		Timeline: {
			icon: 'glyphicon-calendar',
			label: [ 'wdqs-app-resultbrowser-timeline', 'Timeline' ],
			class: 'TimelineResultBrowser',
			object: null,
			$element: null
		},
		Dimensions: {
			icon: 'glyphicon-random',
			label: [ 'wdqs-app-resultbrowser-dimensions', 'Dimensions' ],
			class: 'MultiDimensionResultBrowser',
			object: null,
			$element: null
		},
		Graph: {
			icon: 'glyphicon-retweet',
			label: [ 'wdqs-app-resultbrowser-graph', 'Graph' ],
			class: 'GraphResultBrowser',
			object: null,
			$element: null
		}
	};

	/**
	 * @property {string}
	 */
	SELF.prototype.trackingNamespace = 'wikibase.queryService.ui.';

	/**
	 * Initialize private members and call delegate to specific init methods
	 *
	 * @private
	 */
	SELF.prototype._init = function() {
		if ( !this._trackingApi ) {
			this._trackingApi = new wikibase.queryService.api.Tracking();
		}

		this._actionBar = new wikibase.queryService.ui.toolbar.Actionbar( $( '.action-bar' ) );

		this._sparqlQuery = this._query = new wikibase.queryService.ui.queryHelper.SparqlQuery();

		this._internationalizeCharts();

		this._initResultBrowserMenu();
		this._initExamples();
		this._initCodeExamples();
		this._initQueryLinkPopover();
		this._initHandlersDownloads();
	};

	/**
	 * @private
	 */
	SELF.prototype._internationalizeCharts = function() {
		$.each( this._resultBrowsers, function( key, chart ) {
			var i18nKey = chart.label[0],
				fallback = chart.label[1];

			chart.label = wikibase.queryService.ui.i18n.getMessage( i18nKey, fallback );
		} );
	};

	/**
	 * @private
	 */
	SELF.prototype._initResultBrowserMenu = function() {
		$.each( this._resultBrowsers, function( key, b ) {
			var $element = $( '<li class="result-browser-item"><a class="result-browser" href="#">' +
					'<span class="toolbar-label">' + b.label + ' ' + '</span>' + '<span class="toolbar-icon ' + b.icon.split( '-', 1 )[0] + ' ' + b.icon + '"></span>' +
					'</a></li>' );
			$element.appendTo( $( '#result-browser-menu' ) );
			b.$element = $element;
		} );
	};

	/**
	 * Render a given SPARQL query
	 *
	 * @param {String} query
	 * @return {JQuery.Promise}
	 */
	SELF.prototype.draw = function( query ) {
		var self = this,
			deferred = $.Deferred();

		this._query = query;

		this._actionBar.show( 'wdqs-action-query', '', 'info', 100 );

		$( '#query-result' ).empty().hide();
		$( '.result' ).hide();
		$( '#query-error' ).hide();

		this._sparqlApi.query( query )
			.done( function () {
				self._handleQueryResult();
				deferred.resolve();
			} )
			.fail( function() {
				var error = self._handleQueryError();
				deferred.reject( error );
			} );

		return deferred.promise();
	};

	/**
	 * Render a preview of the given SPARQL query
	 *
	 * @param {String} query
	 * @return {JQuery.Promise}
	 */
	SELF.prototype.drawPreview = function( query ) {
		var self = this,
			deferred = $.Deferred(),
			prefixes = wikibase.queryService.RdfNamespaces.ALL_PREFIXES,
			previousQueryString = this._sparqlQuery.getQueryString();

		this._query = query;
		this._sparqlQuery.parse( query, prefixes );
		this._sparqlQuery.setLimit( PREVIEW_LIMIT );

		if ( previousQueryString === this._sparqlQuery.getQueryString() ) {
			return deferred.reject().promise();
		}

		$( '#query-result' ).empty().hide();
		$( '.result' ).hide();
		$( '#query-error' ).hide();
		this._actionBar.hide();

		this._sparqlApi.query( this._sparqlQuery.getQueryString(), PREVIEW_TIMEOUT )
			.done( function () {
				self._handleQueryResult();
				deferred.resolve();
				window.setTimeout( function() {
					self._actionBar.show( 'wdqs-action-preview', '', 'default' );
				}, 200 );
			} )
			.fail( function() {
				deferred.reject();
			} );

		return deferred.promise();
	};

	/**
	 * @private
	 */
	SELF.prototype._handleQueryError = function() {
		$( '#execute-button' ).prop( 'disabled', false );

		var error = this._sparqlApi.getError(),
			errorMessageKey = null,
			codes = this._sparqlApi.ERROR_CODES;

		switch ( error.code ) {
		case codes.TIMEOUT:
			errorMessageKey = 'wdqs-action-timeout';
			break;
		case codes.MALFORMED:
			errorMessageKey = 'wdqs-action-malformed-query';
			break;
		case codes.SERVER:
			errorMessageKey = 'wdqs-action-server-error';
			break;
		default:
			errorMessageKey = 'wdqs-action-unknow-error';
			break;
		}

		if ( error.debug ) {
			$( '#query-error' ).html( $( '<pre>' ).text( error.debug ) ).show();
		}

		this._actionBar.show( errorMessageKey || '', error.message || '', 'danger' );
		this._track( 'result.error.' + ( errorMessageKey || 'unknown' ) );

		return error.debug === undefined ? '' : error.debug;
	};

	/**
	 * @private
	 */
	SELF.prototype._handleQueryResult = function() {
		var api = this._sparqlApi;

		$( '#response-summary' ).text(
			wikibase.queryService.ui.i18n.getMessage(
				'wdqs-app-resultbrowser-response-summary',
				'$1 results in $2&nbsp;ms',
				[ api.getResultLength(), api.getExecutionTime() ]
			).replace( /&nbsp;/g, '\xA0' )
		);
		$( '.result' ).show();

		$( '#execute-button' ).prop( 'disabled', false );
		var uri = api.getQueryUri();
        $( '.queryUri' ).attr( 'href', uri );
        $( '.rawGraphsUri' ).attr( 'href', RAWGRAPHS_BASE_URL + uri );

		var defaultBrowser = this._createResultBrowsers( api.getResultRawData() );
		this._drawResult( defaultBrowser );
		this._selectedResultBrowser = null;

		this._track( 'result.resultLength', api.getResultLength() );
		this._track( 'result.executionTime', api.getExecutionTime(), 'ms' );
		this._track( 'result.received.success' );

		return false;
	};

	/**
	 * @private
	 * @return {Object} default result browser
	 */
	SELF.prototype._createResultBrowsers = function( resultData ) {
		var self = this;

		var browserOptions = this._getBrowserOptions();
		var defaultBrowser = null;

		if ( browserOptions.defaultName !== null ) {
			this._track( 'result.browser.' + browserOptions.defaultName );
		} else {
			this._track( 'result.browser.default' );
		}

		// instantiate
		$.each( this._resultBrowsers, function( key, b ) {
			var instance = new wikibase.queryService.ui.resultBrowser[b.class]();
			instance.setSparqlApi( self._sparqlApi );

			if ( browserOptions.defaultName === key ) {
				self._setSelectedDisplayType( b );
				defaultBrowser = instance;
			}

			if ( browserOptions.optionsMap.has( key ) ) {
				var options = new wikibase.queryService.ui.resultBrowser.helper.Options(
					browserOptions.optionsMap.get( key )
				);
				instance.setOptions( options );
			}

			b.object = instance;
		} );
		if ( defaultBrowser === null ) {
			defaultBrowser = this._resultBrowsers.Table.object;
		}

		defaultBrowser.resetVisitors();

		// wire up
		$.each( this._resultBrowsers, function( key, b ) {
			defaultBrowser.addVisitor( b.object );
			b.object.setResult( resultData );
		} );

		return defaultBrowser;
	};

	/**
	 * @private
	 * @return {{defaultName: string?, optionsMap: Map.<string, Object>}}
	 */
	SELF.prototype._getBrowserOptions = function() {
		var defaultName = null,
			optionsMap = new Map(),
			regex = /#(defaultView|view):(\w+)(\{.*\})?/g,
			match;

		while ( ( match = regex.exec( this._query ) ) !== null ) {
			var name = match[2];
			if ( !this._resultBrowsers.hasOwnProperty( name ) ) {
				continue;
			}
			if ( match[1] === 'defaultView' ) {
				defaultName = name;
			}
			if ( match[3] ) {
				var options = optionsMap.has( name ) ? optionsMap.get( name ) : {};
				try {
					optionsMap.set(
						name,
						$.extend( options, JSON.parse( match[3] ) )
					);
				} catch ( e ) {
					window.console.error( e );
				}
			}
		}

		return { defaultName: defaultName, optionsMap: optionsMap };
	};

	/**
	 * @private
	 */
	SELF.prototype._initExamples = function() {
		var self = this;
		new wikibase.queryService.ui.dialog.QueryExampleDialog( $( '#QueryExamples' ),
				this._querySamplesApi, function( query, title ) {
					if ( !query || !query.trim() ) {
						return;
					}

					if ( self._editor ) {
						self._editor.setValue( '#' + title + '\n' + query );
						$( '#QueryExamples' ).one( 'hidden.bs.modal', function() {
							setTimeout( function() { self._editor.focus(); }, 0 );
						} );
					} else {
						self.draw( query );
						window.location.hash = '#' + encodeURIComponent( '#' + title + '\n' + query );
					}
				}, this._wikibaseApi );
	};

	/**
	 * @private
	 */
	SELF.prototype._initCodeExamples = function() {
		var self = this;
		if ( !self._codeSamplesApi ) {
			return;
		}
		new wikibase.queryService.ui.dialog.CodeExample(
			$( '#CodeExamples' ),
			function () {
				return self._codeSamplesApi.getExamples( self._query );
			}
		);
	};

	/**
	 * @private
	 */
	SELF.prototype._initQueryLinkPopover = function() {
		var self = this;
		$( '.shortUrlTrigger.result' ).clickover( {
			placement: 'left',
			'global_close': true,
			'html': true,
			'sanitize': false,
			'content': function() {
				var queryUrl;
				if ( self._editor ) {
					queryUrl = '#' + encodeURIComponent( self._editor.getValue() );
				} else {
					queryUrl = window.location.hash;
				}
				var $link = $( '<a>' ).attr( 'href', 'embed.html' + queryUrl );
				return self._shorten.shorten( $link[0].href );
			}
		} ).click( function() {
			self._track( 'buttonClick.shortUrlResult' );
		} );
	};

	/**
	 * @private
	 */
	SELF.prototype._initHandlersDownloads = function() {
		var api = this._sparqlApi;
		var DOWNLOAD_FORMATS = {
			'CSV': {
				handler: $.proxy( api.getResultAsCsv, api ),
				mimetype: 'text/csv;charset=utf-8'
			},
			'JSON': {
				handler: $.proxy( api.getResultAsJson, api ),
				mimetype: 'application/json;charset=utf-8'
			},
			'TSV': {
				handler: $.proxy( api.getSparqlTsv, api ),
				mimetype: 'text/tab-separated-values;charset=utf-8'
			},
			'Simple TSV': {
				handler: $.proxy( api.getSimpleTsv, api ),
				mimetype: 'text/tab-separated-values;charset=utf-8',
				ext: 'tsv'
			},
			'Full JSON': {
				handler: $.proxy( api.getResultAsAllJson, api ),
				mimetype: 'application/json;charset=utf-8',
				ext: 'json'
			},
			'HTML': {
				handler: $.proxy( api.getResultHTML, api ),
				mimetype: 'application/html;charset=utf-8',
				ext: 'html'
			},
			'SVG': {
				handler: function() {
					var $svg = $( '#query-result svg' );

					if ( !$svg.length ) {
						return null;
					}

					$svg.attr( {
						version: '1.1',
						'xmlns': 'http://www.w3.org/2000/svg',
						'xmlns:svg': 'http://www.w3.org/2000/svg',
						'xmlns:xlink': 'http://www.w3.org/1999/xlink'
					} );

					try {
						return '<?xml version="1.0" encoding="utf-8"?>\n'
							+ $svg[0].outerHTML;
					} catch ( ex ) {
						return null;
					}
				},
				mimetype: 'data:image/svg+xml;charset=utf-8',
				ext: 'svg'
			}
		};

		var self = this;
		var downloadHandler = function( filename, handler, mimetype ) {
			return function( e ) {
				e.preventDefault();

				// see: http://danml.com/download.html
				self._track( 'buttonClick.download.' + filename );

				var data = handler();

				if ( data ) {
					download( data, filename, mimetype );
				}
			};
		};

		for ( var format in DOWNLOAD_FORMATS ) {
			var extension = DOWNLOAD_FORMATS[format].ext || format.toLowerCase();
			var formatName = format.replace( /\s/g, '-' );
			$( '#download' + formatName ).click( downloadHandler(
				'query.' + extension,
				DOWNLOAD_FORMATS[format].handler,
				DOWNLOAD_FORMATS[format].mimetype
			) );
		}
	};

	/**
	 * @private
	 */
	SELF.prototype._handleQueryResultBrowsers = function() {
		var self = this;

		$.each( this._resultBrowsers, function( key, b ) {
			b.$element.off( 'click' );
			if ( b.object.isDrawable() ) {
				b.$element.removeClass( 'result-browser-inactive' );
				b.$element.css( 'opacity', 1 ).attr( 'href', '#' );
				b.$element.click( function() {
					$( this ).closest( '.open' ).removeClass( 'open' );

					self._setSelectedDisplayType( b );

					$( '#query-result' ).html( '' );
					self._drawResult( b.object );
					self._selectedResultBrowser = key;
					self._track( 'buttonClick.display.' + key );
					return false;
				} );
			} else {
				b.$element.addClass( 'result-browser-inactive' );
				b.$element.css( 'opacity', 0.5 ).removeAttr( 'href' );
			}
		} );
	};

	/**
	 * @private
	 */
	SELF.prototype._drawErrorResult = function( resultBrowser ) {
		var data = _.find( this._resultBrowsers, function( browser ) {
			if ( browser.object === resultBrowser ) {
				return browser;
			}
		} );

		this._resultBrowsers.Table.object.draw( $( '#query-result' ) );
		this._actionBar.show( 'wdqs-action-error-display', data && data.label || null, 'warning' );
	};

	/**
	 * @private
	 */
	SELF.prototype._drawResult = function( resultBrowser ) {
		var self = this;

		$( window ).off( 'scroll.resultBrowser' );
		$( window ).off( 'resize.resultBrowser' );
		this._actionBar.show( 'wdqs-action-render', '',  'success', 100 );
		window.setTimeout( function() {
			try {
				$( '#query-result' ).show();
				MathJax.startup.output.clearCache();
				resultBrowser.draw( $( '#query-result' ) );
				$( '#MJX-CHTML-styles' ).replaceWith( MathJax.chtmlStylesheet() );
				self._actionBar.hide();

				var title = self._query.match( /#title:(.*)/ );

				if ( title && title[ 1 ] ) {
					self._actionBar.show( title[ 1 ] , '' );
					document.title = title[ 1 ] + ' - ' + self._originalDocumentTitle;
				} else {
					document.title = self._originalDocumentTitle;
				}
			} catch ( e ) {
				self._drawErrorResult( resultBrowser );

				window.console.error( e );
			}

			self._handleQueryResultBrowsers();
		}, 20 );
	};

	/**
	 * @private
	 */
	SELF.prototype._setSelectedDisplayType = function ( browser ) {
		$( '#display-button-icon' ).attr( 'class', browser.icon.split( '-', 1 )[0] + ' ' + browser.icon );
		$( '#display-button-label' ).text( browser.label );
	};

	/**
	 * @private
	 */
	SELF.prototype._track = function( metricName, value, valueType ) {
		var referrerType = this._getReferrerType();
		this._trackingApi.track( this.trackingNamespace + 'app.' + metricName, value, valueType );
		this._trackingApi.track(
			this.trackingNamespace + 'referrer.' + referrerType + '.app.' + metricName,
			value,
			valueType
		);
	};

	SELF.prototype._getReferrerType = function () {
		if ( !document.referrer ) {
			return 'no-referrer';
		}

		if ( document.referrer.startsWith( this._queryBuilderUrl ) ) {
			return 'query-builder';
		}

		return 'other-referrer';
	};

	return SELF;

}( jQuery, download, window ) );
