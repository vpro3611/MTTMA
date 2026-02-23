import {UrlConfig} from "../config.ts";
import {authorizedFetch} from "./http.ts";
import type {OrganizationType} from "../types/org_types.ts";


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
    }
}