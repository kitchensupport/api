/* eslint strict: [0, "global"] */
'use strict';

// node still doesnt have built-in support for `import` :(
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const forever = require('forever-monitor');

const globs = ['src/**/*.js', 'server.js', 'gulpfile.js'];
const server = new forever.Monitor('./index.js');
let isRunning = false;

process.env.NODE_ENV = 'development';
process.env.PGSSLMODE = 'require';

server.on('start', () => {
    console.log(`DEV: starting server at ${Date.now()}`);
});
server.on('exit', () => {
    console.log(`DEV: exiting server at ${Date.now()}`);
});

gulp.task('lint', () => {
    return gulp.src(globs)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

// TODO: this task is awkward and i dont like it. Fix it, eventually
gulp.task('watch:run', () => {
    gulp.watch(globs, ['run']);
});

gulp.task('run', ['lint'], () => {
    if (isRunning) {
        server.stop();

        // setTimeout is necessary here because server.stop, for whatever reason,
        // is async without providing a callback for completion. 100ms should generally
        // be enough time to let the server stop before trying to start it again
        setTimeout(() => {
            server.start();
        }, 100);
    } else {
        server.start();
        isRunning = true;
    }
});

gulp.task('serve', ['run', 'watch:run']);
