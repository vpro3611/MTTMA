import { authStore } from "../stores/auth_store";

export async function authorizedFetch(
    url: string,
    options: RequestInit = {}
) {
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {})
    };

    if (authStore.accessToken) {
        headers.Authorization = `Bearer ${authStore.accessToken}`;
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: "include"
    });
}