import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
    {
        path: "/",
        name: "Home",
        component: () => import("@/views/home/index.vue")
    },
    {
        path: "/subscription",
        name: "Subscription",
        component: () => import("@/views/subscription/index.vue")
    },
    {
        path: "/history",
        name: "History",
        component: () => import("@/views/history/index.vue")
    },
    {
        path: "/settings",
        name: "Settings",
        component: () => import("@/views/settings/index.vue")
    }
];

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes
});

export default router;
