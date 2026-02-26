import {UrlConfig} from "../config";
import type {AuthResponse, RefreshResponse, User} from "../types/auth_types.ts";
import {authorizedFetch} from "./http.ts";


export const authApi = {
    async register(email: string, password: string): Promise<AuthResponse> {
        const res = await fetch(`${UrlConfig.apiBaseUrl}/pub/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password })
        })

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Registration failed");
        }

        return data;
    },

    async login(email: string, password: string): Promise<AuthResponse> {
        const res = await fetch(`${UrlConfig.apiBaseUrl}/pub/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password })
        })

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Login failed");
        }

        return data;
    },

    async refresh() {
        const res = await fetch(`${UrlConfig.apiBaseUrl}/pub/refresh`, {
            method: "POST",
            credentials: "include"
        })

        const data: RefreshResponse = await res.json();

        if (!res.ok) {
            return null;
        }

        return data;
    },

    async me(): Promise<User | null> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/api/me`);
        if (!res.ok) {
            return null;
        }

        const data: User = await res.json();

        return data;
    }
}