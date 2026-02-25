import { createRouter, createWebHistory } from "vue-router";
import AuthPage from "../pages/AuthPage.vue";
import Profile from "../pages/Profile.vue";
import UserList from "../pages/UserList.vue";
import MainLayout from "../layouts/MainLayout.vue";
import { authStore } from "../stores/auth_store";
import Dashboard from "../pages/Dashboard.vue";
import OrganizationsPage from "../pages/OrganizationsPage.vue";
import OrganizationsView from "../pages/OrganizationsView.vue";
import MemberProfileView from "../pages/MemberProfileView.vue";
import TaskView from "../pages/TaskView.vue";
import OrganizationSearchView from "../pages/OrganizationSearchView.vue";
import PublicOrganizationView from "../pages/PublicOrganizationView.vue";
import OrganizationAuditView from "../pages/OrganizationAuditView.vue";
import OrganizationInvitationsView from "../pages/OrganizationInvitationsView.vue";
import InvitationView from "../pages/InvitationView.vue";

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
            { path: "dashboard", component: Dashboard},
            { path: "organizations", component: OrganizationsPage},
            { path : "organizations/:orgId", component: OrganizationsView},
            {
                path: "organizations/:orgId/members/:targetUserId/view",
                component: MemberProfileView,
            },
            {
                path: "/organizations/:orgId/tasks/:taskId",
                component: TaskView,
            },
            {
                path: "/organizations/search",
                component: OrganizationSearchView,
            },
            {
                path: "/organizations/view/:orgId",
                component: PublicOrganizationView,
            },
            {
                path: "organizations/:orgId/audit",
                component: OrganizationAuditView,
            },
            {
                path: "/organizations/:orgId/invitations",
                name: "organization-invitations",
                component: OrganizationInvitationsView,
            },
            {
                path: "/organizations/:orgId/invitations/:invId",
                component: InvitationView,
            },
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