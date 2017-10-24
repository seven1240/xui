var webpack = require('webpack');
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');

var config = {
    entry: {
        "index": ["./src/jsx/index.js", "./src/css/xui.css", "./src/css/dashboard.css"]
    },

    output: {
        path: path.resolve(__dirname, '../www/assets'),
        filename: 'js/jsx/[name].[chunkhash:8].js',
        publicPath: '/assets'
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract(['css-loader'])
            }, {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules)/,
                use: [{loader: "react-hot-loader"}, {loader: 'babel-loader?' + JSON.stringify({
                        plugins: [
                            'transform-runtime',
                            'transform-decorators-legacy'
                        ],
                        presets: ['es2015', 'react', 'stage-0'],
                        env: {
                                production: {
                                    presets: ['react-optimize']
                                }
                        }
                    }
                )}
                ]
            }
        ]
    },

    performance: {
        hints: false
    },

    plugins: [
        new HtmlWebpackPlugin({
            filename: '../index.html',
            template: './index.html',
            inject: true,
            chunks: ['index']
        }),

        new ExtractTextPlugin("css/xui.[contenthash:8].css"),
    ]
};

module.exports = config;
