const path = require( 'path' );
const webpack = require( 'webpack' );
const BundleAnalyzerPlugin = require( 'webpack-bundle-analyzer' ).BundleAnalyzerPlugin;

module.exports = {
  entry: {
    bundle: './src/client.tsx'
  },
  output: {
    filename: '[name].js',
    path: path.join( __dirname, 'dist/client' )
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin( {
      'process.env': {
        NODE_ENV: JSON.stringify( process.env.NODE_ENV ),
        client: JSON.stringify( 'client' )
      }
    } ),
    new BundleAnalyzerPlugin(),

    // Ignore all locale files of moment.js
    new webpack.IgnorePlugin( /^\.\/locale$/, /moment$/ ),

    // new webpack.optimize.CommonsChunkPlugin( {
    //   name: 'vendor', // Specify the common bundle's name.
    // } )
  ],
  module: {
    rules: [
      {
        test: /\.(jpg|png|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[hash].[ext]',
        },
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: "source-map-loader"
      },
      {
        enforce: 'pre',
        test: /\.tsx?$/,
        use: "source-map-loader"
      }
    ]
  },
  resolve: {
    extensions: [ "*", ".tsx", ".ts", ".js" ]
  },
  devtool: 'inline-source-map'
};