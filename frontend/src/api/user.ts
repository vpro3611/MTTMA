import {authorizedFetch} from "./http.ts";
import {UrlConfig} from "../config.ts";
import type {User} from "../types/auth_types.ts";
import type {InvitationType} from "../types/invitation_types.ts";
import type {InvitationViewType} from "../types/invitation_view.ts";


export const userAPI = {
    async changeEmail(new_email: string): Promise<User> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/api/change_email`, {
            method: "PATCH",
            body: JSON.stringify({new_email}),
            headers: {"Content-Type": "application/json"}
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || "Change email failed");
        }
        return data;
    },
    async changePassword(old_pass: string, new_pass: string): Promise<User> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/api/change_pass`, {
            method: "PATCH",
            body: JSON.stringify({old_pass, new_pass}),
            headers: {"Content-Type": "application/json"}
        })
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Change password failed");
        }
        return data;
    },

    async getProfile(targetUserId: string): Promise<User> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/api/${targetUserId}`);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get a profile");
        }

        return data;
    },

    async getAll(page: number, limit: number): Promise<User[]> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/api/users?page=${page}&limit=${limit}`);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get users");
        }

        return data;
    },

    async viewInvitations(): Promise<InvitationType[]> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/api/invitations`,
            {method: "GET"});

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get invitations");
        }

        return data;
    },

    async viewSpecificInvitation(invitationId: string): Promise<InvitationViewType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/api/invitations/${invitationId}/view`,
            {method: "GET"});

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get invitation");
        }

        return data;
    },

    async acceptInvitation(invitationId: string): Promise<InvitationType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/api/${invitationId}/accept`,
            {method: "PATCH"});

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to accept invitation");
        }

        return data;
    },

    async rejectInvitation(invitationId: string): Promise<InvitationType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/api/${invitationId}/reject`,
            {method: "PATCH"});

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to reject invitation");
        }

        return data;
    },

    async checkMembership(userId: string) {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/api/users/${userId}/membership_check`, {
            method: "GET"
        });

        const data = await res.json();
        // hasOrganizations : boolean

        if (!res.ok) {
            throw new Error(data?.message || "Failed to check membership");
        }

        return data;
    }
}