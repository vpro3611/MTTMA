<script setup lang="ts">
import { ref, onMounted } from "vue";
import { organizationsAPI as orgAPI } from "../api/organizations";
import { useRouter } from "vue-router";
import type { OrganizationType } from "../types/org_types";
import { errorMessage } from "../utils/errorMessage";

const router = useRouter();
const organizations = ref<OrganizationType[]>([]);
const name = ref("");
const isLoading = ref(false);
const error = ref<string | null>(null);


const loadOrganizations = async () => {
  organizations.value = await orgAPI.getMyOrganizations();
};

const handleCreate = async () => {
  if (isLoading.value) return;
  try {
    error.value = null;
    isLoading.value = true;

    if (!name.value.trim()) return;

    const newOrg = await orgAPI.createOrganization(name.value);
    organizations.value.unshift(newOrg);
    name.value = "";

    await router.push(`/organizations/${newOrg.id}`);
  } catch (e: unknown) {
    error.value = errorMessage(e);
  } finally {
    isLoading.value = false;
  }
};
onMounted(loadOrganizations);

</script>

<template>
  <section class="container">
    <header class="page-header">
      <h1>My Organizations</h1>
      <p>Create and manage organizations where you collaborate with others.</p>
    </header>

    <div class="page-actions">
      <input
        v-model="name"
        placeholder="New organization name"
        style="flex:1; min-width: 220px; padding: 0.6rem 0.8rem; border-radius: 999px; border: 1px solid rgba(255,255,255,0.18); background: rgba(0,0,0,0.35); color: inherit;"
      />
      <button @click="handleCreate" :disabled="isLoading">
        {{ isLoading ? "Creating..." : "Create organization" }}
      </button>
    </div>

    <p v-if="error" style="color:#fca5a5; margin-bottom:1rem;">
      {{ error }}
    </p>

    <div v-if="organizations.length" class="grid-cards">
      <article
        v-for="org in organizations"
        :key="org.id"
        class="card card--clickable"
        @click="router.push(`/organizations/${org.id}`)"
      >
        <div class="card-header">
          <div>
            <h2 class="card-title">{{ org.name }}</h2>
            <p class="card-subtitle">
              Created {{ new Date(org.createdAt).toLocaleDateString() }}
            </p>
          </div>
          <span class="pill pill--soft">ORG</span>
        </div>
      </article>
    </div>

    <p v-else style="margin-top:1.5rem; color:#aaaaaa;">
      You don’t have any organizations yet. Create your first one above.
    </p>
  </section>
</template>