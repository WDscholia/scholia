/* jshint strict: false */
/* globals require, describe, it, browser, $ */
var assert = require( 'assert' );

describe( 'embed.html', function() {
	it( 'loads results for query', function() {
		var query =
			'SELECT ?item ?itemLabel ?other WHERE { '
			+ ' VALUES (?item ?itemLabel ?other) { '
			+ '     (wd:Q42 "Douglas Adams"@en "1952-03-11T00:00:00Z"^^xsd:dateTime) '
			+ '     (wd:Q80 "Tim Berners-Lee"@de <http://commons.wikimedia.org/wiki/Special:FilePath/Sir%20Tim%20Berners-Lee%20%28cropped%29.jpg>)'
			+ ' } }';

		return browser.url( browser.options.baseUrl + '/embed.html#' + encodeURI( query ) )
			.then( function() {
				return $( '#query-result' );
			} ).then( function( element ) {
				return element.isExisting();
			} ).then( function( isExisting ) {
				assert( isExisting );
			} );
	} );
} );
