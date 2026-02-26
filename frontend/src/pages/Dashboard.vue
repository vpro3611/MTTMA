<script setup lang="ts">
import { authStore } from "../stores/auth_store";
import { useRouter } from "vue-router";

const router = useRouter();

const goToProfile = () => {
  if (!authStore.user) return;
  router.push(`/profile/${authStore.user.id}`);
};

const goToUsers = () => {
  router.push("/users");
};

const goToOrganizations = () => {
  router.push("/organizations");
};

const goToOrgSearch = () => {
  router.push("/organizations/search");
};

const goToInvitations = () => {
  router.push("/invitations");
};

</script>

<template>
  <section class="dashboard">
    <header>
      <h1>Dashboard</h1>
      <p>Welcome, {{ authStore.user?.email }}</p>
    </header>

    <div class="dashboard-grid">

      <article class="card" @click="goToProfile">
        <h2>My Profile</h2>
        <p>View and edit your profile</p>
      </article>

      <article class="card" @click="goToUsers">
        <h2>Users</h2>
        <p>Browse all users</p>
      </article>

      <article class="card" @click="goToOrganizations">
        <h2>My Organizations</h2>
        <p>Manage your organizations</p>
      </article>

      <article class="card" @click="goToOrgSearch">
        <h2>Search Organizations</h2>
        <p>Find organizations by name, date, or size</p>
      </article>

      <article class="card" @click="goToInvitations">
        <h2>Invitations</h2>
        <p>View your invitations</p>
      </article>

    </div>
  </section>
</template>