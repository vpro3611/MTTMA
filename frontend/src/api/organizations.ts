import {UrlConfig} from "../config.ts";
import {authorizedFetch} from "./http.ts";
import type {OrganizationType, OrganizationWithRole} from "../types/org_types.ts";
import type {TaskType} from "../types/task_types.ts";
import type {MemberType} from "../types/member_types.ts";


export const organizationsAPI = {

    async createOrganization(name: string): Promise<OrganizationType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/create`, {
            method: "POST",
            body: JSON.stringify({name}),
            headers: {"Content-Type": "application/json"}
        })
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to create organization");
        }
        return data;
    },

    async getMyOrganizations(): Promise<OrganizationType[]> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/my_organizations`, {
            method: "GET"
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get organizations");
        }

        return data;
    },

    async getById(orgId: string): Promise<OrganizationType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/api/view/${orgId}`,
            {method: "GET"}
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get organization");
        }

        return data;
    },

    async getOrganizationWithRole(orgId: string): Promise<OrganizationWithRole>{
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/organizations/${orgId}/w_role`,
            {method: "GET"}
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get organization");
        }

        return data;
    },


    async renameOrganization(orgId: string, newName: string): Promise<OrganizationType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/rename`, {
            method: "PATCH",
            body: JSON.stringify({newName}),
            headers: {"Content-Type": "application/json"}
        })
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to rename organization");
        }
        return data;
    },

    async deleteOrganization(orgId: string) {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/delete`, {
            method: "DELETE"
        })

        if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error(data?.message || "Failed to delete organization");
        }
    },

    async createTask(orgId: string, title: string, description: string, assignedTo?: string): Promise<TaskType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/tasks/create`, {
            method: "POST",
            body: JSON.stringify({title, description, assignedTo}),
            headers: {"Content-Type": "application/json"}
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to create task");
        }

        return data;
    },

    async getAllMembers(orgId: string): Promise<MemberType[]> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/members`, {
            method: "GET"
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get members");
        }

        return data;
    },

    async getMemberById(orgId: string, memberId: string): Promise<MemberType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/members/${memberId}/view`, {
            method: "GET"
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get member");
        }

        return data;
    }
}