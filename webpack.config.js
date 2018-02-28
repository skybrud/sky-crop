const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const merge = require('webpack-merge');
const path = require('path');

const name = 'SkyCrop';

const config = {
	output: {
		path: path.resolve(__dirname + '/dist/'),
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				include: __dirname,
				exclude: /node_modules/,
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					preserveWhitespace: false,
					postcss: [
						require('autoprefixer')(),
					],
					loaders: {
						css: 'vue-style-loader!css-loader!sass-loader',
					},
				},
			},
		],
	},
	plugins: [
		new UglifyJsPlugin({
			sourceMap: false,
			uglifyOptions: {
				mangle: true,
				compress: {
					warnings: false,
				},
			},
		}),
	],
};

module.exports = [
	merge(config, {
		entry: path.resolve(__dirname + '/src/plugin.js'),
		output: {
			filename: name.toLowerCase() + '.min.js',
			libraryTarget: 'window',
			library: name,
		},
	}),
	merge(config, {
		target: 'node',
		entry: path.resolve(__dirname + '/src/' + name + '.vue'),
		output: {
			filename: name.toLowerCase() + '.js',
			libraryTarget: 'umd',
			library: name,
			umdNamedDefine: true,
		},
	}),
];
