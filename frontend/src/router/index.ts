import { createRouter, createWebHistory } from "vue-router";
import AuthPage from "../pages/AuthPage.vue";
import Profile from "../pages/Profile.vue";
import UserList from "../pages/UserList.vue";
import MainLayout from "../layouts/MainLayout.vue";
import { authStore } from "../stores/auth_store";
import Dashboard from "../pages/Dashboard.vue";

const routes = [
    { path: "/", redirect: "/dashboard" },

    {
        path: "/auth",
        component: AuthPage
    },

    {
        path: "/",
        component: MainLayout,
        meta: { requiresAuth: true },
        children: [
            { path: "profile/:id", component: Profile },
            { path: "users", component: UserList },
            { path: "/dashboard", component: Dashboard}
        ]
    }
];

export const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, _from, next) => {
    if (authStore.isBootstrapping) {
        return next();
    }

    if (to.meta.requiresAuth && !authStore.user) {
        next("/auth");
    } else {
        next();
    }
});