var path = require("path");

const resolve = url => {
    return path.join(__dirname, url);
};

module.exports = {
    runtimeCompiler: true,
    css: {
        loaderOptions: {
            scss: {
                prependData: `@import "@/style/global.scss";`
            }
        }
    },
    configureWebpack: {
        devServer: {
            watchOptions: {
                ignored: [/node_modules/, /public/],
            }
        },
        resolve: {
            alias: {
                "@": resolve("./src")
            },
            extensions: ["*", ".js", ".vue", ".json"]
        }
    },
    pluginOptions: {    // necessary plugins
        electronBuilder: {
            nodeIntegration: true
        }
    }
};