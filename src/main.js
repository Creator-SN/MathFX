import store from "@/store";

try {
    if (MathJax) {
        store.commit('readyMathJax', MathJax)
    } else {
        document.getElementById("math-script").onload = () => {
            store.commit('readyMathJax', MathJax)
        }
    }
}
catch {
    document.getElementById("math-script").onload = () => {
        store.commit('readyMathJax', MathJax)
    }
}

import { execFile } from "child_process"
import path from 'path'
import fs from 'fs'
import ini from "ini"
// 修改默认配置,确保用户无感知
let config_ini = path.join(
    __static,
    "../Snipaste/config.ini"
);
let config = {
    General: {
        language: "en",
        startup_fix: 2,
        hide_tray_icon: true,
    },
    Snip: {
        ask_for_confirm_on_esc: false
    }
}

fs.writeFileSync(config_ini, ini.stringify(config));
// 首次启动
execFile(path.join(__static, "../Snipaste/Snipaste.exe"))

import Vue from 'vue'
import App from './App.vue'

import router from "@/router";


import VueFluent from "vfluentdesign";
import "vfluentdesign/lib/index.css";
import "@/style/global.scss";
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios, axios)

Vue.use(VueFluent);

Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app')
