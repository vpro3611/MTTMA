import {reactive} from "vue";
import type {User} from "../types/auth_types.ts";


// const accessToken = ref<string | null>(null);
// const user = ref<any>(null);

export const authStore = reactive({
    accessToken: null as string | null,
    user: null as User | null,

    setToken(token: string, userData: User) {
        this.accessToken = token;
        this.user = userData;
    },

    clearToken() {
        this.accessToken = null;
        this.user = null;
    }
})