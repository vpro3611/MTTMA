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
  } catch (e: any) {
    error.value = e.message;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="old_password" type="password" placeholder="Your old password: "></input>
    <input v-model="new_password" type="password" placeholder="Your new password: "></input>

    <button :disabled="isLoading">
      {{isLoading ? 'Loading...' : 'Change password'}}
    </button>

    <p v-if="error">{{error}}</p>
  </form>
</template>

<style scoped>

</style>