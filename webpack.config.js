/* eslint-disable */
const webpack = require("webpack");

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const UglifyJS = require("uglify-es"); 

module.exports = {
  entry: './src/js/entry.js',
  output: {
    filename: 'entry.js',
    path: path.resolve(__dirname, 'dist')
  },
  externals: {
    "./ext/ext.js" : "globalHello"
  },
  node: {
    fs: "empty"
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      filename: 'views/index.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/apply_voting.html',
      filename: 'views/apply_voting.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/set_session.html',
      filename: 'views/set_session.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/vote.html',
      filename: 'views/vote.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/create_crowd_funding.html',
      filename: 'views/create_crowd_funding.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/all_crowd_fundings.html',
      filename: 'views/all_crowd_fundings.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/test.html',
      filename: 'views/test.html' 
    }),
    new CopyWebpackPlugin([
      // { 
      //   from: path.resolve(__dirname,"src/ext")+'/ext.js',
      //   to: './ext/ext.js',
      //   toType: 'file'
      // },
      { 
        from: path.resolve(__dirname,"src/ext")+'/web3.js',
        to: './ext/web3.js',
        toType: 'file'
      },
      { 
        from: path.resolve(__dirname,"src")+'/footer.ejs',
        to: './views/footer.ejs',
        toType: 'file',
        // transform: function (content, path) {               // add transform()
        //   return UglifyJS.minify(content.toString()).code;  // use uglify
        // }
      },
      { 
        from: path.resolve(__dirname,"src")+'/header.ejs',
        to: './views/header.ejs',
        toType: 'file',
        // transform: function (content, path) {               // add transform()
        //   return UglifyJS.minify(content.toString('utf8')).code;  // use uglify
        // }
      }
    ])
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        ]
      },
      {
        // test: /\.scss$/,
        test: /\.(css|scss)$/,
        use: [MiniCssExtractPlugin.loader,'css-loader', 'sass-loader']
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          }
        ]
      },
      {
        test: /\.(jpg|png)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
              name: '[name].[ext]',
              outputPath: 'img',
              publicPath: 'img'
            } 
          }
        ]
      }
    ]
  },
  devServer: {
    inline: true,
    contentBase: path.resolve(__dirname, 'dist'),
    port: 5000
  }
};
