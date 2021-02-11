const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')

// Specified to public path of backend
outputA = path.resolve(process.cwd(), '../backend/serverA/public')
outputB = path.resolve(process.cwd(), '../backend/serverB/public')

/// Common configuration for serverA and serverB
var config = {
  mode: 'development',
  experiments: { asset: true },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        exclude: [/images/],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/fonts/',
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]',
        },
      },
      {
        test: /\.(html)$/,
        use: ['html-loader'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ],
}

var serverAConfig = Object.assign({}, config, {
  name: 'serverA',
  entry: {
    main: './serverA/index.js',
    admin: './serverA/admin',
    login: './serverA/login',
  },
  output: {
    path: outputA,
    filename: '[name].js',
  },
  // do this programmatically...
  plugins: config.plugins.concat([
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './serverA/index.html',
      chunks: ['main'],
    }),
    new HtmlWebpackPlugin({
      filename: 'admin.html',
      template: './serverA/admin.html',
      chunks: ['admin'],
    }),
    new HtmlWebpackPlugin({
      filename: 'login.html',
      template: './serverA/login.html',
      chunks: ['login'],
    }),
  ]),
})

var serverBConfig = Object.assign({}, config, {
  name: 'serverB',
  entry: './serverB/index.js',
  output: {
    path: outputB,
    filename: '[name].js',
  },
  plugins: config.plugins.concat([
    new HtmlWebpackPlugin({ template: './serverB/index.html' }),
  ]),
})

module.exports = [serverAConfig, serverBConfig]
