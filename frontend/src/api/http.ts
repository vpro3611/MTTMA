import { authStore } from "../stores/auth_store";

function headersToRecord(init: HeadersInit): Record<string, string> {
    if (init instanceof Headers) {
        const out: Record<string, string> = {};
        init.forEach((v, k) => { out[k] = v; });
        return out;
    }
    if (Array.isArray(init)) {
        return Object.fromEntries(init as [string, string][]);
    }
    return { ...(init as Record<string, string>) };
}

export async function authorizedFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const headers: Record<string, string> = {
        ...(options.headers ? headersToRecord(options.headers) : {})
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