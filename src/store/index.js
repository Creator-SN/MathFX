import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        mathjax: undefined,
        theme: 'light'
    },
    mutations: {
        readyMathJax(state, mathjax) {
            state.mathjax = mathjax
        },
        toggleTheme(state) {
            if (state.theme == 'light') {
                state.theme = 'dark'
            } else {
                state.theme = 'light'
            }
        }
    },
    actions: {},
    modules: {

    }
});