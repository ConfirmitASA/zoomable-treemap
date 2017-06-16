var path = require('path');

module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS',/*'Chrome','Firefox','IE'*/],
    coverageReporter: {
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'lcovonly', subdir: '.' },
        {type:'json', subdir: '.'},
      ],
    },
    files: [
      {
        pattern: 'src/__tests__/fixtures/**/*.html',
        watched: true,
        included: false,
        served: true
      },
      {
        pattern: 'src/__tests__/fixtures/*.json',
        watched: true,
        included: false,
        served: true
      },
      'tests.webpack.js',
    ],
    frameworks: [
      'jasmine-jquery',
      'jasmine-ajax',
      'jasmine'
    ],
    preprocessors: {
      'tests.webpack.js': ['webpack', 'sourcemap'],
    },
    reporters: ['progress', 'coverage'],
    webpack: {
      cache: true,
      devtool: 'inline-source-map',
      module: {
        preLoaders: [
          {
            test: /-test\.js$/,
            include: /src/,
            exclude: /(bower_components)/,
            loader: 'babel',
            query: {
              cacheDirectory: true,
            },
          },
          {
            test: /\.js?$/,
            include: /src/,
            exclude: /(bower_components|__tests__)/,
            loader: 'babel-istanbul',
            query: {
              cacheDirectory: true,
            },
          },
          {
            test:   /\.css$/,
            include: /src/,
            loader:  "css!postcss"
          }

        ],
        loaders: [
          {
            test: /\.js$/,
            include: path.resolve(__dirname, '../src'),
            exclude: /(node_modules|__tests__)/,
            loader: 'babel',
            query: {
              cacheDirectory: true,
            },
          },
        ],
      },
    },
  });
};


