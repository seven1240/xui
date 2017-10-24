var webpack = require('webpack');
var fs = require('fs');
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var WebpackGitHash = require('webpack-git-hash');
var config = {
    entry: {
        "index": ["./src/jsx/index.js", "./src/css/xui.css"],
    },
    output: {
        path: '../www/assets',
        filename: 'js/jsx/[name].[githash].js'
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
        new ExtractTextPlugin("css/xui.[githash].css"),
        new WebpackGitHash({
            cleanup: true,
            callback: function(versionHash) {
                fs.rename("../www/assets/css/xui.[githash].css", "../www/assets/css/xui." + versionHash + ".css")
                console.log("Changed output.css filename to assets/css/xui." + versionHash + ".css");
                var indexHtml = fs.readFileSync('../www/index.html', 'utf8');
                indexHtml = indexHtml.replace(/assets\/css\/xui\.\[githash]\.css/, "assets\/css\/xui\." + versionHash + ".css");
                fs.writeFileSync('../www/index.html', indexHtml);
            }
        })
    ]
};
module.exports = config;