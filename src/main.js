import store from "@/store";

import db from '@/js/datastore.js'

import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'

import router from "@/router";


import VueFluent from "vfluentdesign";
import "vfluentdesign/lib/index.css";
import "@/style/global.scss";
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios, axios)

Vue.use(VueFluent, Vuex);

Vue.config.productionTip = false

Vue.prototype.$db = db;

new Vue({
    router,
    store,
    render: h => h(App),
    beforeCreate() {
        Vue.prototype.$Go = str => {
            this.$router.push(str);
        };
        Vue.prototype.$Back = () => {
            this.$router.back();
        };
        Vue.prototype.$Jump = str => {
            window.open(str);
        };
    },
}).$mount('#app')
