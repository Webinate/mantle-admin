const gulp = require( 'gulp' );
const sass = require( 'gulp-sass' );
const webpack = require( 'webpack' );
const ts = require( "gulp-typescript" );
const tsProject = ts.createProject( 'tsconfig-server.json', { noImplicitAny: true } );


gulp.task( 'static', function( callback ) {
  return gulp.src( './src/static/**/*' )
    .pipe( gulp.dest( './dist/client/' ) );
} );

gulp.task( 'build-client', function( callback ) {
  webpack( require( './webpack.config.js' ), function( err, stats ) {
    if ( err )
      throw err;

    callback();
  } );
} );

gulp.task( 'build-server', function( callback ) {
  const tsResult = tsProject.src()
    .pipe( tsProject() )

  return tsResult.js.pipe( gulp.dest( './dist/server' ) );
} );

gulp.task( 'build-ts-files', [ 'build-client', 'build-server' ], function( callback ) {
  callback();
} );

gulp.task( 'sass', function() {
  return gulp.src( './src/main.scss' )
    .pipe( sass().on( 'error', sass.logError ) )
    .pipe( gulp.dest( './dist/client/css' ) );
} );

gulp.task( 'sass:watch', function() {
  gulp.watch( './src/**/*.scss', [ 'sass' ] );
} );
gulp.task( 'tsx:watch', function() {
  gulp.watch( './src/**/*.tsx', [ 'build-ts-files' ] );
} );

gulp.task( 'build', [ 'build-ts-files', 'sass', 'static' ] );
gulp.task( 'watch', [ 'sass:watch', 'tsx:watch' ] );
gulp.task( 'default', [ 'build' ] );