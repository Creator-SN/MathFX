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
      nodeIntegration: true,
      // https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/881
      builderOptions: {
        productName: "MathFX",
        appId: "com.creatorsn.mathfx",
        extraResources: [{
          from: 'node_modules/electron-vue-screen-capture/dist_electron/bundled/',
          to: './screen-capture'
        }],
        win: {
          icon: "./logo.ico"
        },
        mac: {
          icon: './logo.icns',
          target: {
            target: 'dmg',
            arch: [
              'x64',
              'arm64',
              'universal'
            ]
          }
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          createDesktopShortcut: true,
          createStartMenuShortcut: true
        }
      }
    }
  }
};