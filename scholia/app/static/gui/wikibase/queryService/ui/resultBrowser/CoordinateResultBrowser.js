var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.resultBrowser = wikibase.queryService.ui.resultBrowser || {};

wikibase.queryService.ui.resultBrowser.CoordinateResultBrowser = ( function( $, L, d3, _, wellknown, window ) {
	'use strict';

	/**
	 * A list of datatypes that contain geo:wktLiteral values conforming with GeoSPARQL.
	 * @private
	 */
	var MAP_DATATYPES = [
		'http://www.opengis.net/ont/geosparql#wktLiteral', // used by Wikidata
		'http://www.openlinksw.com/schemas/virtrdf#Geometry' // used by LinkedGeoData.org
	];
	var GLOBE_EARTH = 'http://www.wikidata.org/entity/Q2';
	var CRS84 = 'http://www.opengis.net/def/crs/OGC/1.3/CRS84';
	/**
	 * A list of coordinate reference systems / spatial reference systems
	 * that refer to Earth and use longitude-latitude axis order.
	 * @private
	 */
	var EARTH_LONGLAT_SYSTEMS = [
		GLOBE_EARTH,
		CRS84
	];

	var PREFIX_COMMONS_DATA = 'http://commons.wikimedia.org/data/main/';
	var SUFFIX_COMMONS_MAP = '.map';

	var DEFAULT_LAYER_VARIABLES = [ '?layerLabel', '?layer' ];
	var LAYER_DEFAULT_GROUP = '_LAYER_DEFAULT_GROUP';

	var TILE_LAYER = {
		wikimedia: {
			url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png',
			options: {
				id: 'wikipedia-map-01',
				attribution: ' <a href="https://maps.wikimedia.org/">Wikimedia</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}
		},
		osm: {
			url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			options: {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}
		}
	};

	var ScrollToTopButton = null;

	/**
	 * A result browser for long lat coordinates
	 *
	 * @class wikibase.queryService.ui.resultBrowser.CoordinateResultBrowser
	 * @licence GNU GPL v2+
	 *
	 * @author Jonas Kress
	 * @author Katie Filbert
	 * @constructor
	 *
	 */
	function SELF() {
		this._markerGroupColors = {};
		var _getDefaultMarkerGroupColor = d3.scale.category10();
		this._getMarkerGroupColor = function( group ) {
			if ( group in this._markerGroupColors ) {
				return this._markerGroupColors[ group ];
			}
			return _getDefaultMarkerGroupColor( group );
		};

		ScrollToTopButton = L.Control.extend( {
			options: {
				position: 'topright'
			},

			onAdd: function( map ) {
				var container = L.DomUtil.create( 'button' );
				$( container ).addClass( 'btn btn-default wdqs-control-scroll-top' );
				$( container ).append( $( ' <span class="glyphicon glyphicon-chevron-up"/> ' ) );

				container.onclick = function() {
					if ( map.isFullscreen() ) {
						map.toggleFullscreen();
					}
					$( window ).scrollTop( 0, 0 );
				};

				return container;
			}
		} );
	}

	SELF.prototype = new wikibase.queryService.ui.resultBrowser.AbstractResultBrowser();

	/**
	 * @property {L.Map}
	 * @private
	 */
	SELF.prototype._map = null;

	/**
	 * @property {Object}
	 * @private
	 */
	SELF.prototype._markerGroups = null;

	/**
	 * Progress in loading the marker groups,
	 * as a number within the interval [0, 1].
	 *
	 * @property {Float}
	 * @private
	 */
	SELF.prototype._markerGroupsProgress = null;

	/**
	 * Sparse map from group to last-seen RGB color (?rgb column) for that group.
	 * _getMarkerGroupColor uses this map to look up colors,
	 * falling back to a static color map if no RGB color was recorded for a group.
	 * @property {Object}
	 * @private
	 */
	SELF.prototype._markerGroupColors = null;

	/**
	 * Maps group name to a certain color
	 * @private
	 */
	SELF.prototype._getMarkerGroupColor = null;

	/**
	 * Draw a map to the given element
	 *
	 * @param {jQuery} $element target element
	 */
	SELF.prototype.draw = function( $element ) {
		var self = this,
			container = $( '<div>' ).attr( 'id', 'map' ).height( '100vh' ),
			interval;

		$element.html( container );

		function clearProgress() {
			clearInterval( interval );
			$( '#map-progress' ).remove();
		}
		function updateProgress() {
			if ( self._markerGroupsProgress > 0 && self._markerGroupsProgress < 1 ) {
				var percent = ( 100 * self._markerGroupsProgress ).toFixed( 2 ),
					message = wikibase.queryService.ui.i18n.getMessage(
						'wdqs-result-map-progress',
						'Loading map data: $1%',
						[ percent ] );
				container.html(
					$( '<div>' )
						.attr( 'id', 'map-progress' )
						.css( {
							position: 'relative',
							top: '20%',
							width: '100%',
							textAlign: 'center'
						} )
						.text( message )
				);
			} else if ( self._markerGroupsProgress >= 1 ) {
				clearProgress();
			}
		}
		interval = setInterval( updateProgress, 200 );

		function drawMap() {
			clearProgress();
			var layers = _.compact( self._markerGroups ); // convert object to array
			var markerClusterOptions = self._getMarkerClusterOptions( layers.length );
			if ( markerClusterOptions ) {
				var cluster = L.markerClusterGroup( markerClusterOptions );
				cluster.addLayers( layers );
				layers = [ cluster ];
			}

			self._map = L.map( 'map', {
				center: [ 0, 0 ],
				maxZoom: 18,
				minZoom: 2,
				fullscreenControl: true,
				preferCanvas: true,
				layers: layers
			} ).fitBounds( self._markerGroups[ LAYER_DEFAULT_GROUP ].getBounds() );

			self._setTileLayer();
			self._createControls();
			self._createMarkerZoomResize();

			$element.html( container );
		}

		this._createMarkerGroups().done( drawMap ).fail( drawMap );
	};

	/**
	 * Create map controls
	 *
	 * @private
	 */
	SELF.prototype._createControls = function() {
		var self = this;

		//zoom control
		this._map.addControl( L.control.zoomBox( {
			modal: false,
			className: 'glyphicon glyphicon-zoom-in'
		} ) );
		this._map.addControl( new ScrollToTopButton() );

		//layers control
		var numberOfLayers = Object.keys( this._markerGroups ).length;
		if ( numberOfLayers > 1 ) {
			var control = this._getLayerControl( this._markerGroups ).addTo( this._map );

			// update layer control
			this._map.on( 'overlayadd overlayremove', function ( event ) {
				if ( event.layer !== self._markerGroups[ LAYER_DEFAULT_GROUP ] ) {
					return;
				}
				$.each( self._markerGroups, function( i, layer ) {
					if ( event.type === 'overlayadd' ) {
						self._map.addLayer( layer );
					} else {
						self._map.removeLayer( layer );
					}
				} );
				control._update();
			} );
		}

		//user location
		L.control.locate().addTo( this._map );

		//mini map
		var options = { zoomLevelOffset: -7, toggleDisplay: true };
		new L.Control.MiniMap( new L.TileLayer( TILE_LAYER.wikimedia.url, TILE_LAYER.wikimedia.url.options ), options ).addTo( this._map );
	};

	/**
	 * @private
	 */
	SELF.prototype._createMarkerZoomResize = function() {
		var self = this;

		if ( this._markerGroups[LAYER_DEFAULT_GROUP].getLayers().length > 1000 ) {
			return; // disable when to many markers (bad performance)
		}

		var resize = function() {
			self._markerGroups[LAYER_DEFAULT_GROUP].setStyle( {
				radius: self._getMarkerRadius()
			} );
		};

		this._map.on( 'zoomend', resize );
	};

	/**
	 * @private
	 */
	SELF.prototype._getMarkerRadius = function() {
		if ( !this._map ) {
			return 3;
		}

		var currentZoom = this._map.getZoom();
		return ( currentZoom * ( 1 / 2 ) );
	};

	/**
	 * @private
	 */
	SELF.prototype._getLayerControl = function() {
		var self = this,
			layerControls = {},
			control = '';

		$.each( this._markerGroups, function( name, markers ) {
			if ( name === LAYER_DEFAULT_GROUP ) {
				control = wikibase.queryService.ui.i18n.getMessage( 'wdqs-result-map-layers-all', 'All layers' );
			} else {
				var color = self._getMarkerGroupColor( name );
				control = '<span style="color:' + color + '">&#x2b24;</span> ' + name;
			}

			layerControls[ control ] = markers;
		} );

		return L.control.layers( null, layerControls );
	};

	/**
	 * @private
	 * @return {$.Promise}
	 */
	SELF.prototype._createMarkerGroups = function() {
		var self = this,
			promises = [],
			donePromises = 0,
			markers = {};
		markers[ LAYER_DEFAULT_GROUP ] = [];

		this._iterateResult( function( field, key, row ) {
			var geoJson = self._extractGeoJson( field );
			if ( geoJson !== null ) {
				promises.push( $.when( geoJson, row ) );
			}
		} );

		$.each( promises, function( index, promise ) {
			promise.done( function( geoJson, row ) {
				donePromises++;
				self._markerGroupsProgress = donePromises / promises.length;
				// TODO can the above perhaps be done via deferred.notify / deferred.progress?

				var layer = self._getMarkerGroupsLayer( row );
				if ( !markers[ layer ] ) {
					markers[ layer ] = [];
				}
				var marker = L.geoJson( geoJson, {
					style: self._getMarkerStyle( layer, row ),
					pointToLayer: function( geoJsonPoint, latLon ) {
						return L.circleMarker( latLon, self._getMarkerStyle( layer, row ) );
					},
					onEachFeature: function( feature, layer ) {
						var popup = L.popup();
						layer.bindPopup( popup );
						layer.on( 'click', function() {
							var info = self._getItemDescription( row );
							popup.setContent( info[0] );
						} );
					}
				} );
				markers[ layer ].push( marker );
				markers[ LAYER_DEFAULT_GROUP ].push( marker );
			} );
		} );

		function createMarkers() {
			if ( Object.keys( markers ).length === 0 ) {
				var marker = L.marker( [ 0, 0 ] ).bindPopup( 'Nothing found!' ).openPopup();
				return { null: L.featureGroup( [marker] ) };
			}

			self._markerGroups = {};
			$.each( markers, function( key ) {
				self._markerGroups[ key ] = L.featureGroup( markers[ key ] );
			} );
		}

		return $.when.apply( $, promises ).done( createMarkers ).fail( createMarkers );
	};

	/**
	 * @private
	 */
	SELF.prototype._getMarkerGroupsLayer = function( row ) {
		var options = this.getOptions(),
			columns = options.getColumnNames( 'layer', DEFAULT_LAYER_VARIABLES ),
			column = columns.find( function( column ) {
				return row[column];
			} );

		return column ? row[column].value : LAYER_DEFAULT_GROUP;
	};

	/**
	 * @private
	 * @param {string} group
	 * @param {Object} row
	 */
	SELF.prototype._getMarkerStyle = function( group, row ) {
		var color,
			formatter = this._getFormatter();

		if ( 'rgb' in row && formatter.isColor( row.rgb ) ) {
			color = formatter.getColorForHtml( row.rgb );
			this._markerGroupColors[ group ] = color;
		} else if ( group !== LAYER_DEFAULT_GROUP ) {
			color = this._getMarkerGroupColor( group );
		} else {
			color = '#e04545';
		}

		return {
			color: color,
			opacity: 0.8,
			fillColor: color,
			fillOpacity: 0.9,
			radius: this._getMarkerRadius()
		};
	};

	/**
	 * Return an icon that imitates the default circle marker.
	 *
	 * @private
	 * @param {L.markerClusterGroup} cluster
	 */
	SELF.prototype._getMarkerIcon = function( cluster ) {
		var options = cluster.getAllChildMarkers()[0].options;
		var diameter = 2 * ( 1 + options.radius );
		var html = '<div style="' +
			'background-color: ' + options.color +
			'; border-radius: 100%' +
			'; width: ' + diameter + 'px' +
			'; height: ' + diameter + 'px' +
			'"></div>';
		return new L.DivIcon( {
			html: html,
			className: '',
			iconSize: new L.Point( diameter, diameter )
		} );
	};

	/**
	 * @private
	 * @param {number} numLayers
	 */
	SELF.prototype._getMarkerClusterOptions = function( numLayers ) {
		var markerClusterOptions = this.getOptions().get( 'markercluster', numLayers === 1 );
		if ( !markerClusterOptions ) {
			return false;
		}

		if ( markerClusterOptions === true ) {
			// enabled but with no special options:
			// use default options that spiderfy identical coordinates
			// but don’t cluster nearby ones
			return {
				maxClusterRadius: 0,
				iconCreateFunction: this._getMarkerIcon
			};
		} else {
			// custom options, so use the default iconCreateFunction
			// (use $.extend to make sure the options are an object)
			return $.extend(
				{},
				markerClusterOptions
			);
		}
	};

	/**
	 * Split a geo:wktLiteral or compatible value
	 * into coordinate reference system URI
	 * and Simple Features Well Known Text (WKT) string,
	 * according to GeoSPARQL, Req 10.
	 *
	 * If the coordinate reference system is not specified,
	 * CRS84 is used as default value, according to GeoSPARQL, Req 11.
	 *
	 * @private
	 * @param {string} literal
	 * @return {?{ crs: string, wkt: string }}
	 */
	SELF.prototype._splitWktLiteral = function( literal ) {
		var match = literal.match( /(<([^>]*)> +)?(.*)/ ); // only U+0020 spaces as separator, not other whitespace, according to GeoSPARQL, Req 10

		if ( match ) {
			return { crs: match[2] || CRS84, wkt: match[3] };
		} else {
			return null;
		}
	};

	/**
	 * Check if the value is a geo:wktLiteral.
	 *
	 * @private
	 * @param {Object} value
	 * @return {boolean}
	 */
	SELF.prototype._isWktLiteral = function( value ) {
		return value &&
			value.type === 'literal' &&
			MAP_DATATYPES.indexOf( value.datatype ) !== -1;
	};

	/**
	 * Check if the value is a Commons map URL.
	 *
	 * @private
	 * @param {Object} value
	 * @return {boolean}
	 */
	SELF.prototype._isCommonsMap = function( value ) {
		return value &&
			value.type === 'uri' &&
			value.value.startsWith( PREFIX_COMMONS_DATA ) &&
			value.value.endsWith( SUFFIX_COMMONS_MAP );
	};

	/**
	 * Extract a GeoJSON object from the given geo:wktLiteral or Commons map URL.
	 *
	 * @private
	 * @param {?Object} value
	 * @return {?$.Promise} GeoJSON
	 */
	SELF.prototype._extractGeoJson = function( value ) {
		if ( this._isWktLiteral( value ) ) {
			return this._extractGeoJsonWktLiteral( value.value );
		}
		if ( this._isCommonsMap( value ) ) {
			return this._extractGeoJsonCommonsMap( value.value );
		}
		return null;
	};

	/**
	 * Extract a GeoJSON object from the given geo:wktLiteral.
	 *
	 * @private
	 * @param {string} literal
	 * @return {?$.Promise} GeoJSON
	 */
	SELF.prototype._extractGeoJsonWktLiteral = function( literal ) {
		var split = this._splitWktLiteral( literal );
		if ( !split ) {
			return null;
		}

		if ( EARTH_LONGLAT_SYSTEMS.indexOf( split.crs ) === -1 ) {
			return null;
		}

		return $.when( wellknown.parse( split.wkt ) );
	};

	/**
	 * Fetch a GeoJSON object from the given Commons URL.
	 *
	 * @private
	 * @param {string} url
	 * @return {?$.Promise} GeoJSON
	 */
	SELF.prototype._extractGeoJsonCommonsMap = function( url ) {
		// rewrite data URL to API because the data URL doesn’t support CORS at all
		var titleURI = url.match( /^http:\/\/commons.wikimedia.org\/data\/main\/(.*)$/ )[1],
			title = decodeURIComponent( titleURI );
		title = title.replace( /\+/g, ' ' ); // TODO workaround for T178184, remove when possible
		return $.getJSON(
			'https://commons.wikimedia.org/w/api.php',
			{
				format: 'json',
				action: 'query',
				titles: title,
				prop: 'revisions',
				rvprop: 'content',
				origin: '*',
				maxage: 3600 // cache for one hour
			}
		).then( function( response ) {
			var pageId, content;
			for ( pageId in response.query.pages ) {
				content = response.query.pages[ pageId ].revisions[ 0 ][ '*' ];
				return JSON.parse( content ).data;
			}
		} ).promise();
	};

	/**
	 * @private
	 */
	SELF.prototype._getItemDescription = function( row ) {
		var $result = $( '<div/>' ).append( this._getFormatter().formatRow( row, true ) );

		return $result;
	};

	/**
	 * @private
	 */
	SELF.prototype._setTileLayer = function() {
		var layer = TILE_LAYER.osm;

		if ( window.location.host === 'query.wikidata.org' ||
				window.location.host === 'localhost' ||
				window.location.host.endsWith( '.wmflabs.org' ) ) {
			layer = TILE_LAYER.wikimedia;
		}

		L.tileLayer( layer.url, layer.options ).addTo( this._map );
	};

	/**
	 * Receiving data from the a visit
	 *
	 * @param {Object} data
	 * @return {boolean} false if there is no revisit needed
	 */
	SELF.prototype.visit = function( data ) {
		return this._checkCoordinate( data );
	};

	/**
	 * Check if this value contains an coordinate value.
	 */
	SELF.prototype._checkCoordinate = function( value ) {
		if ( this._isWktLiteral( value ) || this._isCommonsMap( value ) ) {
			this._drawable = true;
			return false;
		} else {
			return true;
		}
	};

	return SELF;
}( jQuery, L, d3, _, wellknown, window ) );
