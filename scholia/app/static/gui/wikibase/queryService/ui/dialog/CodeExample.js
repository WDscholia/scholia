var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.dialog = wikibase.queryService.ui.dialog || {};

wikibase.queryService.ui.dialog.CodeExample = ( function( $, CodeMirror ) {
	'use strict';

	var CODEMIRROR_DEFAULTS = { readOnly: true, autofocus: true, autoRefresh: true, lineNumbers: true, lineWrapping: true };

	/**
	 * A ui dialog for code examples with current query
	 *
	 * @class wikibase.queryService.ui.dialog.CodeExample
	 * @license GNU GPL v2+
	 *
	 * @author Jonas Kress
	 * @constructor
	 *
	 * @param {jQuery} $element
	 * @param {Function} getCodeExamples
	 */
	function SELF( $element, getCodeExamples ) {

		this._$element = $element;
		this._getCodeExamples = getCodeExamples;

		this._init();
	}

	/**
	 * @property {jQuery}
	 * @private
	 */
	SELF.prototype._$element = null;

	/**
	 * @property {Function}
	 * @private
	 */
	SELF.prototype._getCodeExamples = null;

	/**
	 * @private
	 */
	SELF.prototype._init = function() {
		var self = this;

		this._$element.on( 'show.bs.modal', function () {
			self._getCodeExamples().then( function ( d ) {
				self._update( d );
			} );
		} );
	};

	/**
	 * @private
	 */
	SELF.prototype._update = function( examples ) {
		var $tabs = this._$element.find( '.nav-tabs' ).empty(),
			$panes = this._$element.find( '.tab-content' ).empty(),
			$tab = $( '<li role="presentation"></li>' ),
			$pane = $( '<div role="tabpanel" class="tab-pane">' ),
			$button = $( '<a role="tab" data-toggle="tab">' );

		$.each( examples, function( lang, data ) {
			var code = data.code,
				mode = data.mimetype;
			var $text = $( '<textarea>' ).text( code );
			$tabs.append(
				$tab.clone()
					.addClass( $tabs.is( ':empty' ) ? 'active' : '' )
					.append(
						$button.clone()
							.attr( 'href', '#' + $.escapeSelector( lang ) )
							.text( lang )
					)
			);
			$panes.append(
				$pane.clone()
					.addClass( $panes.is( ':empty' ) ? 'active' : '' )
					.attr( 'id', lang )
					.append( $text )
			);
			CODEMIRROR_DEFAULTS.mode = mode;
			CodeMirror.fromTextArea( $text[0], CODEMIRROR_DEFAULTS );
		} );
	};

  return SELF;
}( jQuery, CodeMirror ) );
