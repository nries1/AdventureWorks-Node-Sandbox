var HTMLWebpackPlugin = require('html-webpack-plugin');
var HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
    template: __dirname + '/public/query-results.html',
    filename: 'query-results-wp.html',
    inject: 'body'
});
module.exports = {
    entry: __dirname+ '/index.js',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            }
        ]
    },
    output: {
        filename: 'transformed.js',
        path: __dirname+'/dist'
    },
    plugins: [HTMLWebpackPluginConfig]
}