var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.queryHelper = wikibase.queryService.ui.queryHelper || {};

wikibase.queryService.ui.queryHelper.QueryTemplate = ( function( $, wikibase ) {
	'use strict';

	/**
	 * A template for a SPARQL query
	 *
	 * @class wikibase.queryService.ui.queryHelper.QueryTemplate
	 * @license GNU GPL v2+
	 *
	 * @author Lucas Werkmeister
	 * @constructor
	 */
	function SELF() {
	}

	/**
	 * @property {Object} The parsed template definition.
	 * @private
	 */
	SELF.prototype._definition = {};

	/**
	 * @property {jQuery} A span with the rendered template.
	 * @private
	 */
	SELF.prototype._template = null;

	/**
	 * @property {Object.<string, Array.<jQuery>>} A map from variable names to lists of spans corresponding to that variable.
	 * @private
	 */
	SELF.prototype._variables = [];

	/**
	 * @param {SparqlQuery} query
	 * @return {?QueryTemplate}
	 */
	SELF.parse = function( query ) {
		var templateComment = query.getCommentContent( 'TEMPLATE=' ),
			templateJson,
			template;

		if ( !templateComment ) {
			return null;
		}
		try {
			templateJson = JSON.parse( templateComment );
		} catch ( e ) {
			return null;
		}

		template = new SELF;
		template._definition = templateJson;
		template._fragments = SELF._getQueryTemplateFragments( templateJson );

		return template;
	};

	/**
	 * Extracts the effective text for the given language from the template definition.
	 *
	 * @param {{template: (string|Object)}} definition
	 * @param {string} languageCode
	 * @param {?Object.<string, string[]>} fallbacksPerLanguage map from language code to fallback langugae codes
	 * @param {?string} finalFallback final fallback language code for all languages
	 * @return {string}
	 */
	SELF._getQueryTemplateText = function( definition, languageCode, fallbacksPerLanguage, finalFallback ) {
		var texts, fallbacks, index, fallback;

		if ( [ 'string', 'object' ].indexOf( typeof definition.template ) === -1 ) {
			throw new Error( 'unsupported template type, should be single string or map from language code to string' );
		}

		if ( typeof definition.template === 'string' ) {
			return definition.template;
		}

		texts = definition.template;

		if ( languageCode in texts ) {
			return texts[languageCode];
		}

		fallbacks = fallbacksPerLanguage && fallbacksPerLanguage[languageCode] || {};
		for ( index in fallbacks ) {
			fallback = fallbacks[index];
			if ( fallback in texts ) {
				return texts[fallback];
			}
		}

		fallback = finalFallback || 'en';
		if ( fallback in texts ) {
			return texts[fallback];
		}

		for ( index in texts ) {
			return texts[index];
		}

		return '';
	};

	/**
	 * Splits the template 'a ?b c ?d e' into
	 * [ 'a ', '?b', ' c ', '?d', ' e' ].
	 * Text and variable fragments always alternate,
	 * and the first and last fragment are always text fragments
	 * ('' if the template begins or ends in a variable).
	 *
	 * @param {{template: (string|Object), variables: string[]}} definition
	 * @return {string[]}
	 */
	SELF._getQueryTemplateFragments = function( definition ) {
		// TODO inject language and update it in the
		// languageSelector.setChangeListener() callback from init.js
		var languageCode = $.i18n && $.i18n().locale || 'en',
			fallbacksPerLanguage = $.i18n && $.i18n.fallbacks,
			finalFallback = $.i18n && $.i18n().options.fallbackLocale,
			text = this._getQueryTemplateText( definition, languageCode, fallbacksPerLanguage, finalFallback ),
			fragments = [ text ],
			variable,
			newFragments;

		if ( text.match( /\0/ ) ) {
			throw new Error( 'query template must not contain null bytes' );
		}

		function splitFragment( fragment ) {
			var textFragments = fragment
				.replace( new RegExp( '\\' + variable, 'g' ), '\0' )
				.split( '\0' );
			newFragments.push( textFragments[0] );
			for ( var i = 1; i < textFragments.length; i++ ) {
				newFragments.push( variable );
				newFragments.push( textFragments[ i ] );
			}
		}

		for ( variable in definition.variables ) {
			if ( !variable.match( /\?[a-z][a-z0-9]*/i ) ) {
				// TODO this is more restrictive than SPARQL;
				// see https://www.w3.org/TR/sparql11-query/#rVARNAME
				throw new Error( 'invalid variable name in query template' );
			}
			newFragments = [];
			fragments.forEach( splitFragment );
			fragments = newFragments;
		}

		return fragments;
	};

	/**
	 * Assemble the template span out of the fragments.
	 *
	 * @param {string[]} fragments The template fragments (see {@link _getQueryTemplateFragments}).
	 * @param {Object.<string, jQuery>} variables The individual variables are stored in this object, indexed by variable name.
	 * @return {jQuery}
	 */
	SELF._buildTemplate = function( fragments, variables ) {
		var template = $( '<span>' );

		template.append( document.createTextNode( fragments[ 0 ] ) );
		for ( var i = 1; i < fragments.length; i += 2 ) {
			var variable = fragments[ i ],
				$variable = $( '<span>' ).text( variable );
			if ( !( variable in variables ) ) {
				variables[variable] = [];
			}
			variables[variable].push( $variable );
			template.append( $variable );
			template.append( document.createTextNode( fragments[ i + 1 ] ) );
		}

		return template;
	};

	/**
	 * @param {Function} getLabel Called with {string} variable name, should return {Promise} for label, id, description, type.
	 * @param {wikibase.queryService.ui.queryHelper.SelectorBox} selectorBox
	 * @param {Function} changeListener Called with {string} variable name, {string} old value, {string} new value.
	 * @return {jQuery}
	 */
	SELF.prototype.getHtml = function( getLabel, selectorBox, changeListener ) {
		if ( this._template !== null ) {
			return this._template;
		}

		this._template = SELF._buildTemplate( this._fragments, this._variables );

		var self = this;

		$.each( this._definition.variables, function( variable, variableDefinition ) {
			getLabel( variable ).done( function( label, id, description, type ) {
				$.each( self._variables[ variable ], function( index, $variable ) {
					$variable.text( '' );
					var $link = $( '<a>' ).text( label ).attr( {
						'data-id': id,
						'data-type': type,
						href: '#'
					} ).appendTo( $variable );

					if ( variableDefinition.query ) {
						$link.attr( 'data-sparql', variableDefinition.query );
					}

					selectorBox.add( $link, null, function( selectedId, name ) {
						for ( var j in self._variables[ variable ] ) {
							var $variable = self._variables[ variable ][ j ];
							$variable.find( 'a[data-id="' + id + '"]' )
								.attr( 'data-id', selectedId )
								.text( name );
							changeListener( variable, id, selectedId );
							id = selectedId;
						}
					} );
				} );
			} );
		} );

		return this._template;
	};

	return SELF;
}( jQuery, wikibase ) );
