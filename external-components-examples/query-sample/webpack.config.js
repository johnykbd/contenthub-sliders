const path = require("path");

module.exports = {
    mode: "production",
    entry: "./index.tsx",
    target: ["web", "es2020"],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        fallback: { https: false }
    },
    devtool: "source-map",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
        library: {
            type: "module",
        },
    },
    experiments: { outputModule: true },
    devServer: {
        static: path.join(__dirname, "dist"),
        compress: true,
        port: 4000,
    },
    optimization: {
        minimize: true,
    },
};
