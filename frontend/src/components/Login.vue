<script setup lang="ts">
import {ref} from "vue";
import {authApi} from "../api/auth.ts";
import type {AuthResponse} from "../types/auth_types.ts";
import {authStore} from "../stores/auth_store.ts";
import {useRouter} from "vue-router";

const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const isLoading = ref(false);
const router = useRouter();

const handleSubmit = async () => {
  if (isLoading.value) {
    return;
  }
  try {
    isLoading.value = true;
    error.value = null;

    const data: AuthResponse = await authApi.login(email.value, password.value);
    authStore.setToken(data.accessToken, data.user);
    await router.push(`/profile/${data.user.id}`)
    console.log('success login');
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <h1>Login</h1>
  <form @submit.prevent="handleSubmit">
    <input v-model="email" type="email" placeholder="Email"></input>
    <input v-model="password" type="password" placeholder="Password"></input>

    <button :disabled="isLoading">
      {{isLoading ? 'Loading...' : 'Login'}}
    </button>

    <p v-if="error">{{error}}</p>
  </form>
</template>

<style scoped>

</style>