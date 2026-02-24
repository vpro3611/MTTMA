<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { organizationsAPI as orgAPI } from "../api/organizations";
import type { AuditType } from "../types/audit_types";
import { errorMessage } from "../utils/errorMessage";

const route = useRoute();
const router = useRouter();
const orgId = route.params.orgId as string;

const auditEvents = ref<AuditType[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    auditEvents.value = await orgAPI.getAllAuditEvents(orgId);
  } catch (e: unknown) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
});

const goBack = () => {
  router.push(`/organizations/${orgId}`);
};
</script>

<template>
  <section style="padding:20px;">

    <h2>Organization Audit</h2>

    <div v-if="loading">
      Loading audit...
    </div>

    <div v-else-if="error" style="color:red;">
      {{ error }}
    </div>

    <div v-else>

      <div v-if="auditEvents.length === 0">
        No audit events found.
      </div>

      <ul v-else>
        <li v-for="a in auditEvents" :key="a.id" style="margin-bottom:15px;">
          <strong>Action:</strong> {{ a.action }}
          <br />
          <strong>Actor:</strong> {{ a.actorId }}
          <br />
          <strong>Date:</strong>
          {{ new Date(a.createdAt).toLocaleString() }}
          <hr />
        </li>
      </ul>

    </div>

    <button @click="goBack">
      Back to Organization
    </button>

  </section>
</template>