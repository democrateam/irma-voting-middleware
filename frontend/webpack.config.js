const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

// Specified to public path of backend
outputA = path.resolve(process.cwd(), "../backend/serverA/public");
outputB = path.resolve(process.cwd(), "../backend/serverB/public");

/// Common configuration for serverA and serverB
var config = {
  mode: "development",
  experiments: { asset: true },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        exclude: [/images/],
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "assets/fonts/",
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/images/[name].[ext]",
        },
      },
      {
        test: /\.(html)$/,
        use: ["html-loader"],
      },
    ],
  },
};

var serverAConfig = Object.assign({}, config, {
  name: "serverA",
  entry: ["./serverA/index.js", "./serverA/issue.js"],
  output: {
    path: outputA,
    filename: "[name].js",
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./serverA/index.html",
    }),
    new HtmlWebpackPlugin({
      filename: "issue.html",
      template: "./serverA/issue.html",
    }),
  ],
});

var serverBConfig = Object.assign({}, config, {
  name: "serverB",
  entry: "./serverB/index.js",
  output: {
    path: outputB,
    filename: "[name].js",
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({ template: "./serverB/index.html" }),
  ],
});

module.exports = [serverAConfig, serverBConfig];
