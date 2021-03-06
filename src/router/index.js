import Vue from "vue";
import VueRouter from "vue-router";

import tool from "./tools";

Vue.use(VueRouter);

const AsyncLoad = tool.AsyncLoad;

const routes = [
    {
        path: "/",
        name: "Home",
        component: () => AsyncLoad(import("@/views/home"))
    },
    {
        path: "/subscription",
        name: "Subscription",
        component: () => AsyncLoad(import("@/views/subscription"))
    },
    {
        path: "/history",
        name: "History",
        component: () => AsyncLoad(import("@/views/history"))
    },
    {
        path: "/settings",
        name: "Settings",
        component: () => AsyncLoad(import("@/views/settings"))
    }
];

const router = new VueRouter({
    mode: "hash",
    base: process.env.BASE_URL,
    routes
});

export default router;