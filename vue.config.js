const webpack = require("webpack");
const {defineConfig} = require('@vue/cli-service');
module.exports = defineConfig({
    transpileDependencies: true,
    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                "windows.jQuery": "jquery"
            })
        ]
    }
})
