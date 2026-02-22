<script setup lang="ts">
import { useRouter } from "vue-router";
import { authStore } from "../stores/auth_store";

const router = useRouter();
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <h2>App</h2>

      <nav>
        <button @click="router.push('/dashboard')">Dashboard</button>
        <button @click="router.push(`/profile/${authStore.user?.id}`)">Profile</button>
        <button @click="router.push('/users')">Users</button>
      </nav>
    </aside>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>