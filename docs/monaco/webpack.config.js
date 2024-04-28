/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const path = require('path');
const lib = path.resolve(__dirname, 'lib');

const webpack = require('webpack');
const merge = require('webpack-merge');

const common = {
  entry: {
    main: path.resolve(lib, 'main.js'),
    'editor.worker': 'monaco-editor-core/esm/vs/editor/editor.worker.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: lib,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  target: 'web',

  resolve: {
    alias: {
      vscode: require.resolve('monaco-languageclient/lib/vscode-compatibility'),
      // monaco-vim requires monaco-editor... but not really: only for the core
      // editor things which are provided in monaco-editor-core, so we trick it
      // into workign with an alias.
      'monaco-editor': 'monaco-editor-core',
    },
    fallback: {
      net: false,
      assert: require.resolve('assert'),
      buffer: require.resolve('buffer'),
      console: require.resolve('console-browserify'),
      constants: require.resolve('constants-browserify'),
      crypto: require.resolve('crypto-browserify'),
      domain: require.resolve('domain-browser'),
      events: require.resolve('events'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      punycode: require.resolve('punycode'),
      process: require.resolve('process/browser'),
      querystring: require.resolve('querystring-es3'),
      stream: require.resolve('stream-browserify'),
      string_decoder: require.resolve('string_decoder'),
      sys: require.resolve('util'),
      timers: require.resolve('timers-browserify'),
      tty: require.resolve('tty-browserify'),
      url: require.resolve('url'),
      util: require.resolve('util'),
      vm: require.resolve('vm-browserify'),
      zlib: require.resolve('browserify-zlib'),
    },
  },
};

if (process.env['NODE_ENV'] === 'production') {
  module.exports = merge(common, {
    plugins: [
      // new UglifyJSPlugin(),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      new webpack.ProvidePlugin({
        setImmediate: ['setimmediate', 'setImmedate'],
        clearImmediate: ['setimmediate', 'clearImmedate'],
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
    ],
  });
} else {
  module.exports = merge(common, {
    devtool: 'source-map',
    plugins: [
      new webpack.ProvidePlugin({
        setImmediate: ['setimmediate', 'setImmedate'],
        clearImmediate: ['setimmediate', 'clearImmedate'],
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          loader: 'source-map-loader',
        },
      ],
    },
  });
}
