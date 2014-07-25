module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    src: 'marionette.transition-region.js',

    uglify: {
      code: {
        src: '<%= src %>',
        dest: 'marionette.transition-region.min.js',
        options: {
          sourceMap: true
        }
      }
    },

    jshint: {
      code: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: '<%= src %>'
      },
      tests: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/*.js']
      }
    },

    mochaTest: {
      spec: {
        options: {
          require: 'test/setup/node.js',
          reporter: 'dot',
          clearRequireCache: true,
          mocha: require('mocha')
        },
        src: [
          'test/setup/helpers.js',
          'test/spec/*.js'
        ]
      }
    },

    watch: {
      tests: {
        options: {
          spawn: false
        },
        files: ['marionette.transition-region.js', 'test/spec/**/*.js'],
        tasks: ['test']
      }
    }
  });

  grunt.registerTask('test', 'Test the library', [
    'jshint',
    'mochaTest'
  ]);

  grunt.registerTask('build', 'Build the library', [
    'test',
    'uglify'
  ]);

  grunt.registerTask('default', 'An alias of test', [
    'test'
  ]);
};
