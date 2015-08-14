module.exports = function(grunt) {

  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


  grunt.initConfig({

    config : grunt.file.readJSON('./config.json'),

    // Watches for changes and runs tasks
    watch : {
      sass : {
        files : ['scss/**/*.scss'],
        tasks : ['compass:dev']
      },
      css : {
        files : ['css/**/*.css'],
        options : {
          livereload : true
        }
      },
      js : {
        files : ['js/**/*.js'],
        tasks : ['jshint'],
        options : {
          livereload : true
        }
      },
      php : {
        files : ['**/*.php'],
        options : {
          livereload : true
        }
      }
    },

    // Clean build directory
    clean: {
      build: [ 'build' ],
      dest: [ '../<%= config.info.theme_slug %>' ]
    },

    // JsHint your javascript
    jshint : {
      all : ['js/*.js', '!js/modernizr.js', '!js/*.min.js', '!js/vendor/**/*.js'],
      options : {
        browser: true,
        curly: false,
        eqeqeq: false,
        eqnull: true,
        expr: true,
        immed: true,
        newcap: true,
        noarg: true,
        smarttabs: true,
        sub: true,
        undef: false
      }
    },

    // Compass/Sass build
    compass: {
      dist: {                   // Target
        options: {              // Target options
          sassDir: 'scss',
          cssDir: 'build/css',
          environment: 'production',
          outputStyle: 'compressed'
        }
      },
      dev: {
        options: {
          sassDir: 'scss',
          cssDir: 'css'
        }
      }
    },

    // Bower task sets up require config
    bower : {
      all : {
        rjsConfig : 'js/global.js'
      }
    },

    uglify: {
      production: {
        files: [{
          expand: true,
          cwd: 'js',
          src: ['*.js', '!global.js'],
          dest: 'build/js'
        }]
      }
    },

    // Require config
    requirejs : {
      options : {
        name : 'global',
        //baseUrl : '<%= config.env.dev.requirejs.baseUrl %>',
        mainConfigFile : 'js/global.js',
        out : 'js/optimized.min.js'
      },
      dev : {
        options: {
          baseUrl : '<%= config.env.dev.requirejs.baseUrl %>',
        }
      },
      dist : {
        options: {
          baseUrl : '<%= config.env.dev.requirejs.baseUrl %>',
          out : 'build/js/global.js'
        }
      }
    },

    // Image min
    imagemin : {
      production : {
        files : [
          {
            expand: true,
            cwd: 'img',
            src: '**/*.{png,jpg,jpeg}',
            dest: 'build/img'
          }
        ]
      }
    },

    // SVG min
    svgmin: {
      production : {
        files: [
          {
            expand: true,
            cwd: 'img',
            src: '**/*.svg',
            dest: 'build/img'
          }
        ]
      }
    },

    copy: {
      build: {
        files:[
          {
            expand: true,
            cwd: "./dist",
            src: "*",
            dest: 'build',
          },
          {
            expand: true,
            cwd: './', 
            src: ['*.php', 'templates/*.php'],
            dest: 'build'
          }
        ]
      }
    },


    // DEPLOY SCRIPTS
    // deploy via rsync
    rsync: {
      options: { 
        args: ["--verbose"],
        exclude: [
          '**/.*',
          'node_modules',
          'scss',
          'js/**/*',
          'config.json',
          'bower.json', 
          'Gruntfile.js', 
          'package.json', 
          'README.md', 
          'config.rb',
          'build',
          'dist'
        ],
        recursive: true
      },
      deployment: {
        options: {
          expand: true,
          cwd: "./",
          src: ["build/*"],
          dest: "../<%= config.info.theme_slug %>-production",
          recursive: true,
          syncDest: false,
          exclude: '<%= rsync.options.exclude %>'
        }
      },
      // staging: {
      //   options: {
      //     src: "./",
      //     dest: "~/var/www/wp-content/themes/ds-new",
      //     host: "root@45.55.168.116",
      //     recursive: true,
      //     syncDest: true
      //   }
      // }
    }
  });




  grunt.registerTask( "build:prep", function() {
    var arr = [
      'clean:build', 
      'copy:build'
    ];
    return grunt.task.run(arr);
  });



  grunt.registerTask( "build-theme", function() {
    var arr = [
      'build:prep',
      'jshint',
      'compass:dist', 
      'requirejs:dist', 
      'imagemin:production',
      'svgmin:production',
      'uglify:production',
      'rsync:deployment',
      'clean:build'
    ];
    return grunt.task.run(arr);
  });

  // Default task
  grunt.registerTask('default', ['compass:dev', 'watch']);


  // Run bower install
  grunt.registerTask('bower-install', function() {
    var done = this.async();
    var bower = require('bower').commands;
    bower.install().on('end', function(data) {
      done();
    }).on('data', function(data) {
      console.log(data);
    }).on('error', function(err) {
      console.error(err);
      done();
    });
  });

};
