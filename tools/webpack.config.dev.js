var webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
var packageJSON = require('../package.json');
var name = packageJSON["name"];
const AUTOPREFIXER_BROWSERS = [
  'Android 2.3',
  'Android >= 4',
  'Chrome >= 32',
  'Firefox >= 28',
  'Explorer >= 9',
  'iOS >= 7',
  'Opera >= 12',
  'Safari >= 7.1'
];

var baseConfig = require('./webpack.config.base.js');

var config = Object.create(baseConfig);
config.module.loaders.push({
  test:   /\.css$/,
  //exclude: /node_modules/,
  loader:  ExtractTextPlugin.extract("style","css!postcss")
});
config.devtool = 'eval-source-map';
config.plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development'),
  }),
  new ExtractTextPlugin(name+'.css')
];
config.postcss =  function (webpack) {
  return [
    require("postcss-import")({
      addDependencyTo: webpack
    }),
    require("postcss-apply")(),
    require("postcss-cssnext")({
      browsers:AUTOPREFIXER_BROWSERS
    })
  ];
};
//config.watch=true;


module.exports = config;
