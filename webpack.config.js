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
    // new HtmlWebpackPlugin({
    //   template: 'src/index.html',
    //   filename: 'views/index.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: 'src/apply_voting.html',
    //   filename: 'views/apply_voting.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: 'src/set_session.html',
    //   filename: 'views/set_session.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: 'src/vote.html',
    //   filename: 'views/vote.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: 'src/create_crowd_funding.html',
    //   filename: 'views/create_crowd_funding.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: 'src/all_crowd_fundings.html',
    //   filename: 'views/all_crowd_fundings.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: 'src/interact_with_crowd_funding.html',
    //   filename: 'views/interact_with_crowd_funding.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: 'src/create_organization.html',
    //   filename: 'views/create_organization.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: 'src/all_organizations.html',
    //   filename: 'views/all_organizations.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: 'src/interact_with_organization.html',
    //   filename: 'views/interact_with_organization.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: 'src/test.html',
    //   filename: 'views/test.html' 
    // }),

    new HtmlWebpackPlugin({
      template: 'src/Home.html',
      filename: 'views/Home.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/set_session.html',
      filename: 'views/set_session.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/Fundraising.html',
      filename: 'views/Fundraising.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/Vote.html',
      filename: 'views/Vote.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/Active_Campaigns.html',
      filename: 'views/Active_Campaigns.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/Create_Organization.html',
      filename: 'views/Create_Organization.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/Active_Organizations.html',
      filename: 'views/Active_Organizations.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/Donate_Organization.html',
      filename: 'views/Donate_Organization.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/Donate_Individual.html',
      filename: 'views/Donate_Individual.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/Interact_Fundraising.html',
      filename: 'views/Interact_Fundraising.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/Organization_Dashboard.html',
      filename: 'views/Organization_Dashboard.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/Zakat.html',
      filename: 'views/Zakat.html'
    }),


    new HtmlWebpackPlugin({
      template: 'src/Upload_Images.html',
      filename: 'views/Upload_Images.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/View_Images.html',
      filename: 'views/View_Images.html'
    }),

    new CopyWebpackPlugin([
      // { 
      //   from: path.resolve(__dirname,"src")+'/styles.css',
      //   to: './views/styles.css',
      //   toType: 'file'
      // },
      { 
        from: path.resolve(__dirname,"src/ext")+'/web3.js',
        to: './ext/web3.js',
        toType: 'file'
      },

      { 
        from: path.resolve(__dirname,"src/ext")+'/web3.min.js',
        to: './ext/web3.min.js',
        toType: 'file'
      },
      { 
        from: path.resolve(__dirname,"src/ext")+'/web3.min.js.map',
        to: './ext/web3.min.js.map',
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
      },
      { 
        from: path.resolve(__dirname,"src")+'/head.ejs',
        to: './views/head.ejs',
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
