const gulp = require( 'gulp' );
const sass = require( 'gulp-sass' );
var tslint = require( 'gulp-tslint' );
const webpack = require( 'webpack' );
const ts = require( "gulp-typescript" );
const tsProject = ts.createProject( 'tsconfig-server.json', { noImplicitAny: true } );
const tsLintProj = ts.createProject( 'tsconfig-lint.json' );

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

gulp.task( 'update-modepress-def', function( callback ) {
  return gulp.src( '../modepress-api.d.ts' )
    .pipe( gulp.dest( './src/types' ) );
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

/**
 * Ensures the code quality is up to scratch on the server
 */
gulp.task( 'lint', function() {
  return tsLintProj.src()
    .pipe( tslint( {
      configuration: 'tslint.json',
      formatter: 'verbose'
    } ) )
    .pipe( tslint.report( {
      emitError: false
    } ) )
} );

gulp.task( 'static:watch', function() {
  gulp.watch( './src/static/**/*.*', [ 'static' ] );
} );
gulp.task( 'sass:watch', function() {
  gulp.watch( './src/**/*.scss', [ 'sass' ] );
} );
gulp.task( 'tsx:watch', function() {
  gulp.watch( './src/**/*.tsx', [ 'build-ts-files' ] );
} );

gulp.task( 'build', [ 'lint', 'build-ts-files', 'sass', 'static' ] );
gulp.task( 'watch', [ 'sass:watch', 'tsx:watch', 'static:watch' ] );
gulp.task( 'default', [ 'build' ] );
