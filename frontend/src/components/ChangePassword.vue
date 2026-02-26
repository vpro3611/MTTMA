<script setup lang="ts">
import {ref} from "vue";
import {userAPI} from "../api/user.ts";
import {authStore} from "../stores/auth_store.ts";
import type {User} from "../types/auth_types.ts";

const old_password = ref('');
const new_password = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);


const handleSubmit = async () => {
  if (isLoading.value) {
    return;
  }
  try {
    isLoading.value = true;
    error.value = null;

    const updatedUser: User = await userAPI.changePassword(old_password.value, new_password.value);
    authStore.user = updatedUser;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <form class="modern-form" @submit.prevent="handleSubmit">
    <h3 class="modern-form__title">Change password</h3>

    <label class="modern-form__field">
      <span class="modern-form__label">Current password</span>
      <input v-model="old_password" type="password" placeholder="••••••••••" />
    </label>

    <label class="modern-form__field">
      <span class="modern-form__label">New password</span>
      <input v-model="new_password" type="password" placeholder="Minimum 10 characters" />
    </label>

    <button :disabled="isLoading">
      {{ isLoading ? 'Saving…' : 'Change password' }}
    </button>

    <p v-if="error" class="modern-form__error">{{ error }}</p>
  </form>
</template>

<style scoped>

</style>