<script setup lang="ts">

import {ref} from "vue";
import {authStore} from "../stores/auth_store.ts";

const error = ref<string | null>(null);
const isLoading = ref(false);

const handleLogout = () => {
  if (isLoading.value) {
    return;
  }
  try {
    isLoading.value = true;
    authStore.clearToken();
  } catch (e: any) {
    error.value = e.message;
  } finally {
    isLoading.value = false;
  }
}

</script>

<template>
  <button :disabled="isLoading" @click="handleLogout">
    {{isLoading ? 'Loading...' : 'Logout'}}
  </button>

  <p v-if="error">{{error}}</p>
</template>

<style scoped>

</style>