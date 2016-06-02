module.exports = function(grunt){

	require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),
		sass: {
			dist: {
				options:{
					style: 'compressed',
					sourcemap: 'none',
					precision: 2,
					update: true,
					loadPath: require('node-bourbon').includePaths,
					loadPath: require('node-neat').includePaths
				},
				files: {
					'css/style.css' : 'src/scss/style.scss'
				}
			}
		},
		postcss: {
			options: {
				map: false,
				processors: [
				require('autoprefixer')({browsers: 'last 2 versions'}),
				require('cssnano')()
				]
			},
			dist: {
				src: 'css/*.css'
			}
		},
		jscs: {
			src: 'src/js/*.js',
			options: {
				'preset': 'google'
			}
		},
		uglify: {
			options: {
				beautify: false,
				preserveComments: false,
				quoteStyle: 1,
				compress: {
					drop_console: false
				}
			},
			build: {
				files: [{
					expand: true,
					src: 'src/js/build/*.js',
					dest: 'js/',
					flatten: true,
					rename: function(destBase, destPath){
						return destBase + destPath.replace('.js', '.min.js');
					}
				}]
			}
		},
		concat: {

			options: {
				separator: '\n'
			},
			dist: {
				src: ['src/js/*.js'],
				dest: 'src/js/build/scripts.js'
			}

		},
		watch: {
			css:{
				files: ['**/*.scss'],
				tasks: ['sass', 'postcss']
			},
			js: {
				files: ['src/js/*.js'],
				tasks: [/*'jscs',*/ 'concat', 'uglify']
			},
			options: {
				nospawn: true
			}
		}

	});

	grunt.registerTask('default', ['watch']);

}