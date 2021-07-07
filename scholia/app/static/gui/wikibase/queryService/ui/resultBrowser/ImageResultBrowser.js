var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.resultBrowser = wikibase.queryService.ui.resultBrowser || {};

wikibase.queryService.ui.resultBrowser.ImageResultBrowser = ( function( $, _ ) {
	'use strict';

	/**
	 * A result browser for images
	 *
	 * @class wikibase.queryService.ui.resultBrowser.ImageResultBrowser
	 * @license GNU GPL v2+
	 *
	 * @author Jonas Kress
	 * @constructor
	 */
	function SELF() {
		this._queue = [];
	}

	SELF.prototype = new wikibase.queryService.ui.resultBrowser.AbstractResultBrowser();

	/**
	 * @property {jQuery}
	 * @private
	 */
	SELF.prototype._grid = null;

	/**
	 * @property {jQuery}
	 * @private
	 */
	SELF.prototype._loading = $( '#loading-spinner' );

	/**
	 * the maximum height of items on the grid
	 * @private
	 */
	SELF.prototype._heightThreshold = 400;

	/**
	 * used to determine the minimum width of items on the grid
	 * @private
	 */
	SELF.prototype._widthThreshold = 70;

	/**
	 * the portion of the width of each item which is fixed (border, margin, etc.)
	 * @private
	 */
	SELF.prototype._fixedItemWidth = 0;

	/**
	 * the total width of the grid
	 * @private
	 */
	SELF.prototype._totalWidth = 0;

	/**
	 * the height of each line of summary on an item
	 * @private
	 */
	SELF.prototype._lineHeight = 0;

	/**
	 * array of objects with items with images which have not yet been loaded,
	 * along with their src values
	 * @private
	 */
	SELF.prototype._queue = null;

	/**
	 * Draw browser to the given element
	 *
	 * @param {jQuery} $element to draw at
	 */
	SELF.prototype.draw = function( $element ) {
		var self = this;
		//Queue which must be cleared
		this._queue.splice( 0, this._queue.length );
		this._grid = ( $( '<div class="img-grid">' ).html( '<div class="item-row hidden-row">' ) );

		$element.html( this._grid );
		this._lineHeight = 1.5 * parseFloat( this._grid.css( 'font-size' ) );
		this._iterateResult( function( field, key, row ) {
			if ( field && self._isCommonsResource( field.value ) ) {
				row.url = field.value;
				self._queue.push( row );
			}
		} );
		this._fixedItemWidth = this._calculateBaseWidth();
		this._gridWidth = this._grid.width();
		this._lazyLoad();
	};

	/**
	 * calculate the width of an elment without content
	 */
	SELF.prototype._calculateBaseWidth = function() {
		var baseWidth = 0,
			components = [ 'margin-left', 'margin-right', 'padding-left', 'padding-right' ],
			$element = $( '<div class="item hidden">' );

		this._grid.append( $element );
		components.forEach( function( component ) {
			baseWidth += parseFloat( $element.css( component ) );
		} );
		$element.remove();

		return baseWidth;
	};

	/**
	 * initiate lazy loading
	 */
	SELF.prototype._lazyLoad = function() {
		var self = this;

		$( window ).off( 'scroll.resultBrowser' );
		$( window ).off( 'resize.resultBrowser' );
		if ( this._queue.length ) {
			if ( this._getPosFromTop() < 3 * window.innerHeight ) {
				this._loading.show();
				this._loadNextChunk().done( function() { self._lazyLoad.call( self ); } );
			} else {
				$( window ).on( 'scroll.resultBrowser', $.proxy( _.debounce( self._lazyLoad, 100 ), self ) );
				this._loading.hide();
			}
		} else {
			this._showFinalRow();
			this._loading.hide();
		}
		$( window ).on( 'resize.resultBrowser', ( $.proxy( _.debounce( this._layoutPage, 100 ), self ) ) );
	};

	/**
	 * show the last row even if it's not full
	 */
	SELF.prototype._showFinalRow = function( hidden ) {
		var $row = $( '.item-row' ).last(),
			$items = $row.find( '.item' ),
			calculatedDimensions = { height: 0, widths: [] };

		if ( $row.children().length ) {
			calculatedDimensions.height = this._heightThreshold;
			calculatedDimensions.widths = $items.map( function() {
				return $( this ).data( 'aspectRatio' ) * ( calculatedDimensions.height - $( this ).data( 'fixedHeight' ) );
			} ).toArray();
			this._setDimensions( $row, calculatedDimensions, hidden );
		} else {
			$row.remove();
		}
	};

	/**
	 * load the next block of 8 images to allow for parallel loading
	 */
	SELF.prototype._loadNextChunk = function() {
		var self = this,
			preloadNum = 8,
			items = this._queue.splice( 0, preloadNum ),
			itemsLoaded = [ $.when() ];

			items.forEach( function( item, i ) {
				var previousItem = itemsLoaded[i],
					currentItem = $.when( self._preloadItem( item ), previousItem );

				itemsLoaded.push( currentItem );
				currentItem.done( function( item ) { self._appendItem( item ); } );
			} );

		return itemsLoaded[ items.length ];
	};

	/**
	 * return the distance from the final row of loaded imaged to the bottom of the window
	 */
	SELF.prototype._getPosFromTop = function() {
		var lastRow = $( '.item-row' ).last();
		return lastRow.offset().top - $( window ).scrollTop();
	};

	/**
	 * calculate the dimensions of items wthin a row
	 */
	SELF.prototype._calculateDimensions = function( $row ) {
		var $items = $row.find( '.item' ),
			fixedWidth = this._fixedItemWidth * $items.length,
			totalWidth = this._gridWidth - fixedWidth,
			aspectRatioSum = 0,
			productSum = 0,
			calculatedDimensions = { height: 0, widths: [] };

		$items.each( function() {
			var aspectRatio = $( this ).data( 'aspectRatio' ),
				fixedHeight = $( this ).data( 'fixedHeight' );

			aspectRatioSum += aspectRatio;
			productSum += aspectRatio * fixedHeight;
		} );

		calculatedDimensions.height = ( totalWidth + productSum ) / aspectRatioSum;
		calculatedDimensions.widths = $items.map( function() {
			var width = $( this ).data( 'aspectRatio' ) * ( calculatedDimensions.height - $( this ).data( 'fixedHeight' ) );
			return Math.trunc( width * 100 ) / 100;
		} ).toArray();
		return calculatedDimensions;
	};

	/**
	 * lay out the page again
	 */
	SELF.prototype._layoutPage = function() {
		var self = this,
			$items = $( '.item' );

		this._gridWidth = this._grid.width();
		$( '.item' ).unwrap();
		this._grid.append( $( '<div class="item-row hidden-row">' ) );
		$items.each( $.proxy( function( int, elem ) { this._appendItem( elem, true ); }, self ) );
		if ( this._queue.length ) {
			$( '.hidden-row' ).not( '.hidden-row:last' ).removeClass( 'hidden-row' );
		} else {
			this._showFinalRow( true );
			$( '.hidden-row' ).removeClass( 'hidden-row' );
		}
	};

	/**
	 * append an item to the final row and calls a function to recalculate the dimensions of that row
	 */
	SELF.prototype._appendItem = function( $item, hidden ) {
		var $currentRow = $( '.item-row' ).last();
		$currentRow.append( $item );
		this._layOutRow( $currentRow, hidden );
	};

	/**
	 * return a promise which resolves with the item when the image is loaded
	 */
	SELF.prototype._preloadItem = function( itemData ) {
		var self = this,
			itemLoaded = $.Deferred(),
			url = this._getThumbnail( itemData.url, 1024 ),
			fileName = this._getFormatter().getCommonsResourceFileName( url ),
			item = this._getItem( this._getThumbnail( url ), this._getThumbnail( url, 1024 ), fileName, itemData ),
			fixedHeight = this._lineHeight * item.find( '.summary' )[ 0 ].childElementCount,
			img = item.find( '.item-img' );

			img[ 0 ].onerror = function() { img.attr( 'src', 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg' ); };
			img[ 0 ].onload = function() {
				var aspectRatio = ( this.naturalWidth / this.naturalHeight );
				itemLoaded.resolveWith( self, item.data( 'aspectRatio', aspectRatio ) );
			};
			item.data( 'fixedHeight', fixedHeight );
			img.attr( 'src', url );

		return itemLoaded.promise();
	};

	/**
	 * lay out the passed row
	 */
	SELF.prototype._layOutRow = function( $currentRow, hidden ) {
		var calculatedDimensions = this._calculateDimensions( $currentRow );

		if ( calculatedDimensions.height < this._heightThreshold || Math.min( calculatedDimensions.widths ) < this._widthThreshold ) {
			this._setDimensions( $currentRow, calculatedDimensions, hidden );
			this._grid.append( $( '<div class="item-row hidden-row">' ) );
		}
	};

	/**
	 * set the dimensions of items within a row
	 */
	SELF.prototype._setDimensions = function( $currentRow, calculatedDimensions, hidden ) {
		var $items = $currentRow.find( '.item' );

		$items.width( function( index ) { return calculatedDimensions.widths[ index ]; } );
		if ( !hidden ) {
			$currentRow.removeClass( 'hidden-row' );
		}
	};

	/**
	 * @private
	 */
	SELF.prototype._getItem = function( thumbnailUrl, url, title, row ) {
		var $image = $( '<a>' )
				.click( this._getFormatter().handleCommonResourceItem )
				.attr( { href: url, 'data-gallery': 'g', 'data-title': title } )
				.append( $( '<img class="item-img" >' ) ),
			$summary = this._getFormatter().formatRow( row ).addClass( 'summary' );

		return $( '<div class="item">' ).append( $image, $summary );
	};

	/**
	 * @private
	 */
	SELF.prototype._isCommonsResource = function( url ) {
		return this._getFormatter().isCommonsResource( url );
	};

	/**
	 * @private
	 */
	SELF.prototype._getThumbnail = function( url, width ) {
		return this._getFormatter().getCommonsResourceThumbnailUrl( url, width );
	};

	/**
	 * Receiving data from the a visit
	 *
	 * @param {Object} data
	 * @return {boolean} false if there is no revisit needed
	 */
	SELF.prototype.visit = function( data ) {
		return this._checkImage( data );
	};

	/**
	 * Check if this value contains an image.
	 */
	SELF.prototype._checkImage = function( data ) {
		if ( data && data.value && this._isCommonsResource( data.value ) ) {
			this._drawable = true;
			return false;
		}

		return true;
	};

	return SELF;
}( jQuery, _ ) );
