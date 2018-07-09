const path = require( 'path' );
const webpack = require( 'webpack' );
const isProdBuild = process.env.NODE_ENV === 'production' ? true : false;

const plugins = [
  new webpack.optimize.ModuleConcatenationPlugin(),
  new webpack.DefinePlugin( {
    'process.env': {
      NODE_ENV: JSON.stringify( process.env.NODE_ENV ),
      client: JSON.stringify( 'client' )
    }
  } )
];

console.log( "==== BUILDING: " + process.env.NODE_ENV + " ====" );

// if production
if ( isProdBuild ) {
  console.log( "Adding uglify..." );

  plugins.push( new webpack.optimize.UglifyJsPlugin( {
    sourceMap: false,
    compressor: {
      screw_ie8: true,
      warnings: false
    }
  } ) );
}

module.exports = {
  entry: './src/client.tsx',
  output: {
    filename: 'bundle.js',
    path: path.join( __dirname, 'dist/client' )
  },
  plugins: plugins,
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
        loader: "source-map-loader",
        exclude: /node_modules/
      },
      {
        enforce: 'pre',
        test: /\.tsx?$/,
        use: "source-map-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ "*", ".tsx", ".ts", ".js" ]
  },
  devtool: isProdBuild ? false : 'inline-source-map'
};