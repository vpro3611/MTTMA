<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed, watchEffect } from "vue";
import { userAPI } from "../api/user";
import { authStore } from "../stores/auth_store";

import ChangeEmail from "../components/ChangeEmail.vue";
import ChangePassword from "../components/ChangePassword.vue";
import Logout from "../components/Logout.vue";

const route = useRoute();

const remoteProfile = ref<any>(null);
const error = ref<string | null>(null);
const isLoading = ref(false);

const isOwnProfile = computed(() => {
  return authStore.user?.id === route.params.id;
});

const profile = computed(() => {
  return isOwnProfile.value
      ? authStore.user
      : remoteProfile.value;
});

/*
  watchEffect автоматически:
  - ждёт реактивные зависимости
  - перезапускается при изменении route или store
*/
watchEffect(async () => {
  if (authStore.isBootstrapping) return;
  if (!route.params.id) return;

  if (isOwnProfile.value) {
    remoteProfile.value = null;
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;

    remoteProfile.value = await userAPI.getProfile(
        route.params.id as string
    );
  } catch (e: any) {
    error.value = e.message;
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div v-if="error">
    {{ error }}
  </div>

  <div v-else-if="isLoading">
    Loading...
  </div>

  <div v-else-if="profile">
    <h1>{{ profile.email }}</h1>
    <p>Status: {{ profile.status }}</p>

    <!-- Только для своего профиля -->
    <div v-if="isOwnProfile">
      <h2>Change email</h2>
      <ChangeEmail />

      <h2>Change password</h2>
      <ChangePassword />

      <Logout />
    </div>
  </div>

  <div v-else>
    Loading...
  </div>
</template>