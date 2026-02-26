<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { organizationsAPI as orgAPI } from "../api/organizations";
import { errorMessage } from "../utils/errorMessage";
import type { OrganizationType } from "../types/org_types";

const route = useRoute();
const router = useRouter();

const orgId = route.params.orgId as string;

const organization = ref<OrganizationType | null>(null);

const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    organization.value = await orgAPI.getById(orgId);
  } catch (e: unknown) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
});

const goBack = () => {
  router.back();
};
</script>

<template>
  <section style="padding:20px;">

    <div v-if="loading">
      Loading organization...
    </div>

    <div v-else-if="error" style="color:red;">
      {{ error }}
    </div>

    <div v-else-if="organization">

      <h2>{{ organization.name }}</h2>

      <p>
        <strong>Created At:</strong>
        {{ new Date(organization.createdAt).toLocaleString() }}
      </p>

      <hr />

      <button @click="goBack">
        Back
      </button>

    </div>

  </section>
</template>