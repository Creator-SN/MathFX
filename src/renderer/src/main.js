import db from '@/js/datastore.js'
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from './App.vue'

import router from "@/router";


import VueFluent from "@creatorsn/vfluent3";
import "@creatorsn/vfluent3/style.css";
import axios from 'axios'

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(VueFluent);
app.config.globalProperties.$db = db;
app.config.globalProperties.axios = axios;
app.config.globalProperties.$axios = axios;
app.config.globalProperties.$Go = (str) => router.push(str);
app.config.globalProperties.$Back = () => router.back();
app.config.globalProperties.$Jump = (str) => window.open(str);
app.mount("#app");
