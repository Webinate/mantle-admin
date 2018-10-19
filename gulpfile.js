const gulp = require( 'gulp' );
const sass = require( 'gulp-sass' );
const tslint = require( 'gulp-tslint' );
const webpack = require( 'webpack' );
const ts = require( "gulp-typescript" );
const tsProject = ts.createProject( 'tsconfig.json' );
const fs = require( 'fs' );
const spawn = require( 'child_process' );
const webfontsGenerator = require( 'webfonts-generator' );

/**
 * Moves the static files to dist
 */
function buildStatics() {
  return gulp.src( './src/static/**/*' )
    .pipe( gulp.dest( './dist/client/' ) );
};

/**
 * Generates the font icons from svgs
 */
function generateFonts( callback ) {
  const files = [];
  fs.readdirSync( './fonts' ).forEach( file => {
    files.push( './fonts/' + file );
  } )

  webfontsGenerator( {
    fontName: 'mantle',
    cssFontsUrl: '../fonts/',
    formatOptions: {
      svg: {
        normalize: false,
        round: 0
      }
    },
    css: true,
    cssDest: './dist/client/css/mantle.css',
    html: false,
    types: [ 'eot', 'ttf', 'woff', 'woff2', 'svg' ],
    order: [ 'eot', 'ttf', 'woff', 'woff2', 'svg' ],
    files: files,
    dest: './dist/client/fonts/',
  }, function( error ) {
    if ( error ) {
      console.log( 'Font generation fail!', error );
      callback( error )
    } else {
      console.log( 'Generated Fonts...' );
      callback();
    }
  } );
}

/**
 * Builds the client TS code
 */
function buildClient( callback ) {
  webpack( require( './webpack.config.js' ), function( err, stats ) {

    if ( stats.hasWarnings() ) {
      const info = stats.toJson();
      console.warn( info.warnings );
    }

    if ( err || stats.hasErrors() ) {
      const info = stats.toJson();
      throw info.errors;
    }

    if ( err )
      throw err;

    callback();
  } );
}

/**
 * Starts a child process that runs the modepress server
 */
function runServer() {
  let prc = spawn.spawn( 'node', [ "./dist/main.js", "--config=./config.json", "--numThreads=1", "--logging=true" ], { cwd: '../../' } );
  prc.stdout.setEncoding( 'utf8' );
  prc.stderr.setEncoding( 'utf8' );
  prc.stdout.on( 'data', function( data ) {
    var str = data.toString();
    console.log( str );
  } );

  prc.stderr.on( 'data', function( data ) {
    var str = data.toString();
    console.error( str );
  } );

  prc.on( 'close', function( code ) {
    console.error( 'Server closed prematurely' );
  } );

  return prc;
}

/**
 * Builds any sass files
 */
function buildSass() {
  return gulp.src( './src/main.scss' )
    .pipe( sass().on( 'error', sass.logError ) )
    .pipe( gulp.dest( './dist/client/css' ) );
}

function copyTinyFiles() {
  return gulp.src( [
    './node_modules/tinymce/**/*'
  ] )
    .pipe( gulp.dest( './dist/client/tiny' ) )
}

/**
 * Notifies of any lint errors
 */
function lint() {
  return gulp.src( [ './src/**/*.ts', './src/**/*.tsx' ] )
    .pipe( tslint( {
      configuration: 'tslint.json',
      formatter: 'verbose'
    } ) )
    .pipe( tslint.report( {
      emitError: true
    } ) )
    .on( 'error', function( error ) {
      if ( error )
        throwerror;
    } );
}

/**
 * Builds the server ts code
 */
function quickCheck() {
  let didError = false;
  const tsResult = tsProject.src()
    .pipe( tsProject() )
    .on( 'error', function( error ) {
      didError = true;
    } );

  return tsResult.js.pipe( gulp.dest( './dist/server' ) )
    .on( 'end', function() {
      if ( didError )
        throw new Error( 'There were build errors' );
    } );
}


gulp.task( 'build', gulp.series( quickCheck, gulp.parallel( generateFonts, buildClient, lint, buildSass, buildStatics, copyTinyFiles ) ) );
gulp.task( 'build-prod', gulp.parallel( generateFonts, buildClient, lint, buildSass, buildStatics, copyTinyFiles ) );
gulp.task( 'default', gulp.series( quickCheck, gulp.parallel( generateFonts, buildClient, lint, buildSass, buildStatics, copyTinyFiles ) ) );
gulp.task( 'tiny-files', copyTinyFiles );
gulp.task( 'fonts', generateFonts );
gulp.task( 'statics', buildStatics );