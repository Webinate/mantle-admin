const path = require( 'path' );
const webpack = require( 'webpack' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const ExtractTextPlugin = require( 'extract-text-webpack-plugin' );

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.join( __dirname, 'public' )
  },
  plugins: [
    new webpack.DefinePlugin( {
      'process.env': {
        NODE_ENV: JSON.stringify( 'development' )
      }
    } ),
    // new HtmlWebpackPlugin( {
    //   template: './src/index.html',
    //   filename: 'index.html'
    // } ),
    new ExtractTextPlugin( {
      filename: '[name].css',
      allChunks: true
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
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract( [ 'css-loader', 'sass-loader' ] )
      }
    ]
  },
  resolve: {
    extensions: [ ".tsx", ".ts", ".js" ]
  },
  devtool: 'inline-source-map'
};