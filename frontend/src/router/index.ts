import { createRouter, createWebHistory } from "vue-router";
import AuthPage from "../pages/AuthPage.vue";
import Profile from "../pages/Profile.vue";
import { authStore } from "../stores/auth_store";

const routes = [
    { path: "/", redirect: "/auth" },
    { path: "/auth", component: AuthPage },
    {
        path: "/profile/:id",
        component: Profile,
        meta: { requiresAuth: true }
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
    } else if (to.path === "/auth" && authStore.user) {
        next(`/profile/${authStore.user.id}`);
    } else {
        next();
    }
});