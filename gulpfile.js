const gulp = require('gulp');
const sass = require('gulp-sass');
const webpack = require('webpack');

gulp.task('build-client', function( callback ) {
    webpack( require('./webpack.client.config.js'), function(err, stats) {
        if (err)
          throw err;

        callback();
    });
});

// gulp.task('build-server', function( callback ) {
//     webpack( require('./webpack.server.config.js'), function(err, stats) {
//         if (err)
//           throw err;

//         callback();
//     });
// });

gulp.task('sass', function () {
  return gulp.src('./src/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/client/css'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./src/**/*.scss', ['sass']);
});

gulp.task('default', [ 'build-client', 'sass' ]);