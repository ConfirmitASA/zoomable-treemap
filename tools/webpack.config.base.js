var packageJSON = require('../package.json');
var name = packageJSON["name"];

module.exports = {
  entry: {
    js:"./src/main.js",
  },
  output: {
    path: "./dist",
    filename: name+".bundle.js"
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /(bower_components)/,
      loader: 'babel',
    }],
  },
  resolve: {
    extensions: [
      '',
      '.js',
    ],
  },
};
