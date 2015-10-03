var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  watch = require('gulp-watch'),
  rename = require('gulp-rename'),
  util = require('gulp-util'),
  forever = require('forever-monitor');

// Check the javascript for errors, minify, append `.min.js` to the file, and move to the `js/min` folder.
gulp.task('scripts', function() {
    return gulp.src("js/*.js")
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jshint.reporter('fail'))
      .on('error', function() {
          util.log(util.colors.red('Error!'), "Jshint encountered an error! The code was not minified.")
          this.emit('end');
          return;
      })
      .pipe(uglify())
      .pipe(rename({
          extname: ".min.js"
        }))
      .pipe(gulp.dest("js/min"));
});

// Check `index.js` for errors, minify, append `.min.js` to the file.
gulp.task('index', function() {
    return gulp.src("index.js")
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jshint.reporter('fail'))
      .on('error', function() {
          util.log(util.colors.red('Error!'), "Jshint encountered an error! The code was not minified.")
          this.emit('end');
          return;
      })
      .pipe(uglify())
      .pipe(rename({
          extname: ".min.js"
        }))
      .pipe(gulp.dest(""));
});

// Watch the files for changes.
gulp.task('watch', function() {
    gulp.watch('js/*.js', ["scripts"]);
    gulp.watch('index.js', ["index"]);
});

// Run the server.
gulp.task('server', function() {
  new forever.Monitor('index.min.js').start();
});
