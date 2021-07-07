var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.api = wikibase.queryService.api || {};

wikibase.queryService.api.CodeSamples = ( function ( $ ) {
	'use strict';

	/**
	 * CodeSamples API for the Wikibase query service
	 *
	 * @class wikibase.queryService.api.CodeSamples
	 * @license GNU GPL v2+
	 *
	 * @author Lucas Werkmeister
	 * @author Jonas Kress
	 * @constructor
	 */
	function SELF( endpoint, root, index ) {
		var self = this;
		if ( endpoint.startsWith( '/' ) ) {
			var origin;
			if ( window.location.origin ) {
				origin = window.location.origin;
			} else {
				origin = window.location.protocol + '//' + window.location.host;
			}
			endpoint = origin + endpoint;
		}
		this._endpoint = endpoint;
		this._languages = {
			URL: {
				code: function( query ) {
					return endpoint + '?query=' + encodeURIComponent( query );
				}
			},
			HTML: {
				code: function( query ) {
					return '<iframe style="width: 80vw; height: 50vh; border: none;" ' +
						'src="' + root + 'embed.html#' +
						encodeURIComponent( query ) + '" ' +
						'referrerpolicy="origin" ' +
						'sandbox="allow-scripts allow-same-origin allow-popups"></iframe>';
				},
				mimetype: 'text/html'
			},
			Wikilink: {
				code: function( query ) {
					return '[' + index + '#' + encodeURIComponent( query ) + ' Query]';
				}
			},
			PHP: {
				escape: function( query ) {
					// try nowdoc first
					var identifiers = [ 'SPARQL', 'QUERY', 'EOF' ];
					for ( var index in identifiers ) {
						var identifier = identifiers[ index ];
						if ( !( new RegExp( '^' + identifier + '$', 'm' ).test( query ) ) ) {
							return '<<< \'' + identifier + '\'\n'
								+ query + '\n'
								+ identifier;
						}
					}

					// fall back to double quoted
					var escapedQuery = query
						.replace( /\\/g, '\\\\' )
						.replace( /"/g, '\\"' )
						.replace( /\$/g, '\\$' )
						.replace( /\n/g, '\\n' );
					return '"' + escapedQuery + '"';
				}
			},
			'JavaScript (jQuery)': {
				escape: function( query ) {
					var code = '';
					var lines = query.split( '\n' );
					for ( var index in lines ) {
						var line = lines[ index ];
						var escapedLine = line
							.replace( /\\/g, '\\\\' )
							.replace( /"/g, '\\"' );
						if ( index > 0 ) {
							code += '\\n" +\n        ';
						}
						code += '"' + escapedLine;
					}
					if ( index >= 0 ) {
						code += '"';
					}
					return code;
				},
				mimetype: 'application/javascript'
			},
			'JavaScript (modern)': {
				escape: function( query ) {
					var escapedQuery = query
						.replace( /\\/g, '\\\\' )
						.replace( /`/g, '\\`' )
						.replace( /\$/g, '\\$' );
					return '`' + escapedQuery + '`';
				},
				mimetype: 'application/javascript'
			},
			Java: {
				escape: function( query ) {
					var code = '';
					var lines = query.split( '\n' );
					for ( var index in lines ) {
						var line = lines[ index ];
						var escapedLine = line
							.replace( /\\/g, '\\\\' )
							.replace( /"/g, '\\"' );
						if ( index > 0 ) {
							code += '\\n" +\n                ';
						}
						code += '"' + escapedLine;
					}
					if ( index >= 0 ) {
						code += '"';
					}
					return code;
				}
			},
			Perl: {
				escape: function( query ) {
					var escapedQuery = query.replace( /#.*\n/g, '' );
					return '<<\'_SPARQL_QUERY_\';\n' + escapedQuery + '\n_SPARQL_QUERY_';
				}
			},
			Python: {
				escape: function( query ) {
					var escapedQuery = query
						.replace( /\\/g, '\\\\' )
						.replace( /"""/g, '""\\"' );
					return '"""' + escapedQuery + '"""';
				}
			},
			'Python (Pywikibot)': {
				escape: function( query ) {
					return self._languages.Python.escape( query );
				}
			},
			Ruby: {
				escape: function( query ) {
					// try heredoc first
					var identifiers = [ 'SPARQL', 'QUERY', 'EOF' ];
					for ( var index in identifiers ) {
						var identifier = identifiers[ index ];
						if ( !( new RegExp( '^' + identifier + '$', 'm' ).test( query ) ) ) {
							return '<<\'' + identifier + '\'.chop\n' // .chop removes the trailing newline
								+ query + '\n'
								+ identifier;
						}
					}

					// fall back to double quoted
					var escapedQuery = query
						.replace( /\\/g, '\\\\' )
						.replace( /"/g, '\\"' )
						.replace( /#/g, '\\#' )
						.replace( /\n/g, '\\n' );
					return '"' + escapedQuery + '"';
				}
			},
			R: {
				escape: function( query ) {
					var escapedQuery = query
						.replace( /\\/g, '\\\\' )
						.replace( /'/g, '\\\'' )
						.replace( /\n/g, '\\n' );
					return '\'' + escapedQuery + '\'';
				},
				mimetype: 'text/x-rsrc'
			},
			Matlab: {
				escape: function( query ) {
					var escapedQuery = query
						.replace( /\\/g, '\\\\' )
						.replace( /'/g, '\'\'' )
						.replace( /\n/g, '\\n' );
					return '\'' + escapedQuery + '\'';
				},
				mimetype: 'text/x-octave'
			},
			listeria: {
				escape: function( query ) {
					var escapedQuery = query
						.replace( /\|/g, '{{!}}' )
						.replace( /}}/g, '} }' ); // TODO try to exactly preserve query
					return escapedQuery;
				}
			}
		};
	}

	/**
	 * @property {string}
	 * @private
	 */
	SELF.prototype._endpoint = null;

	/**
	 * @return {jQuery.Promise} yields a list of code examples for the current query
	 * ({ code: string, mimetype: string })
	 */
	SELF.prototype.getExamples = function ( currentQuery ) {
		var self = this,
			deferred = new $.Deferred(),
			data = {},
			loadFiles = [];

		$.each( this._languages, function ( name, language ) {
			data[name] = {
				mimetype: 'mimetype' in language ?
					language.mimetype :
					'text/x-' + name.toLowerCase()
			};
			var query = currentQuery;
			if ( 'escape' in language ) {
				query = language.escape( query );
			}
			if ( 'code' in language ) {
				data[name].code = language.code( query );
			} else {
				loadFiles.push(
					$.get(
						'examples/code/' + name + '.txt',
						function ( code ) {
							data[name].code = code
								.replace( '{ENDPOINT_URL}', self._endpoint )
								.replace( '{SPARQL_QUERY}', query );
						},
						'text'
					)
				);
			}
		} );

		$.when.apply( $, loadFiles ).then(
			function () {
				deferred.resolve( data );
			},
			deferred.reject.bind( deferred )
		);

		return deferred.promise();
	};

	return SELF;

}( jQuery ) );
