var webpack = require('webpack');
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var WebpackMd5Hash = require('webpack-md5-hash');
var config = {
    entry: {
        "wechat": ["./src/wechat/index.js"],
        "bus": "./src/wechat/bus.js"
    },

    output: {
        path: '../www/assets',
        // filename: 'js/jsx/[name].[chunkhash:8].js',
        filename: 'js/jsx/[name].0947345e.js',
        publicPath: '/assets'
    },

    module: {
        loaders: [{
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('style-loader', 'css-loader'),
            exclude: /node_modules/
        }, {
            test: /\.(js|jsx)$/,
            loaders: ['react-hot', 'babel?' + JSON.stringify({
                cacheDirectory: true,
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
            })],
            exclude: /node_modules/
        }]
    },

    performance: {
        hints: false
    },

    plugins: [
        new HtmlWebpackPlugin({
            filename: '../../lua/xui/view/wechat/tickets1.html',
            template: './tickets.html',
            inject: true,
            chunks: ['wechat'],
            output: {
                publicPath: '/assets'
            }
        }),

        new HtmlWebpackPlugin({
            filename: '../bus.html',
            template: './bus.html',
            inject: true,
            chunks: ['bus'],
            output: {
                publicPath: '/assets'
            }
        }),

        new WebpackMd5Hash(),
    ]
};

module.exports = config;
