import { defineStore } from "pinia";
import { HandyScreenshotPlugin } from "@/js/paste_plugins.js";
import dataSample from "@/js/data_sample.js";

export const useAppStore = defineStore("app", {
    state: () => ({
        handlerScan: false,
        subscriptions: dataSample.subscriptions,
        history: dataSample.history,
        cur_sub: dataSample.cur_sub,
        cur_h: dataSample.cur_h,
        i18n: {},
        language: dataSample.language,
        theme: dataSample.theme,
        paste_plugin: new HandyScreenshotPlugin(),
    }),
    getters: { local: (state) => (text) => state.i18n[text]?.[state.language] || text },
    actions: {
        triggerHandlerScan(value) { this.handlerScan = value; },
        reviseLanguage({ language, v }) { this.language = language; v.$db.set("language", language).write(); },
        reviseTheme({ theme, v }) { this.theme = theme; v.$db.set("theme", theme).write(); },
        reviseCurSub({ cur_sub, v }) { this.cur_sub = cur_sub; v.$db.set("cur_sub", cur_sub).write(); },
        reviseCurH({ cur_h, v }) { this.cur_h = cur_h; v.$db.set("cur_h", cur_h).write(); },
        reviseSubscriptions({ subscriptions, v }) { this.subscriptions = subscriptions; v.$db.set("subscriptions", subscriptions).write(); },
        addHistory({ h, v }) { this.history.unshift(h); v.$db.set("history", this.history).write(); },
        removeHistory({ guid, v }) {
            const nextHistory = this.history.filter((item) => item.guid !== guid);
            if (nextHistory.length === this.history.length) return;
            this.history = nextHistory;
            if (this.cur_h === guid) {
                this.cur_h = nextHistory[0]?.guid || 0;
                v.$db.set("cur_h", this.cur_h).write();
            }
            v.$db.set("history", nextHistory).write();
        },
        reviseHistory({ history, v }) { this.history = history; v.$db.set("history", history).write(); },
        reviseI18N(i18n) { this.i18n = i18n; },
        toggleTheme(v) { this.theme = this.theme === "light" ? "dark" : "light"; v.$db.set("theme", this.theme).write(); },
    },
});
