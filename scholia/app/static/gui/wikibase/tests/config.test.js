( function( $, QUnit ) {
	'use strict';
	var oldGetJson = $.getJSON;

	QUnit.module(
		'config',
		{
			afterEach: function () {
				$.getJSON = oldGetJson;
				CONFIG.reset();
			}
		}
	);

	QUnit.test( 'Default and custom config exist', function( assert ) {
		var done = assert.async();

		$.getJSON = function( url ) {
			var deferred = $.Deferred();

			if ( url === './default-config.json' ) {
				deferred.resolve( {
					aKey: "aValue",
					anObject: { foo: "bar", wikidata: true },
					notZero: 0
				} );
			} else if ( url === './custom-config.json' ) {
				deferred.resolve( {
					customKey: "customValue",
					anObject: { pie: true, wikidata: false },
					notZero: 1
				} );
			} else {
				assert.ok( false, 'Unexpected URL: ' + url );
			}
			return deferred.promise();
		};

		CONFIG.getConfig().then( function( actualConfig ) {
			var expected = {
					aKey: "aValue",
					customKey: "customValue",
					anObject: { foo: "bar", pie: true, wikidata: false },
					notZero: 1
				};

			assert.equal( typeof actualConfig.language, 'string' );
			assert.equal( typeof actualConfig.i18nLoad, 'function' );

			// These are not static, thus we don't care for the exact value.
			delete actualConfig.language;
			delete actualConfig.i18nLoad;

			assert.deepEqual( actualConfig, expected );
			done();
		} );
	} );

	QUnit.test( 'Default config exists, custom config does not', function( assert ) {
		var done = assert.async(),
			config = {
				aKey: 'aValue',
				anObject: { foo: 'bar', wikidata: true },
				notZero: 0
			};

		$.getJSON = function( url ) {
			var deferred = $.Deferred();

			if ( url === './default-config.json' ) {
				deferred.resolve( config );
			} else if ( url === './custom-config.json' ) {
				deferred.reject(
					{ status: 404 },
					'',
					''
				);
			} else {
				assert.ok( false, 'Unexpected URL: ' + url );
			}
			return deferred.promise();
		};

		CONFIG.getConfig().then( function( actualConfig ) {
			assert.equal( typeof actualConfig.language, 'string' );
			assert.equal( typeof actualConfig.i18nLoad, 'function' );

			// These are not static, thus we don't care for the exact value.
			delete actualConfig.language;
			delete actualConfig.i18nLoad;

			assert.deepEqual( actualConfig, config );
			done();
		} );
	} );

	QUnit.test( 'Failed loading default-config.json', function( assert ) {
		var done = assert.async();

		$.getJSON = function( url ) {
			var deferred = $.Deferred();

			if ( url === './default-config.json' ) {
				deferred.reject(
					{},
					'',
					'$.getJSON_ERROR'
				);
			} else if ( url === './custom-config.json' ) {
				deferred.reject(
					{ status: 404 },
					'',
					''
				);
			} else {
				assert.ok( false, 'Unexpected URL: ' + url );
			}
			return deferred.promise();
		};

		CONFIG.getConfig().fail( function( errorMessage ) {
			assert.equal( errorMessage, 'Failed loading default-config.json: $.getJSON_ERROR' );

			done();
		} );
	} );

}( jQuery, QUnit ) );
