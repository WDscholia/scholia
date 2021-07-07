var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.resultBrowser = wikibase.queryService.ui.resultBrowser || {};

wikibase.queryService.ui.resultBrowser.TableResultBrowser = ( function( $, window ) {
	'use strict';

	/**
	 * A result browser for tables
	 *
	 * @class wikibase.queryService.ui.resultBrowser.TableResultBrowser
	 * @license GNU GPL v2+
	 *
	 * @author Jonas Kress
	 * @author Jonas Keinholz
	 *
	 * @constructor
	 */
	function SELF() {
	}

	var TABLE_PAGE_SIZE = 200;
	var TABLE_PAGE_SIZE_LIST = [ 10, 50, 100, 200, 500, 1000 ];

	SELF.prototype = new wikibase.queryService.ui.resultBrowser.AbstractResultBrowser();

	/**
	 * @property {Object}
	 * @private
	 */
	SELF.prototype._columns = null;

	/**
	 * @property {Object}
	 * @private
	 */
	SELF.prototype._rows = null;

	/**
	 * @property {Object}
	 * @private
	 */
	SELF.prototype._$selectedCell = {};

	/**
	 * @property {boolean}
	 * @private
	 */
	SELF.prototype._selectedCellHighlighted = false;

	/**
	 * @property {number}
	 * @private
	 */
	SELF.prototype._tableNumber = false;

	/**
 	 * @property {boolean}
 	 * @private
 	 */
	SELF.prototype._pageLoading = true;

	/**
	 * @property {Object}
	 * @private
	 */
	SELF.prototype._sorter = {
		string: function( val1, val2 ) {
			return val1.localeCompare( val2 );
		},

		number: function( val1, val2 ) {
			if ( val1 >= val2 ) {
				return -1;
			}

			return 1;
		},

		generic: function( data1, data2 ) {
			if ( !data2 ) {
				return 1;
			}
			if ( !data1 ) {
				return -1;
			}

			var f = this._getFormatter();
			if ( f.isNumber( data1 ) && f.isNumber( data2 ) ) {
				return this._sorter.number( Number( data1.value ), Number( data2.value ) );
			}

			if ( f.isEntityUri( data1.value ) && f.isEntityUri( data2.value ) ) {
				return this._sorter.number( Number( data1.value.replace( /[^0-9]/gi, '' ) ),
						Number( data2.value.replace( /[^0-9]/gi, '' ) ) );
			}

			// default is string sorter
			return this._sorter.string( data1.value, data2.value );
		}
	};

	/**
	 * Draw browser to the given element
	 *
	 * @param {jQuery} $element to draw at
	 */
	SELF.prototype.draw = function( $element ) {
		var data = this._result;

		if ( typeof data.boolean !== 'undefined' ) {
			// ASK query
			var $table = $( '<table>' ).attr( 'class', 'table' );
			$table.append( '<tr><td>' + data.boolean + '</td></tr>' ).addClass( 'boolean' );
			$element.html( $table );
			return;
		}

		this.columns = data.head.vars;
		this.rows = data.results.bindings;

		var $wrapper = $( '<table/>' );
		$element.html( $wrapper );
		this.drawBootstrapTable( $wrapper );

		if ( $wrapper.children().width() > $( window ).width() ) {
			$wrapper.bootstrapTable( 'toggleView' );
		}
	};

	/**
	 * Draw browser to the given element
	 *
	 * @param {jQuery} $element to draw at
	 */
	SELF.prototype.drawBootstrapTable = function( $element ) {
		var self = this,
			showPagination = ( this.rows.length > TABLE_PAGE_SIZE );

		jQuery.fn.bootstrapTable.columnDefaults.formatter = function( data, row, index ) {
			if ( !data ) {
				return '';
			}
			self.processVisitors( data, this.field );
			return self._getFormatter().formatValue( data ).html();
		};

		var events = {
			'click .explore': $.proxy( this._getFormatter().handleExploreItem, this ),
			'click .gallery': this._getFormatter().handleCommonResourceItem
		};

		$element.bootstrapTable( {
			columns: this.columns.map( function( column ) {
				return {
					title: column,
					field: column,
					events: events,
					sortable: true,
					sorter: $.proxy( self._sorter.generic, self )
				};
			} ),
			data: this.rows,
			mobileResponsive: true,
			search: showPagination,
			pagination: showPagination,
			showPaginationSwitch: showPagination,
			pageSize: TABLE_PAGE_SIZE,
			pageList: TABLE_PAGE_SIZE_LIST,
			keyEvents: false,
			cookie: true,
			cookieIdTable: '1',
			cookieExpire: '1y',
			cookiesEnabled: [ 'bs.table.pageList' ],
			onResetView: function( name, args ) {
				if ( typeof window._currentTableNumber === 'undefined' ) {
					window._currentTableNumber = 0;
				}
				window._currentTableNumber++;
				self._tableNumber = window._currentTableNumber;
				self._selectedCellHighlighted = false;
				self._pageLoading = false;
				self.selectFirstCell( $element );
				$( 'button:focus' ).blur();
			},
			onClickCell: function( field, value, row, $cell ) {
				self._selectedCellHighlighted = true;
				self.selectCell( $cell );
			}

		} );
		$( document ).keydown( function( e ) {
			self.keyPressed( e );
		} );
		$( '#result-browser-menu a' ).on( 'click', function() {
			if ( typeof window._currentTableNumber === 'undefined' ) {
				window._currentTableNumber = 0;
			}
			window._currentTableNumber++;
		} );
	};

	/**
	 * Select the first cell of the table
	 *
	 * @private
	 * @param {jQuery} $table in which to select the first cell
	 */
	SELF.prototype.selectFirstCell = function( $table ) {
		var $cell = $table.find( 'td' ).first();
		this.selectCell( $cell );
	};

	/**
	 * Select and highlight a cell
	 *
	 * @private
	 * @param {jQuery} $cell to be highlighted
	 */
	SELF.prototype.selectCell = function( $cell ) {
		if ( this._selectedCellHighlighted !== true ) {
			this._$selectedCell = $cell;
			return;
		}
		if ( $cell.length ) { //if cell actually exists
			$( '.table-cell-selected' ).removeClass( 'table-cell-selected' );
			this._$selectedCell = $cell;
			if ( !this._$selectedCell.parent().hasClass( 'no-records-found' ) ) { //make sure that the cell chosen isn't a 'No Matching Records Found' cell
				this._$selectedCell.addClass( 'table-cell-selected' );
			}
		}
	};

	/**
	 * Scroll to a selected cell
	 *
	 * @private
	 * @param {jQuery} $cell to scroll to
	 */
	SELF.prototype.scrollToCell = function( $cell ) {
		var offset = $cell.offset().top;
		$( 'html, body' ).scrollTop( offset - window.innerHeight / 3 );
	};

	/**
	 * Called when a key is pressed
	 *
	 * @private
	 * @param {KeyboardEvent} e event element
	 */
	SELF.prototype.keyPressed = function( e ) {
		if ( window._currentTableNumber !== this._tableNumber ) {
			return;
		}
		if ( $( document.activeElement ).is( 'textarea, input, button' ) ) {
			return;
		}
		if ( this._$selectedCell.length === 0 ) {
			return;
		}
		if ( this._selectedCellHighlighted !== true ) { //activate highlighting for the selected cell only when one of the arrow keys is pressed
			if ( e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === 'ArrowDown' ) {
				this._selectedCellHighlighted = true;
				this.selectCell( this._$selectedCell );
				this.scrollToCell( this._$selectedCell );
			}
			e.stopImmediatePropagation();
			return;
		}
		if ( ( e.ctrlKey || e.metaKey ) && ( e.key === 'c' || e.key === 'C' ) ) { //if Ctrl + C is pressed
			if ( window.getSelection().toString() !== '' ) {
				// let normal copy operation happen
				return;
			} else {
				// copy cell content
				this.copyToClipboard( this._$selectedCell );
				e.stopImmediatePropagation();
				return;
			}
		}
		if ( e.ctrlKey || e.metaKey || e.altKey ) {
			return;
		}

		switch ( e.key ) {
			case 'Enter': //When the enter key is pressed, click on the first link with non-empty text. Links with empty text open the item explorer and do not link to another site
				this._$selectedCell.find( 'a' ).each( function() {
					if ( $( this ).text().trim().length ) {
						window.open( $( this ).prop( 'href' ) );
						return false;
					}
					return true;
				} );
				break;
			case 'ArrowLeft':
				var $leftCell = this._$selectedCell.prev();
				if ( $leftCell.length === 0 ) { //if leftmost cell, go to the previous page
					if ( this._pageLoading === false ) {
						this._pageLoading = true;
						$( '.page-pre a' ).click();
					}
				} else {
					this.selectCell( this._$selectedCell.prev() );
				}
				break;
			case 'ArrowUp':
				if ( this._$selectedCell.parent().prev().children( 'td:nth-child(' + ( this._$selectedCell.index() + 1 ).toString() + ')' ).length ) {
					this.selectCell( this._$selectedCell.parent().prev().children( 'td:nth-child(' + ( this._$selectedCell.index() + 1 ).toString() + ')' ) );
					this.scrollToCell( this._$selectedCell );
				}
				break;
			case 'ArrowRight':
				var $rightCell = this._$selectedCell.next();
				if ( $rightCell.length === 0 ) {
					if ( this._pageLoading === false ) {
						this._pageLoading = true;
						$( '.page-next a' ).click();
					}
				} else {
					this.selectCell( this._$selectedCell.next() );
				}
				break;
			case 'ArrowDown':
				if ( this._$selectedCell.parent().next().children( 'td:nth-child(' + ( this._$selectedCell.index() + 1 ).toString() + ')' ).length ) {
					this.selectCell( this._$selectedCell.parent().next().children( 'td:nth-child(' + ( this._$selectedCell.index() + 1 ).toString() + ')' ) );
					this.scrollToCell( this._$selectedCell );
				}
				break;
		}
		e.stopImmediatePropagation();
	};

	/**
 	 * Copies the text of an element to clipboard
	 *
 	 * @private
 	 * @param {jQuery} $element whose text to copy
 	 */
	SELF.prototype.copyToClipboard = function( $element ) {
		var $temp = $( '<input>' );
		$( 'body' ).append( $temp );
		$temp.val( $element.text().trim() ).select();
		document.execCommand( 'copy' );
		$temp.remove();
	};

	/**
	 * Checks whether the browser can draw the given result
	 *
	 * @return {boolean}
	 */
	SELF.prototype.isDrawable = function() {
		return true;
	};

	/**
	 * Receiving data from the a visit
	 *
	 * @param {Object} data
	 * @return {boolean} false if there is no revisit needed
	 */
	SELF.prototype.visit = function( data ) {
		return false;
	};

	return SELF;
}( jQuery, window ) );
