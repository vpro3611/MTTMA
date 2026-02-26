<script setup lang="ts">
import { useRouter } from "vue-router";
import { authStore } from "../stores/auth_store";
import { themeStore } from "../stores/theme_store";

const router = useRouter();

const goDashboard = () => router.push("/dashboard");
const goProfile = () => {
  if (authStore.user) router.push(`/profile/${authStore.user.id}`);
};
const goUsers = () => router.push("/users");
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <h2>App</h2>

      <nav>
        <button @click="goDashboard">Dashboard</button>
        <button @click="goProfile">Profile</button>
        <button @click="goUsers">Users</button>
      </nav>

      <div style="margin-top:auto; display:flex; flex-direction:column; gap:0.5rem;">
        <span style="font-size:0.8rem; color:#aaaaaa;">Theme</span>
        <button @click="themeStore.toggle">
          {{ themeStore.current === 'dark' ? 'Switch to black' : 'Switch to dark' }}
        </button>
      </div>
    </aside>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>