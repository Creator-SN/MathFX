import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        mathjax: undefined,
        subscriptions: [],
        cur_sub: 0,
        theme: 'light'
    },
    mutations: {
        readyMathJax(state, mathjax) {
            state.mathjax = mathjax
        },
        reviseTheme(state, obj) {
            state.theme = obj.theme;
            obj.v.$db.set('theme', state.theme).write();
        },
        reviseCurSub(state, obj) {
            state.cur_sub = obj.cur_sub;
            obj.v.$db.set('cur_sub', state.cur_sub).write();
        },
        reviseSubscriptions(state, obj) {
            state.subscriptions = obj.subscriptions;
            obj.v.$db.set('subscriptions', state.subscriptions).write();
        },
        toggleTheme(state, v) {
            if (state.theme == 'light') {
                state.theme = 'dark'
            } else {
                state.theme = 'light'
            }
            v.$db.set('theme', state.theme).write();
        }
    },
    actions: {},
    modules: {

    }
});