/*! QUAIL quailjs.org | quail-lib.org/license */
/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('quail.json'),
    clean: {
      vendor: ['dist/vendor']
    },
    convert: {
      yml2json: {
        files: [
          {
            expand: true,
            cwd: 'src/resources/guidelines',
            src: ['*.yml'],
            dest: 'dist/guidelines/',
            ext: '.json'
          },
          {
            expand: true,
            cwd: 'src/resources',
            src: ['*.yml'],
            dest: 'dist/',
            ext: '.json'
          }
        ]
      }
    },
    concat: {
      options: {
        banner: '<%= pkg.options.banner %>' + "\n" + ';(function($) {' + "\n" + '\'use strict\';' + '\n',
        footer: "\n" + '})(jQuery);',
        stripBanners: true
      },
      dist: {
        src: [
          'src/js/quail.jquery.js',
          'src/js/core.js',
          'src/js/components/*.js',
          'src/js/strings/*.js',
          'src/js/custom/*.js',
          'src/assessments/**/*.js',
          'src/js/lib/*.js',
          'src/js/lib/wcag/*.js',
          'src/js/lib/wcag2/*.js'
        ],
        dest: 'dist/quail.jquery.js'
      },
      test: {
        src: [
          'src/js/quail.jquery.js',
          'src/js/core.js',
          'src/js/components/*.js',
          'src/js/strings/*.js',
          'src/js/custom/*.js',
          'src/assessments/**/*.js',
          'src/js/lib/*.js',
          'src/js/lib/wcag/*.js',
          'src/js/lib/wcag2/*.js'
        ],
        dest: 'test/quail-testing.jquery.js',
        options: {
          banner: '<%= pkg.options.banner %>' + "\n" + 'var __testQuail = {};(function($) {' + "\n",
          footer: "\n" + 'window.__testQuail = quail; })(jQuery);',
          stripBanners: true
        }
      }
    },
    copy: {
      vendor: {
        expand: true,
        src: 'node_modules/{commander,shelljs,phantomjs,jquery}/**/*',
        dest: 'dist/vendor/'
      },
      evaluator: {
        expand: true,
        flatten: true,
        src: 'src/js/lib/phantom_evaluator.js',
        dest: 'dist/evaluator'
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/quail.jquery.min.js': 'dist/quail.jquery.js'
        }
      },
      options: {
        banner: '<%= pkg.options.banner %>'
      }
    },
    karma: {
      unit: {
        configFile: 'config/karma-unit.conf.js',
        singleRun: true,
        browsers: ['PhantomJS']
      }
    },
    execute: {
      assessments: {
        src: ['test/assessmentSpecs/testrunner.js']
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      project_env: [
        'Gruntfile.js'
      ],
      browser_env: [
        'src/js/components/*.js',
        'src/js/custom/*.js',
        'src/js/lib/*.js',
        'src/js/strings/*.js',
        'src/js/core.js'
      ],
      cli_env: [
        'src/js/scripts/*.js'
      ]
    },
    watch: {
      scripts: {
        files: [
          'src/**/*.js',
          'src/**/*.yml',
          'test/accessibility-tests/*.html'
        ],
        tasks: [
          'convert',
          'concat',
          'jshint',
          'buildTestFilesJson',
          'buildGuideline',
          'uglify'
        ],
        options: {
          spawn: false
        }
      }
    },
    chmod: {
      bin: {
        options: {
          mode: '711'
        },
        src: ['bin/*']
      }
    },
    buildGuideline: {
      dist: {
        files: [
          {
            guideline: '508',
            src: 'dist/tests.json',
            dest: 'dist/guidelines/508.tests.json'
          },
          {
            guideline: 'wcag',
            src: 'dist/tests.json',
            dest: 'dist/guidelines/wcag.tests.json'
          }
        ]
      }
    },
    compressTestsJson: {
      dist: {
        files: [
          {
            src: 'dist/tests.json',
            dest: 'dist/tests.min.json'
          }
        ]
      }
    },
    buildTestFilesJson: {
      dist: {
        files: [
          {
            src: 'test/accessibility-tests/*.html',
            dest: 'test/accessibility-tests/_tests.json'
          },
          {
            src: 'test/core/*.html',
            dest: 'test/core/_tests.json'
          }
        ]
      }
    },
    'gh-pages': {
      options: {
        base: '',
        repo: 'https://github.com/quailjs/quailjs.github.io.git',
        branch: 'master',
        add: true,
        message: 'Auto-generated commit from grunt gh-pages.'
      },
      src: ['dist/**', 'src/**']
    },
    bower: {
      install: { }
    }
  });
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-chmod');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-convert');
  grunt.loadNpmTasks('grunt-execute');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-bower-task');

  // By default, just run tests
  grunt.registerTask('default', [
    'bower:install',
    'convert',
    'concat',
    'jshint',
    'buildTestFilesJson',
    'buildGuideline',
    'compressTestsJson',
    'karma',
    'execute:assessments'
  ]);

  // Dev task
  grunt.registerTask('dev', ['convert', 'concat']);


  // Build task.
  grunt.registerTask('build', [
    'bower:install',
    'convert',
    'concat',
    'jshint',
    'buildTestFilesJson',
    'buildGuideline',
    'compressTestsJson',
    'uglify'
  ]);

  // Release task.
  grunt.registerTask('release', [
    'bower:install',
    'convert',
    'concat',
    'jshint',
    'buildTestFilesJson',
    'karma',
    'execute:assessments',
    'buildGuideline',
    'compressTestsJson',
    'uglify',
    'gh-pages'
  ]);

  // Test task.
  grunt.registerTask('test', [
    'bower:install',
    'convert',
    'concat',
    'jshint',
    'buildTestFilesJson',
    'buildGuideline',
    'compressTestsJson',
    'karma',
    'execute:assessments'
  ]);

  grunt.registerTask('publish', ['gh-pages']);
};
