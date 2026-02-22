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
    <div class="container">

      <header class="page-header">
        <h1>Users</h1>
        <p>Browse all registered users</p>
      </header>

      <div class="users-grid">
        <article
            v-for="user in users"
            :key="user.id"
            class="user-card"
            @click="router.push(`/profile/${user.id}`)"
        >
          <div class="card-content">
            <div class="card-main">
              <h2 class="user-email">{{ user.email }}</h2>
              <p class="user-status">
                Status: {{ user.status }}
              </p>
            </div>

            <div class="card-meta">
              <span class="joined-date">
                Joined:
                {{ new Date(user.created_at).toLocaleDateString() }}
              </span>
            </div>
          </div>
        </article>
      </div>

      <footer class="users-footer">
        <div v-if="isLoading" class="loading">
          Loading more users...
        </div>

        <div v-if="!hasMore" class="end">
          No more users
        </div>
      </footer>

    </div>
  </section>
</template>