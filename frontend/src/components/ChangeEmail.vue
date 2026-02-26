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
  <form class="modern-form" @submit.prevent="handleSubmit">
    <h3 class="modern-form__title">Change email</h3>

    <label class="modern-form__field">
      <span class="modern-form__label">New email</span>
      <input v-model="email" type="email" placeholder="you@example.com" />
    </label>

    <button :disabled="isLoading">
      {{ isLoading ? 'Saving…' : 'Change email' }}
    </button>

    <p v-if="error" class="modern-form__error">{{ error }}</p>
  </form>
</template>

<style scoped>

</style>