// webpack.config.js
const path = require('path');

module.exports = {
    entry: './client/scripts.js',  // Adjust the entry point based on your project structure
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),  // Adjust the output path as needed
    },
};
