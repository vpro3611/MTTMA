<script setup lang="ts">
import { useRouter } from "vue-router";
import { authStore } from "../stores/auth_store";

const router = useRouter();

const goToProfile = () => {
  if (authStore.user) {
    router.push(`/profile/${authStore.user.id}`);
  }
};

const goToUsers = () => {
  router.push("/users");
};

const goToOrgSearch = () => {
  router.push("/organizations/search");
};
</script>

<template>
  <nav style="display:flex; justify-content:space-between; padding:10px;">

    <div>
      <button @click="goToProfile">My Profile</button>
      <button @click="goToUsers">Users</button>
      <button @click="goToOrgSearch">Search Organizations</button>
    </div>

    <div>
      <span v-if="authStore.user">
        {{ authStore.user.email }}
      </span>
    </div>

  </nav>
</template>