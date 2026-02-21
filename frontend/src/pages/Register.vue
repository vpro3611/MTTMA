<script setup lang="ts">
import {ref} from "vue";
import {authApi} from "../api/auth.ts";
import {authStore} from "../stores/auth_store.ts";
import type {AuthResponse} from "../types/auth_types.ts";

const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const isLoading = ref(false);

const handleSubmit = async () => {
  if (isLoading.value) {
    return;
  }
  try {
    isLoading.value = true;
    error.value = null;

    const data: AuthResponse = await authApi.register(email.value, password.value);
    authStore.setToken(data.accessToken, data.user);
    console.log('success');
  } catch (e: any) {
    error.value = e.message;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="email" type="email" placeholder="Email"></input>
    <input v-model="password" type="password" placeholder="Password"></input>

    <button :disabled="isLoading">
      {{isLoading ? 'Loading...' : 'Register'}}
    </button>

   <p v-if="error">{{error}}</p>
  </form>
</template>

<style scoped>

</style>