( function( $, QUnit, sinon, wb ) {
	'use strict';

	QUnit.module( 'wikibase.queryService.ui.resultBrowser' );
	var irb = new wb.queryService.ui.resultBrowser.ImageResultBrowser(),
		sampleItem = '<a href=\"https://commons.wikimedia.org/wiki/Special:FilePath/%D0%9D%D0%B0%D1%82%D0%B0%D0%BB%D0%B8%D1%8F%20%D0%A3%D1%88%D0%B0%D0%BA%D0%BE%D0%B2%D0%B0.%201927.jpg?width=1024" data-gallery=\"g\" data-title=\"https://commons.wikimedia.org/wiki/Special:FilePath/Наталия Ушакова. 1927.jpg?width=1024\"><img class=\"item-img\" src=\"https://commons.wikimedia.org/wiki/Special:FilePath/%D0%9D%D0%B0%D1%82%D0%B0%D0%BB%D0%B8%D1%8F%20%D0%A3%D1%88%D0%B0%D0%BA%D0%BE%D0%B2%D0%B0.%201927.jpg?width=1024\"></a><div class=\"summary\"><div><span title=\"url\"></span></div><div><span><a title=\"Show Gallery\" href=\"https://commons.wikimedia.org/wiki/Special:FilePath/%D0%9D%D0%B0%D1%82%D0%B0%D0%BB%D0%B8%D1%8F%20%D0%A3%D1%88%D0%B0%D0%BA%D0%BE%D0%B2%D0%B0.%201927.jpg?width=900\" aria-hidden=\"true\" class=\"gallery glyphicon glyphicon-picture\" data-gallery=\"G_pic\" data-title=\"Наталия Ушакова. 1927.jpg\"></a> <a title=\"pic: commons:Наталия Ушакова. 1927.jpg\" href=\"https://commons.wikimedia.org/wiki/File:Наталия Ушакова. 1927.jpg\" target=\"_blank\" class=\"item-link\" rel=\"noopener\">commons:Наталия Ушакова. 1927.jpg</a></span></div><div><span><a href=\"http://www.wikidata.org/entity/Q28665865\" title=\"Explore item\" class=\"explore glyphicon glyphicon-search\" tabindex=\"-1\" aria-hidden=\"true\"></a> <a title=\"item\" href=\"http://www.wikidata.org/entity/Q28665865\" target=\"_blank\" class=\"item-link\" rel=\"noopener\">Мyka</a></span></div></div>',
		sampleItemData = {
			item: { type: 'uri', value: 'http://www.wikidata.org/entity/Q28665865' },
			itemLabel: {
				'xml:lang': 'en',
				type: 'literal',
				value: 'Мyka'
			},
			pic: {
				type: 'uri',
				value: 'http://commons.wikimedia.org/wiki/Special:FilePath/%D0%9D%D0%B0%D1%82%D0%B0%D0%BB%D0%B8%D1%8F%20%D0%A3%D1%88%D0%B0%D0%BA%D0%BE%D0%B2%D0%B0.%201927.jpg'
			},
			url: 'http://commons.wikimedia.org/wiki/Special:FilePath/%D0%9D%D0%B0%D1%82%D0%B0%D0%BB%D0%B8%D1%8F%20%D0%A3%D1%88%D0%B0%D0%BA%D0%BE%D0%B2%D0%B0.%201927.jpg'
		},
		aspectRatio = 0.7558823529411764;

	QUnit.test( 'When preloading an item the item should be returned', function( assert ) {
		assert.expect( 2 );
		var check = function( item ) {
			assert.equal( item.innerHTML , sampleItem );
			assert.equal( $( item ).data( 'aspectRatio' ), aspectRatio );
		};
		return irb._preloadItem( sampleItemData ).done( function( x ) {
			check( x );
		} );
	} );
}( jQuery, QUnit, sinon, wikibase ) );
