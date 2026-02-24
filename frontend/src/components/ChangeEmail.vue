<script setup lang="ts">
import { ref } from "vue";
import { userAPI } from "../api/user.ts";
import { authStore } from "../stores/auth_store.ts";
import type { User } from "../types/auth_types.ts";

const email = ref('');
const error = ref<string | null>(null);
const isLoading = ref(false);


const handleSubmit = async () => {
  if (isLoading.value) {
    return;
  }
  try {
    const updatedUser: User  = await userAPI.changeEmail(email.value);
    authStore.setUser(updatedUser);
    console.log('success');
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    isLoading.value = false;
  }
}

</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="email" type="email" placeholder="Your new email: "></input>

    <button :disabled="isLoading">
      {{isLoading ? 'Loading...' : 'Change email'}}
    </button>

    <p v-if="error">{{error}}</p>
  </form>
</template>

<style scoped>

</style>