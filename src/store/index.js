import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        mathjax: undefined,
        subscriptions: [],
        history: [],
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
        addHistory(state, obj) {
            state.history.push(obj.h);
            obj.v.$db.set('history', state.history).write();
        },
        removeHistory(state, obj) {
            state.history.splice(state.history.indexOf(state.history.find(it => it.guid === obj.guid)), 1);
            obj.v.$db.set('history', state.history).write();
        },
        reviseHistory(state, obj) {
            state.history = obj.history;
            obj.v.$db.set('history', state.history).write();
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