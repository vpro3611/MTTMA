<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { userAPI } from "../api/user";
import { useRouter } from "vue-router";

const router = useRouter();

const users = ref<any[]>([]);
const page = ref(1);
const limit = 10;
const isLoading = ref(false);
const hasMore = ref(true);

const loadUsers = async () => {
  if (isLoading.value || !hasMore.value) return;

  try {
    isLoading.value = true;

    const newUsers = await userAPI.getAll(page.value, limit);

    if (newUsers.length === 0) {
      hasMore.value = false;
      return;
    }

    users.value.push(...newUsers);
    page.value++;

  } finally {
    isLoading.value = false;
  }
};

const handleScroll = () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const bottom = document.documentElement.offsetHeight - 100;

  if (scrollPosition >= bottom) {
    loadUsers();
  }
};

onMounted(() => {
  loadUsers();
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <section class="users-page">
    <header>
      <h1>Users</h1>
    </header>

    <div class="users-grid">
      <article
          v-for="user in users"
          :key="user.id"
          class="user-card"
          @click="router.push(`/profile/${user.id}`)"
      >
        <header>
          <h2>{{ user.email }}</h2>
        </header>

        <div class="user-meta">
          <p>Status: {{ user.status }}</p>
          <p>Joined: {{ new Date(user.created_at).toLocaleDateString() }}</p>
        </div>
      </article>
    </div>

    <footer class="users-footer">
      <p v-if="isLoading">Loading more users...</p>
      <p v-if="!hasMore">No more users</p>
    </footer>
  </section>
</template>