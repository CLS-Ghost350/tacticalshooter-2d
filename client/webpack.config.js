const path = require('path');
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
    plugins: [new BundleAnalyzerPlugin()],
    
    resolve: {
        alias: {
            "@": __dirname,
            "@shared": path.resolve(__dirname,"..","shared")
        }
    },

    entry: {
        "home": "./pages/home/index.jsx",
    },

    output: {
        filename: "[name]-bundle.js",
        path: path.resolve(__dirname, "bundles")
    },

    module: {
        rules: [
            {
              test: /\.(js|jsx)$/,
              exclude: /node_modules/,
              use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                            url: false
                        },
                    } 
                ]
            }
        ]
    }
}
