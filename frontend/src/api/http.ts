import {authStore} from "../stores/auth_store.ts";


export async function authorizedFetch(url: string, options: RequestInit = {}) {
    return fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            ...options.headers,
            Authorization: authStore.accessToken ? `Bearer ${authStore.accessToken}` : ""
        }
    });
}