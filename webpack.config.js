var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: __dirname + '/src/index.js',
    externals: {
        'anvoy': {
            root: 'Anvoy',
            commonjs2: 'anvoy',
            commonjs: 'anvoy',
            amd: 'anvoy'
        },
        'redux': {
            root: 'Redux',
            commonjs2: 'redux',
            commonjs: 'redux',
            amd: 'redux'
        }
    },
    output: {
        library: 'AnvoyRedux',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        path: __dirname + '/lib',
        filename: 'anvoy-redux.js'
    },
    resolve: {
        root: path.resolve('./src'),
        extensions: ['', '.js']
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015-loose'],
                    plugins: ["transform-for-of-array"]
                }
            },
            {
                test: /\.js$/,
                loader: "eslint-loader",
                exclude: /node_modules/
            }
        ]
    }
};
