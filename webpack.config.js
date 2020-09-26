const path = require('path');
module.exports = {
	entry: {
		modal: './client/modal.jsx',
		edit: './client/edit.jsx'
    },
	output: {
		path: path.resolve('client/static'),
		filename: '[name].js'
	},
	module : {
		loaders : [
			{test : /\.jsx?/, include : path.resolve('client'), loader : 'babel-loader'}
		]
	}
};