<script setup lang="ts">

import {ref} from "vue";
import {authStore} from "../stores/auth_store.ts";
import {useRouter} from "vue-router";


const router = useRouter();
const error = ref<string | null>(null);
const isLoading = ref(false);

const handleLogout = () => {
  if (isLoading.value) {
    return;
  }
  try {
    isLoading.value = true;
    authStore.clearToken();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    authStore.clearToken();
    router.replace('/auth');
    isLoading.value = false;
  }
}

</script>

<template>
  <button :disabled="isLoading" @click="handleLogout">
    {{isLoading ? 'Loging out...' : 'Logout'}}
  </button>

  <p v-if="error">{{error}}</p>
</template>

<style scoped>

</style>