/* jshint node:true */
module.exports = function( grunt ) {
	'use strict';
	require( 'load-grunt-tasks' )( grunt );
	var pkg = grunt.file.readJSON( 'package.json' );
	var buildFolder = 'build';

	grunt.initConfig( {
		pkg: pkg,
		jshint: {
			options: {
				jshintrc: true
			},
			all: [
					'**/*.js', '!dist/**', '!' + buildFolder + '/**', '!target/**'
			]
		},
		eslint: {
			src: [
				'**/*.js',
				'!dist/**',
				'!' + buildFolder + '/**',
				'!target/**',
				'!node_modules/**',
				'!vendor/**',
				'!wikibase/tests/**',
				'!polestar/**',
				'!wikibase/codemirror/addon/**'
			]
		},
		jsonlint: {
			all: [
					'**/*.json', '!node_modules/**', '!vendor/**', '!dist/**', '!' + buildFolder + '/**', '!polestar/**', '!target/**'
			]
		},
		qunit: {
			all: [
				'wikibase/tests/*.html'
			],
			options: {
				puppeteer: {
					headless: true,
					/*
					 * no-sandbox mode is needed to make qunit work with docker.
					 * It would be nice to do this optionally, so local test runs are still sandboxed...
					 */
					args: ['--no-sandbox', '--disable-setuid-sandbox'],
					/*
					 * In case PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true is set, we
					 * need a way to set the Chrome path using an environment
					 * variable.
					 * When grunt-contrib-qunit updates to Puppeteer 1.8.0+, we
					 * can replace that by setting PUPPETEER_EXECUTABLE_PATH in
					 * package.json
					 */
					executablePath: process.env.CHROME_BIN || null
				}
			}
		},
		less: {
			all: {
				files: {
					'style.css': 'style.less'
				}
			}
		},
		stylelint: {
			all: [
				'style.less'
			]
		},
		banana: {
			all: 'i18n/',
					options: {
						disallowBlankTranslations: false
					}
				},
		clean: {
			release: [
				buildFolder
			],
			deploy: [
					buildFolder + '/*',
					'!' + buildFolder + '/custom-config.json',
					'!' + buildFolder + '/.git/**'
			]
		},
		useminPrepare: {
			html: [
					'index.html', 'embed.html'
			],
			options: {
				dest: buildFolder
			}
		},
		concat: {},
		uglify: {},
		copy: {
			release: {
				files: [
						{// bootstrap icons
							expand: true,
							flatten: true,
							src: [
								'**/*.{eot,ttf,woff,woff2}'
							],
							dest: buildFolder + '/fonts/',
							filter: 'isFile'
						},
						{// uls images
							expand: true,
							flatten: true,
							src: [
								'**/jquery.uls/images/*.{png,jpg,svg}'
							],
							dest: buildFolder + '/images/',
							filter: 'isFile'
						},
						{// jstree
							expand: true,
							flatten: true,
							src: [
								'**/jstree/**/*.{png,gif}'
							],
							dest: buildFolder + '/css/',
							filter: 'isFile'
						},
						{// leaflet fullscreen images
							expand: true,
							flatten: true,
							src: [
								'**/leaflet-fullscreen/**/*.png'
							],
							dest: buildFolder + '/css/',
							filter: 'isFile'
						},
						{// leaflet images
							expand: true,
							flatten: true,
							src: [
								'**/leaflet/dist/images/*.png',
								'**/leaflet-minimap/dist/images/*.svg'
							],
							dest: buildFolder + '/css/images',
							filter: 'isFile'
						},{
							expand: true,
							cwd: './',
							src: [
									'*.html',
									'logo.svg', 'logo-embed.svg', 'robots.txt', 'favicon.*'
							],
							dest: buildFolder
						},{
							expand: true,
							src: [
								'**/polestar/**'
							],
							dest: buildFolder
						},{
							expand: true,
							cwd: './node_modules/mathjax/es5/',
							src: [
								'output/chtml/fonts/woff-v2/*.woff'
							],
							dest: buildFolder + '/js'
						},{
							expand: true,
							src: [
								'examples/code/*.txt'
							],
							dest: buildFolder,
							filter: 'isFile'
						},
						{// json config
							expand: false,
							src: [
								'default-config.json'
							],
							dest: buildFolder + '/default-config.json',
							filter: 'isFile'
						}
				]
			}
		},
		'merge-i18n': {
			i18n: {
				src: [
					'**/i18n/*.json',
					'!**/examples/**',
					'!**/demo/**'
				],
				dest: buildFolder + '/i18n'
			}
		},
		cssmin: {
			options: {
				debug: true
			}
		},
		filerev: {
			options: {
				encoding: 'utf8',
				algorithm: 'md5',
				length: 20
			},
			release: {
				files: [
					{
						src: [
								buildFolder + '/js/*.js', buildFolder + '/css/*.css'
						]
					}
				]
			}
		},
		usemin: {
			html: [
					buildFolder + '/index.html', buildFolder + '/embed.html'
			]
		},
		htmlmin: {
			build: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: [
					{
						expand: true,
						cwd: buildFolder,
						src: '**/*.html',
						dest: buildFolder
					}
				]
			}
		},
		shell: {
			options: {
				execOptions: {
					shell: '/bin/sh'
				}
			},
			updateRepo: {// updates the gui repo
				command: 'git remote update && git pull'
			},
			cloneDeploy: {// clone gui deploy to build folder
				command: 'git clone --branch <%= pkg.repository.deploy.branch %>' +
						' --single-branch https://<%= pkg.repository.deploy.gerrit %>/r/<%= pkg.repository.deploy.repo %> ' +
						buildFolder
			},
			commitDeploy: {// get gui commit message and use it for deploy commit
				command: [
						'lastrev=$(git rev-parse HEAD)',
						'message=$(git log -1 --pretty=%B | grep -v Change-Id)',
						'newmessage=$(cat <<END\nMerging from $lastrev:\n\n$message\nEND\n)',
						'cd ' + buildFolder,
						'curl -Lo .git/hooks/commit-msg https://<%= pkg.repository.deploy.gerrit %>/r/tools/hooks/commit-msg',
						'chmod u+x .git/hooks/commit-msg',
						'git add -A', 'git commit -m "$newmessage"',
						'echo "$newmessage"'
				].join( '&&' )
			},
			formatPatchDeploy: {// generate patch file for deploy commit(s)
				command: 'git -C ' + buildFolder + ' format-patch --output-directory .. @{u}'
			},
			review: {
				command: [
						'cd ' + buildFolder,
						'git push ssh://<%= pkg.repository.deploy.gerrit %>:29418/<%= pkg.repository.deploy.repo %>.git HEAD:refs/publish/<%= pkg.repository.deploy.branch %>'
				].join( '&&' )
			}
		},
		'auto_install': {
			local: {},
			options: {
				npm: '--production --no-package-lock'
			}
		}
	} );

	grunt.registerTask( 'configDeploy', 'Creates .git-review in build folder', function() {
		var file = '[gerrit]\nhost=' + pkg.repository.deploy.gerrit + '\n' +
			'port=29418\n' +
			'project=' + pkg.repository.deploy.repo + '.git\n' +
			'defaultbranch=' + pkg.repository.deploy.branch + '\n' +
			'defaultrebase=0\n';

		grunt.file.write( buildFolder + '/.gitreview', file );
	} );

	grunt.registerTask( 'wdio', function () {
		var done = this.async();
		var spawn = require( 'child_process' ).spawn;

		var serverProcess = spawn( 'node_modules/.bin/http-server', [ '-p', '8082' ], {
			stdio: [ process.stdin, process.stdout, process.stderr ]
		} );

		var wdioProcess = spawn( 'node_modules/.bin/wdio', [], {
			stdio: [ process.stdin, process.stdout, process.stderr ]
		} );

		wdioProcess.on( 'exit', function ( error ) {
			serverProcess.kill();
			if ( error ) {
				done( false );
			} else {
				done( true );
			}
		} );

		wdioProcess.on( 'error', function ( error ) {
			serverProcess.kill();
			done( false );
		} );

	} );
	grunt.registerTask( 'test', [
		'eslint', 'jshint', 'jsonlint', 'banana', 'stylelint', 'qunit'
	] );
	grunt.registerTask( 'browser_test', [
		'wdio'
	] );
	grunt.registerTask( 'build', [
		'clean', 'create_build'
	] );
	grunt.registerTask( 'create_build', [
		'auto_install', 'only_build'
	] );
	grunt.registerTask( 'only_build', [
		'less', 'copy', 'useminPrepare', 'concat', 'cssmin', 'uglify', 'filerev', 'usemin', 'htmlmin', 'merge-i18n'
	] );
	grunt.registerTask( 'build_for_deploy', [
		'test', 'browser_test', 'clean', 'shell:cloneDeploy', 'clean:deploy', 'only_build'
	] );
	grunt.registerTask( 'deploy', [
		'build-for-deploy', 'shell:commitDeploy', 'shell:review'
	] );
	grunt.registerTask( 'security', [
		'clean', 'shell:cloneDeploy', 'clean:deploy', 'only_build', 'shell:commitDeploy', 'shell:formatPatchDeploy'
	] );
	grunt.registerTask( 'default', 'test' );
};
