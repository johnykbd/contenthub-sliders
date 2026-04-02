const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.tsx',
  target: ['web', 'es2020'],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: { https: false, http: false },
  },
  output: {
    filename: 'property-image-slider-original.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'module',
    },
    clean: true,
  },
  experiments: {
    outputModule: true,
  },
  optimization: {
    minimize: true,
  },
};
