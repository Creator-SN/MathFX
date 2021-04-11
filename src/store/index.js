import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        mathjax: undefined,
        mathjax_ready: false,
        handlerScan: false,
        subscriptions: [],
        history: [],
        cur_sub: 0,
        cur_h: 0,
        i18n: {},
        language: 'en',
        theme: 'light'
    },
    mutations: {
        readyMathJax(state, mathjax) {
            state.mathjax = mathjax
            mathjax.Hub.Config({
                extensions: ["tex2jax.js", "toMathML.js"],
                jax: ["input/TeX", "output/SVG"],
                tex2jax: {
                    inlineMath: [
                        ["$", "$"],
                        ["\\(", "\\)"],
                    ],
                    displayMath: [
                        ["$$", "$$"],
                        ["\\[", "\\]"],
                    ],
                    processEscapes: true,
                },
                SVG: {
                    useGlobalCache: false
                }
            });
            // 判断扩展是否加载完毕
            mathjax.Callback.Queue(
                ["Require", mathjax.Ajax, "[MathJax]/extensions/tex2jax.js"],
                ["Require", mathjax.Ajax, "[MathJax]/extensions/toMathML.js"],
                [() => {
                    state.mathjax_ready = true
                }]
            )
        },
        triggerHandlerScan(state, msg) {
            state.handlerScan = msg;
        },
        reviseLanguage(state, obj) {
            state.language = obj.language;
            obj.v.$db.set('language', state.language).write();
        },
        reviseTheme(state, obj) {
            state.theme = obj.theme;
            obj.v.$db.set('theme', state.theme).write();
        },
        reviseCurSub(state, obj) {
            state.cur_sub = obj.cur_sub;
            obj.v.$db.set('cur_sub', state.cur_sub).write();
        },
        reviseCurH(state, obj) {
            state.cur_h = obj.cur_h;
            obj.v.$db.set('cur_h', state.cur_h).write();
        },
        reviseSubscriptions(state, obj) {
            state.subscriptions = obj.subscriptions;
            obj.v.$db.set('subscriptions', state.subscriptions).write();
        },
        addHistory(state, obj) {
            state.history.unshift(obj.h);
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
        reviseI18N(state, i18n) {
            state.i18n = i18n
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
    getters: {
        local: state => text => {
            let result = state.i18n[text];
            if(!result)
                return text;
            return result[state.language];
        }
    },
    modules: {

    }
});