/* eslint strict: [0, "global"] */
'use strict';

// node still doesnt have built-in support for `import` :(
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const forever = require('forever-monitor');

const globs = ['src/**/*.js', 'server.js', 'gulpfile.js'];

process.env.NODE_ENV = 'development';

gulp.task('lint', () => {
    return gulp.src(globs)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

// TODO: this task is awkward and i dont like it. Fix it, eventually
gulp.task('watch', () => {
    const server = new forever.Monitor('./index.js');

    server.start();

    gulp.watch(globs, ['lint'], () => {
        server.stop().start();
    });
});

gulp.task('run', ['lint', 'watch']);
