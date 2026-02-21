<script setup lang="ts">

import Register from "./pages/Register.vue";
import Login from "./pages/Login.vue";
import Logout from "./pages/Logout.vue";
import {computed, onMounted} from "vue";
import {authStore} from "./stores/auth_store.ts";
import {authApi} from "./api/auth.ts";

onMounted(async () => {
  const refreshData = await authApi.refresh();
  if (!refreshData?.accessToken) {
    return;
  }
  authStore.accessToken = refreshData.accessToken;

  const user = await authApi.me();
  if (!user) {
    return;
  }
  authStore.user = user;
})

const isAuthenticated = computed(() => !!authStore.user?.email);

</script>

<template>
  <div v-if="!isAuthenticated">
    <h1>Register</h1>
    <Register />

    <h1>Login</h1>
    <Login />
  </div>

  <div v-else>
    <h1>Welcome {{ authStore.user?.email }}</h1>
    <Logout />
  </div>
</template>

<!--<style scoped>-->
<!--.logo {-->
<!--  height: 6em;-->
<!--  padding: 1.5em;-->
<!--  will-change: filter;-->
<!--  transition: filter 300ms;-->
<!--}-->
<!--.logo:hover {-->
<!--  filter: drop-shadow(0 0 2em #646cffaa);-->
<!--}-->
<!--.logo.vue:hover {-->
<!--  filter: drop-shadow(0 0 2em #42b883aa);-->
<!--}-->
<!--</style>-->
