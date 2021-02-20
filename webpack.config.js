// eslint-disable-next-line import/no-extraneous-dependencies
const path = require('path')
const SizePlugin = require('size-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  devtool: 'source-map',
  stats: 'errors-only',
  entry: {
    background: './source/background',
    options: './source/options',
    profile: './source/contentScripts/profile',
    friends: './source/contentScripts/friends'
  },
  output: {
    path: path.join(__dirname, 'distribution'),
    filename: '[name].js'
  },
  plugins: [
    new SizePlugin(),
    new CopyWebpackPlugin([
      {
        from: '**/*',
        context: 'source',
        ignore: ['*.js']
      },
      {
        from: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
      }
    ]),
    new CleanWebpackPlugin({
      verbose: true,
      cleanStaleWebpackAssets: false
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader'
      }
    ]
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false,
          compress: false,
          output: {
            beautify: true,
            indent_level: 2 // eslint-disable-line camelcase
          }
        }
      })
    ]
  }
}
