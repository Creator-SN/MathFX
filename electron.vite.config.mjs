import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    main: { plugins: [externalizeDepsPlugin()] },
    preload: { plugins: [externalizeDepsPlugin()] },
    renderer: {
        base: "./",
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@use "@/style/global.scss" as *;`,
                },
            },
        },
        resolve: {
            alias: {
                "@renderer": resolve("src/renderer/src"),
                "@": resolve("src/renderer/src"),
            },
        },
        plugins: [vue()],
    },
});
