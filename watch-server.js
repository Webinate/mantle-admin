// Turns on the ability use and debug ts files directly
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    sourceMap: true,
    target: 'es2018',
    noEmitOnError: false,
    inlineSources: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    allowSyntheticDefaultImports: true,
  },
});

const browserSync = require('browser-sync').create();
const fs = require('fs');
const startup = require('../../src/core/initialization/startup');
const webpack = require('webpack');

// Get the server details
const mantleJson = JSON.parse(fs.readFileSync('./clients/mantle-admin/mantle.json', { encoding: 'utf8' }));

async function start() {
  // Initialize the server
  await startup.initialize();

  browserSync.init({
    proxy: 'localhost:' + mantleJson.server.port,
    port: mantleJson.server.port,
  });

  // Set the directory to the client
  process.chdir('./clients/mantle-admin');

  // returns a Compiler instance
  const compiler = webpack(require('./webpack.config.js'));

  // Now watch the source
  compiler.watch({ aggregateTimeout: 300, poll: true, ignored: /node_modules/ }, function (err, stats) {
    console.clear();
    console.log(
      '[webpack:build]',
      stats.toString({
        chunks: false, // Makes the build much quieter
        colors: true,
      })
    );

    if (err) return;

    const jsonStats = stats.toJson();

    if (jsonStats.errors.length > 0 || jsonStats.warnings.length > 0) return;
    else {
      console.info('Compiled successfully!');
      console.info('Refreshing server code...');

      // Remove any cached files in the server
      Object.keys(require.cache).forEach(function (id) {
        if (/mantle-admin[\\\/]*src/.test(id)) {
          delete require.cache[id];
        }
      });

      browserSync.reload();
    }
  });
}

start();
