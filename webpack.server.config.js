const path = require( 'path' );
const webpack = require( 'webpack' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const ExtractTextPlugin = require( 'extract-text-webpack-plugin' );

module.exports = {
  entry: './src/server.tsx',
  output: {
    filename: 'bundle.js',
    path: path.join( __dirname, 'dist/server' )
  },
  plugins: [
    new webpack.DefinePlugin( {
      'process.env': {
        NODE_ENV: JSON.stringify( 'development' )
      }
    } )
  ],
  module: {
    rules: [
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
    extensions: [ ".tsx", ".ts", ".js" ]
  },
  devtool: 'inline-source-map'
};