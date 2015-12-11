/**
 * Grunt file for ferropoly main
 *
 * grunt update
 *    Updates the local common files with the ones from the editor project

 * Create a new bugfix version (x.y.++):
 *   grunt v:patch
 *   grunt minify
 *   grunt bump-commit
 *
 * Create a new feature version (x.++.0)
 *   grunt v:minor
 *   grunt minify
 *   grunt bump-commit
 *
 * Create a new major version (++.0.0)
 *   grunt v:major
 *   grunt minify
 *   grunt bump-commit
 *
 * Created by kc on 14.04.15.
 */
'use strict';
module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {},
      dist: {
        src: [
          './main/public/js/reception/reception-framework.js',
          './main/public/js/reception/ferropoly-socket.js',
          './main/public/js/reception/datastore/datastore.js',
          './main/public/js/reception/datastore/chancellery.js',
          './main/public/js/reception/datastore/properties.js',
          './main/public/js/reception/datastore/propertyAccount.js',
          './main/public/js/reception/datastore/statistics.js',
          './main/public/js/reception/datastore/team.js',
          './main/public/js/reception/datastore/teamAccount.js',
          './main/public/js/reception/datastore/trafficInfo.js',
          './main/public/js/reception/datastore/travellog.js',
          './main/public/js/reception/datastore/datastoreStarter.js',
          './main/public/js/reception/ferrostats.js',
          './main/public/js/reception/activecall.js',
          './main/public/js/reception/teamaccountsCtrl.js',
          './main/public/js/reception/managecallCtrl.js',
          './main/public/js/reception/dashboardCtrl.js',
          './main/public/js/reception/mapCtrl.js',
          './main/public/js/reception/ferrostatsCtrl.js',
          './main/public/js/reception/chanceCtrl.js',
          './main/public/js/reception/propertiesCtrl.js',
          './main/public/js/reception/trafficCtrl.js'
        ],
        dest: './main/public/js/reception.js'
      },
      framework: {
        src: [
          './main/public/jquery/jquery-2.1.3.min.js',
          './main/public/bootstrap/js/bootstrap.min.js',
          './main/public/angular/angular.min.js',
          './main/public/moment/moment.min.js',
          './main/public/lodash/lodash.min.js'
        ],
        dest: './main/public/js/framework.min.js'
      },
      css: {
        src: [
          './main/public/bootstrap/css/bootstrap.min.css',
          './main/public/bootstrap/css/bootstrap-theme.min.css',
          './main/public/css/font-awesome.min.css',
          './main/public/css/ferropoly.css'
        ],
        dest: './main/public/css/ferropoly.min.css'
      }
    },
    uglify: {
      js: {
        files: {
          './main/public/js/reception.min.js': ['./main/public/js/reception.js']
        }
      },
      options: {
        unused: false,
        dead_code: true,
        properties: false,
        beautify: false,
        compress: false,
        mangle: false, // do not rename variables
        banner: '/* <%= pkg.name %> V<%= pkg.version %>, <%= grunt.template.today("dd-mm-yyyy") %>, (c) Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch */\n'

      }
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: '../ferropoly-editor/common/lib',
            src: '*.js',
            dest: 'common/lib/',
            flatten: true,
            filter: 'isFile',
            timestamp: true
          },

          {
            expand: true,
            cwd: '../ferropoly-editor/common/models',
            src: '*.js',
            dest: 'common/models/',
            flatten: true,
            filter: 'isFile',
            timestamp: true
          },

          {
            expand: true,
            cwd: '../ferropoly-editor/common/models/accounting',
            src: '*.js',
            dest: 'common/models/accounting',
            flatten: true,
            filter: 'isFile',
            timestamp: true
          },

          {
            expand: true,
            cwd: '../ferropoly-editor/common/routes',
            src: '*.js',
            dest: 'common/routes/',
            flatten: true,
            filter: 'isFile',
            timestamp: true
          }
        ]
      }
    },

    eslint: {
      src: [
        'server.js',
        'main/lib/**/*.js',
        'main/routes/**/*.js'
      ],
      options: {
        config: './.eslintrc'
      }
    },

    bump: {
      options: {
        files: ['package.json'],
        updateConfigs: [],
        commit: true,
        commitMessage: 'New version added v%VERSION%',
        commitFiles: ['-a'],
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'git@bitbucket.org:christian_kuster/ferropoly_main.git',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: false,
        prereleaseName: false,
        regExp: false
      }
    }


  });
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-bump');
  grunt.registerTask('default', ['uglify:js']);
  grunt.registerTask('minify', ['concat', 'uglify:js']);
  grunt.registerTask('v:patch', ['bump-only:patch']);
  grunt.registerTask('v:minor', ['bump-only:minor']);
  grunt.registerTask('v:major', ['bump-only:major']);
  grunt.registerTask('demo', ['shell']);
  grunt.registerTask('update', ['copy']);
  grunt.registerTask('lint', ['eslint']);
};
