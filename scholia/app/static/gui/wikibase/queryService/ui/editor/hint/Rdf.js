var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.editor = wikibase.queryService.ui.editor || {};
wikibase.queryService.ui.editor.hint = wikibase.queryService.ui.editor.hint || {};

( function( $, wikibase ) {
	'use strict';

	var MODULE = wikibase.queryService.ui.editor.hint;

	/**
	 * Code completion for Wikibase entities RDF prefixes in SPARQL completes SPARQL keywords and ?variables
	 *
	 * @class wikibase.queryService.ui.editor.hint.Rdf licence GNU GPL v2+
	 *
	 * @author Jonas Kress
	 * @param {wikibase.queryService.api.Wikibase} api
	 * @param {wikibase.queryService.RdfNamespaces} rdfNamespaces
	 * @constructor
	 */
	var SELF = MODULE.Rdf = function( api, rdfNamespaces ) {
		this._api = api;
		this._rdfNamespaces = rdfNamespaces;

		if ( !this._api ) {
			this._api = new wikibase.queryService.api.Wikibase();
		}

		if ( !this._rdfNamespaces ) {
			this._rdfNamespaces = wikibase.queryService.RdfNamespaces;
		}
	};

	/**
	 * @property {wikibase.queryService.RdfNamespaces}
	 * @private
	 */
	SELF.prototype._rdfNamespaces = null;

	/**
	 * @property {wikibase.queryService.api.Wikibase}
	 * @private
	 */
	SELF.prototype._api = null;

	/**
	 * Get list of hints
	 *
	 * @return {jQuery.Promise} Returns the completion as promise ({list:[], from:, to:})
	 */
	SELF.prototype.getHint = function( editorContent, lineContent, lineNum, cursorPos ) {
		var deferred = new $.Deferred(),
			currentWord = this._getCurrentWord( lineContent, cursorPos ),
			list,
			prefix,
			term,
			entityPrefixes,
			self = this;

		if ( !currentWord.word.match( /\S+:\S*/ ) ) {
			return deferred.reject().promise();
		}

		prefix = this._getPrefixFromWord( currentWord.word.trim() );
		term = this._getTermFromWord( currentWord.word.trim() );
		entityPrefixes = this._extractPrefixes( editorContent );

		if ( !entityPrefixes[prefix] ) { // unknown prefix
			if ( this._rdfNamespaces.ALL_PREFIXES && this._rdfNamespaces.ALL_PREFIXES[prefix] ) {
				// Sparql.js may deal with those prefixes
				return deferred.reject().promise();
			}
			list = [ {
				text: term,
				displayText: 'Unknown prefix \'' + prefix + ':\''
			} ];
			return deferred.resolve( this._getHintCompletion( lineNum, currentWord, prefix, list ) )
					.promise();
		}

		if ( term.length === 0 ) { // empty search term
			list = [ {
				text: term,
				displayText: 'Type to search for an entity'
			} ];
			return deferred.resolve( this._getHintCompletion( lineNum, currentWord, prefix, list ) )
					.promise();
		}

		if ( entityPrefixes[prefix] ) { // search entity
			this._searchEntities( term, entityPrefixes[prefix] ).done(
					function( list ) {
						return deferred.resolve( self._getHintCompletion( lineNum, currentWord,
								prefix, list ) );
					} );
		}

		return deferred.promise();
	};

	SELF.prototype._getPrefixFromWord = function( word ) {
		return word.split( ':', 1 )[0];
	};

	SELF.prototype._getTermFromWord = function( word ) {
		// Do not use split here because the search string may contain ':'
		return word.substring( word.indexOf( ':' ) + 1 );
	};

	SELF.prototype._getHintCompletion = function( lineNum, currentWord, prefix, list ) {
		var completion = {
			list: []
		};
		completion.from = {
			line: lineNum,
			char: currentWord.start + prefix.length + 1
		};
		completion.to = {
			line: lineNum,
			char: currentWord.end
		};
		completion.list = list;

		return completion;
	};

	SELF.prototype._searchEntities = function( term, type ) {
		var entityList = [],
			deferred = $.Deferred();

		this._api.searchEntities( term, type ).done( function( data ) {
			$.each( data.search, function( key, value ) {
				entityList.push( {
					className: 'wikibase-rdf-hint',
					text: value.id,
					render: function( element, self, data ) {
						var bdi = document.createElement( 'bdi' );
						element.appendChild( document.createTextNode( value.label ) );
						element.appendChild( document.createTextNode( ' (' ) );
						bdi.textContent = value.id;
						element.appendChild( bdi );
						element.appendChild( document.createTextNode( ') ' ) );
						element.appendChild( document.createTextNode( value.description ) );
						element.appendChild( document.createTextNode( '\n' ) );
					}
				} );
			} );

			deferred.resolve( entityList );
		} );

		return deferred.promise();
	};

	SELF.prototype._getCurrentWord = function( line, position ) {
		var pos = position - 1,
			colon = false,
			wordSeparator = [ '/', '*', '+', ' ', ';', '.', '\n', '\t', '(', ')', '{', '}', '[', ']' ];

		if ( pos < 0 ) {
			pos = 0;
		}

		while ( wordSeparator.indexOf( line.charAt( pos ) ) === -1
				|| ( line.charAt( pos ) === ' ' && colon === false )
				|| ( line.charAt( pos ) === ':' && colon === false ) ) {

			if ( line.charAt( pos ) === ':' ) {
				colon = true;
			}
			pos--;
			if ( pos < 0 ) {
				break;
			}
		}
		var left = pos + 1;

		pos = position;
		while ( wordSeparator.indexOf( line.charAt( pos ) ) === -1 ) {
			pos++;
			if ( pos >= line.length ) {
				break;
			}
		}
		var right = pos;

		var word = line.substring( left, right );
		return {
			word: word,
			start: left,
			end: right
		};
	};

	SELF.prototype._extractPrefixes = function( text ) {
		var prefixes = this._rdfNamespaces.getPrefixMap( this._rdfNamespaces.ENTITY_TYPES ),
			types = this._rdfNamespaces.ENTITY_TYPES,
			lines = text.split( '\n' ),
			matches;

		$.each( lines, function( index, line ) {
			// PREFIX wd: <http://www.wikidata.org/entity/>
			if ( ( matches = line.match( /(PREFIX) (\S+): <([^>]+)>/ ) ) ) {
				if ( types[matches[3]] ) {
					prefixes[matches[2]] = types[matches[3]];
				}
			}
		} );

		return prefixes;
	};

}( jQuery, wikibase ) );
