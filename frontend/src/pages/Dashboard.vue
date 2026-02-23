<script setup lang="ts">
import { authStore } from "../stores/auth_store";
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <section class="dashboard">
    <header>
      <h1>Dashboard</h1>
      <p>Welcome, {{ authStore.user?.email }}</p>
    </header>

    <div class="dashboard-grid">
      <article class="card" @click="router.push(`/profile/${authStore.user?.id}`)">
        <h2>My Profile</h2>
        <p>View and edit your profile</p>
      </article>

      <article class="card" @click="router.push('/users')">
        <h2>Users</h2>
        <p>Browse all users</p>
      </article>

      <article
          class="card"
          @click="router.push('/organizations')"
      >
        <h2>Organizations</h2>
        <p>Manage your organizations</p>
      </article>

      <article class="card">
        <h2>Invitations</h2>
        <p>Coming soon</p>
      </article>
    </div>
  </section>
</template>