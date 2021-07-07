var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.editor = wikibase.queryService.ui.editor || {};

wikibase.queryService.ui.editor.Editor = ( function( $, wikibase, CodeMirror ) {
	'use strict';

	var CODEMIRROR_DEFAULTS = {
			'lineNumbers': true,
			'matchBrackets': true,
			'mode': 'sparql',
			'extraKeys': {
				'Ctrl-Space': 'autocomplete',
				'Ctrl-Alt-Space': 'autocomplete',
				'Alt-Enter': 'autocomplete',
				'Tab': function( cm ) {
					var spaces = Array( cm.getOption( 'indentUnit' ) + 1 ).join( ' ' );
					cm.replaceSelection( spaces );
				},
				'F11': function( cm ) {
					cm.setOption( 'fullScreen', !cm.getOption( 'fullScreen' ) );
				},
				'Esc': function( cm ) {
					if ( cm.getOption( 'fullScreen' ) ) {
						cm.setOption( 'fullScreen', false );
					}
				},
				'Ctrl-/': function ( cm ) {
					cm.toggleComment( {
						commentBlankLines: true,
						fullLines: true
					} );
				}
			},
			'viewportMargin': Infinity,
			'hintOptions': {
				closeCharacters: /[]/,
				completeSingle: false
			}
		},
		ERROR_LINE_MARKER = null,
		ERROR_CHARACTER_MARKER = null;

	var LOCAL_STORAGE_KEY = 'wikibase.queryService.ui.Editor';

	/**
	 * An ui editor for the Wikibase query service
	 *
	 * @class wikibase.queryService.ui.editor.Editor
	 * @license GNU GPL v2+
	 *
	 * @author Stanislav Malyshev
	 * @author Jonas Kress
	 * @constructor
	 * @param {wikibase.queryService.ui.editor.hint.Rdf} rdfHint
	 * @param {wikibase.queryService.ui.editor.hint.Sparql} sparqlHint
	 * @param {wikibase.queryService.ui.editor.tooltip.Rdf} rdfTooltip
	 * @param {Object} [options]
	 * @param {boolean} [options.focus=true] Whether to automatically focus
	 * the editor when it is created (fromTextArea).
	 */
	function SELF( rdfHint, sparqlHint, rdfTooltip, options ) {
		this._rdfHint = rdfHint;
		this._sparqlHint = sparqlHint;
		this._rdfTooltip = rdfTooltip;
		this._focus = ( options || {} ).focus;

		if ( !this._sparqlHint ) {
			this._sparqlHint = new wikibase.queryService.ui.editor.hint.Sparql();
		}
		if ( !this._rdfHint ) {
			this._rdfHint = new wikibase.queryService.ui.editor.hint.Rdf();
		}
		if ( !this._rdfTooltip ) {
			this._rdfTooltip = new wikibase.queryService.ui.editor.tooltip.Rdf();
		}
		if ( this._focus === undefined ) {
			this._focus = true;
		}
	}

	/**
	 * @property {CodeMirror}
	 * @type CodeMirror
	 * @private
	 */
	SELF.prototype._editor = null;

	/**
	 * @property {wikibase.queryService.ui.editor.hint.Sparql}
	 * @private
	 */
	SELF.prototype._sparqlHint = null;

	/**
	 * @property {wikibase.queryService.ui.editor.hint.Rdf}
	 * @private
	 */
	SELF.prototype._rdfHint = null;

	/**
	 * @property {wikibase.queryService.ui.editor.tooltip.Rdf}
	 * @private
	 */
	SELF.prototype._rdfTooltip = null;

	/**
	 * @property {boolean}
	 * @private
	 */
	SELF.prototype._focus = null;

	/**
	 * Construct an this._editor on the given textarea DOM element
	 *
	 * @param {HTMLElement} element
	 */
	SELF.prototype.fromTextArea = function( element ) {
		var self = this;

		this._editor = CodeMirror.fromTextArea( element, CODEMIRROR_DEFAULTS );

		this._editor.on( 'change', function( editor, changeObj ) {
			if ( self.getValue() !== '' ) {
				self.storeValue( self.getValue() );
			}
			self.clearError();
			if ( changeObj.text[0] === '?' || changeObj.text[0] === '#' ) {
				editor.showHint( {
					closeCharacters: /[\s]/
				} );
			}
		} );

		if ( this._focus ) {
			this._editor.focus();
		}

		this._rdfTooltip.setEditor( this._editor );

		this._registerHints();
	};

	SELF.prototype._registerHints = function() {
		var self = this;

		CodeMirror
				.registerHelper(
						'hint',
						'sparql',
						function( editor, callback, options ) {
							if ( editor !== self._editor ) {
								return;
							}
							var lineContent = editor.getLine( editor.getCursor().line ),
								editorContent = editor.doc.getValue(),
								cursorPos = editor.getCursor().ch,
								lineNum = editor.getCursor().line;

							self._getHints( editorContent, lineContent, lineNum, cursorPos ).done(
									function( hint ) {
										callback( hint );
									} );
						} );

		CodeMirror.hint.sparql.async = true;
	};

	SELF.prototype._getHints = function( editorContent, lineContent, lineNum, cursorPos ) {
		var self = this;

		return this._rdfHint.getHint(
			editorContent, lineContent, lineNum, cursorPos
		).catch( function() {
			// if rdf hint is rejected try sparql hint
			return self._sparqlHint.getHint( editorContent, lineContent, lineNum, cursorPos );
		} ).then( function( hint ) {
			hint.from = CodeMirror.Pos( hint.from.line, hint.from.char );
			hint.to = CodeMirror.Pos( hint.to.line, hint.to.char );
			return hint;
		} );
	};

	/**
	 * Construct an this._editor on the given textarea DOM element
	 *
	 * @param {string} keyMap
	 * @throws {Function} callback
	 */
	SELF.prototype.addKeyMap = function( keyMap, callback ) {
		this._editor.addKeyMap( {
			keyMap: callback
		} );
	};

	/**
	 * @param {string} value
	 */
	SELF.prototype.setValue = function( value ) {
		this._editor.setValue( value );
	};

	/**
	 * @return {string}
	 */
	SELF.prototype.getValue = function() {
		return this._editor.getValue();
	};

	SELF.prototype.save = function() {
		this._editor.save();
	};

	/**
	 * @param {string} value
	 */
	SELF.prototype.prepandValue = function( value ) {
		this._editor.setValue( value + this._editor.getValue() );
	};

	SELF.prototype.refresh = function() {
		this._editor.refresh();
	};

	/**
	 * Highlight SPARQL error in editor window.
	 *
	 * @param {string} description
	 */
	SELF.prototype.highlightError = function( description ) {
		var line,
			character,
			match = null;

		match = description.match( /line ([0-9]*)\:/i );
		if ( match ) {
			line = match[1];
		}

		match = description.match( /line (\d+), column (\d+)/ );
		if ( match ) {
			// highlight character at error position
			line = match[1] - 1;
			character = match[2] - 1;
			if ( character >= this._editor.doc.getLine( line ).length - 1 ) {
				character = this._editor.doc.getLine( line ).length - 1;
			}

			ERROR_CHARACTER_MARKER = this._editor.doc.markText( {
				'line': line,
				'ch': character
			}, {
				'line': line,
				'ch': character + 1
			}, {
				'className': 'error-character'
			} );
		}

		if ( line ) {
			ERROR_LINE_MARKER = this._editor.doc.markText( {
				'line': line,
				'ch': 0
			}, {
				'line': line
			}, {
				'className': 'error-line'
			} );
		}
	};

	/**
	 * Clear SPARQL error in editor window.
	 */
	SELF.prototype.clearError = function() {
		if ( ERROR_LINE_MARKER ) {
			ERROR_LINE_MARKER.clear();
		}
		if ( ERROR_CHARACTER_MARKER ) {
			ERROR_CHARACTER_MARKER.clear();
		}
	};

	/**
	 * Stores the given value in the local storage
	 *
	 * @param {string} value
	 */
	SELF.prototype.storeValue = function( value ) {
		try {
			if ( localStorage ) {
				localStorage.setItem( LOCAL_STORAGE_KEY, value );
			}
		} catch ( e ) {
		}
	};

	/**
	 * Return the value from the local storage, if any
	 */
	SELF.prototype.getStoredValue = function() {
		var value = null;
		try {
			if ( localStorage ) {
				value = localStorage.getItem( LOCAL_STORAGE_KEY );
			}
		} catch ( e ) {
		}
		return value;
	};

	/**
	 * Restores the value from the local storage
	 */
	SELF.prototype.restoreValue = function() {
		try {
			var value = this.getStoredValue();
			if ( value ) {
				this.setValue( value );
				this.refresh();
			}
		} catch ( e ) {
		}
	};

	/**
	 * Register callback handler
	 *
	 * @param {string} type
	 * @param {Function} callback
	 */
	SELF.prototype.registerCallback = function( type, callback ) {
		this._editor.on( type, callback );
	};

	/**
	 * Toggle editor fullscreen
	 */
	SELF.prototype.toggleFullscreen = function( fullscreen ) {
		this._editor.setOption( 'fullScreen', !this._editor.getOption( 'fullScreen' ) );
	};

	/**
	 * Set focus on the editor
	 */
	SELF.prototype.focus = function() {
		this._editor.focus();
	};

	SELF.prototype.updatePlaceholder = function( lang ) {
		var placeholder = this._editor.getTextArea().placeholder;
		this._editor.options.placeholder = placeholder;
		$( this._editor.display.wrapper ).find( '.CodeMirror-placeholder' ).text( placeholder );
	};

	return SELF;

}( jQuery, wikibase, CodeMirror ) );
