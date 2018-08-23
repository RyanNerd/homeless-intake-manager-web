const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const devMode = process.env.NODE_ENV !== 'production';
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// 2 must haves: entry -> output
// The entry point (where app kicks off).
// Also tell it where to output the final bundle file.

// loader - lets you customize the behaviour of webpack when it loads a given file
// (how a file gets transformed when webpack uses it)

// devtool - use a sourcemap to make debugging easier (gives better console logs)

// devServer - use webpack's server that watches and rebuilds. Requires contentBase (the dir to serve)

module.exports = () => {
   /**
    * The babel-polyfill is so async / await will work otherwise you will get the unhelpful error message:
    *      Uncaught ReferenceError: regeneratorRuntime is not defined
    *
    * @see https://stackoverflow.com/questions/33527653/babel-6-regeneratorruntime-is-not-defined
    */
    return {
        entry: ['babel-polyfill', './src/app.tsx'],
        output: {
            path: path.join(__dirname, 'public', 'dist'),
            filename: 'bundle.js'
        },
        module: {
            rules: [{
                loader: 'babel-loader',
                test: /\.js$/,
                exclude: /node_modules/
            }, {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ]
            }, {
                test: /\.(gif|png|jpe?g|svg)$/i,
                loader: 'url-loader'
            },  {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader",
                options: {
                    transpileOnly: false
                }
            }, {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: devMode ? '[name].css' : '[name].[hash].css',
                chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
            }),
            new Dotenv()
        ],
        devtool: devMode ? 'inline-source-map' : 'source-map',
        resolve: {
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: [".ts", ".tsx", ".js", ".json"]
        },
        devServer: {
            contentBase: path.join(__dirname, 'public'),
            historyApiFallback: true,
            publicPath: '/dist/'
        }
    };
};
