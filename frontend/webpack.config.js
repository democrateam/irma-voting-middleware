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
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        exclude: [/images/],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name][ext]',
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
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ],
}

var serverAConfig = Object.assign({}, config, {
  name: 'serverA',
  entry: {
    userIndex: './serverA/user/index.js',
    adminIndex: './serverA/admin/index.js',
    login: './serverA/admin/login.js',
    election: './serverA/admin/election.js',
  },
  output: {
    path: outputA,
    filename: '[name].js',
  },
  // do this programmatically...
  plugins: config.plugins.concat([
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'user/index.html',
      template: './serverA/user/index.html',
      chunks: ['userIndex'],
    }),
    new HtmlWebpackPlugin({
      filename: 'admin/index.html',
      template: './serverA/admin/index.html',
      chunks: ['adminIndex'],
    }),
    new HtmlWebpackPlugin({
      filename: 'admin/login.html',
      template: './serverA/admin/login.html',
      chunks: ['login'],
    }),
    new HtmlWebpackPlugin({
      filename: 'admin/election.html',
      template: './serverA/admin/election.html',
      chunks: ['election'],
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
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({ template: './serverB/index.html' }),
  ]),
})

module.exports = [serverAConfig, serverBConfig]
