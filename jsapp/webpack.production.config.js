var webpack = require('webpack');
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var WebpackMd5Hash = require('webpack-md5-hash');
var config = {
    entry: {
        "react": ["react", "react-dom", "react-router", "react-bootstrap", "i18n-react"],
        "index": ["./src/jsx/index.js", "./src/css/xui.css", "./src/css/dashboard.css"]
    },

/*
    resolve: {
        alias: {
            'react': 'react-lite',
            'react-dom': 'react-lite'
        }
    },
*/

    output: {
        path: __dirname + '../www/assets',
        filename: 'js/jsx/[name].[chunkhash:8].js',
        publicPath: '/assets'
    },

    module: {
        loaders: [{
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('css-loader'),
            exclude: /node_modules/
        }, {
            test: /\.(js|jsx)$/,
            loaders: ['react-hot-loader', 'babel-loader?' + JSON.stringify({
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
        new webpack.optimize.CommonsChunkPlugin({name: "react", filename: "js/react.15.4.1.bundle.js"}),

        new HtmlWebpackPlugin({
            filename: '../index.html',
            template: './index.html',
            inject: true,
            chunks: ['react', 'index']
        }),

        new WebpackMd5Hash(),

        new ExtractTextPlugin("./css/xui.[chunkhash:8].css"),

        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),

        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false
            },
        }),
    ],
};

module.exports = config;
