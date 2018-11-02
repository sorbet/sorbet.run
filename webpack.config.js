const path = require('path');

const src = path.resolve(__dirname, 'src');
const build = path.resolve(__dirname, 'docs');

const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const common = {
  entry: {
    index: path.resolve(src, 'index.js'),
    'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: build,
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
  node: {
    fs: 'empty',
    child_process: 'empty',
    net: 'empty',
    crypto: 'empty',
  },
  resolve: {
    alias: {
      vscode: require.resolve('monaco-languageclient/lib/vscode-compatibility'),
    },
  },
};

if (process.env.NODE_ENV === 'production') {
  module.exports = merge(common, {
    plugins: [
      new UglifyJSPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
    ],
  });
} else {
  module.exports = common;
}
