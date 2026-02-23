<script setup lang="ts">
import { onMounted } from "vue";
import { authStore } from "./stores/auth_store";
import { authApi } from "./api/auth";

onMounted(async () => {
  try {
    const refreshData = await authApi.refresh();

    if (refreshData?.accessToken) {
      authStore.setToken(refreshData.accessToken, null);
      const user = await authApi.me();
      if (!user) {
        authStore.clearToken();
        return;
      }
      authStore.setUser(user);
    }
  } catch (e) {
    authStore.clearToken();
  } finally {
    authStore.finishBootstrapping();
  }
});
</script>

<template>
  <router-view />
</template>