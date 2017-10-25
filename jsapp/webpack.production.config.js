var webpack = require('webpack');
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
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
        path: __dirname + '/../www/assets',
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
        new webpack.optimize.CommonsChunkPlugin({name: "react", filename: "js/react.15.4.1.bundle.js"}),

        new HtmlWebpackPlugin({
            filename: '../index.html',
            template: './index.html',
            inject: true,
            chunks: ['react', 'index'],
            minify: {
                removeComments: true,
                collapseWhitespace: true
            }
        }),


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
