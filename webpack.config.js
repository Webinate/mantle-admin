const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const yargs = require('yargs');
const isProdBuild = process.env.NODE_ENV === 'production' ? true : false;
const analyze = yargs.argv.analyze || false;

const plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      client: JSON.stringify('client'),
    },
  }),
];

if (isProdBuild) {
  console.log('Adding ugligy plugin...');
  plugins.push(
    new UglifyJsPlugin({
      sourceMap: true,
    })
  );
}

if (analyze) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  console.log('Adding analyzer plugin...');
  plugins.push(new BundleAnalyzerPlugin());
}

console.log('==== BUILDING: ' + (process.env.NODE_ENV || 'development') + ' ====');

module.exports = {
  mode: isProdBuild ? 'production' : 'development',
  entry: {
    bundle: './src/client.tsx',
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist/client'),
  },
  plugins: plugins,
  optimization: {
    namedModules: true,
    noEmitOnErrors: true,
    concatenateModules: true,
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
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
        options: { allowTsInNodeModules: true },
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: /node_modules/,
      },
      {
        enforce: 'pre',
        test: /\.tsx?$/,
        use: 'source-map-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['*', '.tsx', '.ts', '.js'],
  },
  devtool: isProdBuild ? undefined : 'source-map',
  devServer: {
    contentBase: './dist/client',
  },
};
