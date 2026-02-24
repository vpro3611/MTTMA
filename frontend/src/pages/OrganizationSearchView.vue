<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { organizationsAPI as orgAPI } from "../api/organizations";
import type { OrganizationSearchResult } from "../types/org_search_types";
import { errorMessage } from "../utils/errorMessage";

const router = useRouter();

// ---------------- STATE ----------------
const query = ref("");
const createdFrom = ref<string | undefined>(undefined);
const createdTo = ref<string | undefined>(undefined);
const sortBy = ref<"createdAt" | "membersCount" | undefined>(undefined);
const order = ref<"asc" | "desc" | undefined>(undefined);

const limit = ref(10);
const offset = ref(0);

const results = ref<OrganizationSearchResult[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// ---------------- SEARCH ----------------
const performSearch = async () => {
  if (!query.value.trim()) return;

  try {
    loading.value = true;
    error.value = null;

    results.value = await orgAPI.searchOrganizations({
      query: query.value,
      createdFrom: createdFrom.value
          ? new Date(createdFrom.value).toISOString()
          : undefined,
      createdTo: createdTo.value
          ? new Date(createdTo.value).toISOString()
          : undefined,
      sortBy: sortBy.value,
      order: order.value,
      limit: limit.value,
      offset: offset.value,
    });

  } catch (e: unknown) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
};

// ---------------- PAGINATION ----------------
const nextPage = async () => {
  offset.value += limit.value;
  await performSearch();
};

const prevPage = async () => {
  if (offset.value === 0) return;
  offset.value -= limit.value;
  await performSearch();
};

// ---------------- NAVIGATION ----------------
const goToOrganization = (orgId: string) => {
  router.push(`/organizations/${orgId}`);
};
</script>

<template>
  <section style="padding:20px;">

    <h2>Search Organizations</h2>

    <!-- FILTERS -->
    <div style="margin-bottom:15px;">

      <input
          v-model="query"
          placeholder="Search by name..."
      />

      <input
          type="date"
          v-model="createdFrom"
      />

      <input
          type="date"
          v-model="createdTo"
      />

      <select v-model="sortBy">
        <option :value="undefined">Sort By</option>
        <option value="createdAt">Created At</option>
        <option value="membersCount">Members Count</option>
      </select>

      <select v-model="order">
        <option :value="undefined">Order</option>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>

      <button @click="performSearch">
        Search
      </button>

    </div>

    <!-- RESULTS -->
    <div v-if="loading">Searching...</div>

    <div v-else-if="error" style="color:red;">
      {{ error }}
    </div>

    <div v-else>

      <div
          v-for="org in results"
          :key="org.id"
          @click="goToOrganization(org.id)"
          style="cursor:pointer; padding:10px; border:1px solid #ccc; margin-bottom:10px;"
      >
        <strong>{{ org.name }}</strong>
        <div>
          Created: {{ new Date(org.createdAt).toLocaleString() }}
        </div>
        <div>
          Members: {{ org.membersCount }}
        </div>
      </div>

      <!-- PAGINATION -->
      <div style="margin-top:15px;">
        <button @click="prevPage" :disabled="offset === 0">
          Prev
        </button>

        <button @click="nextPage">
          Next
        </button>
      </div>

    </div>

  </section>
</template>