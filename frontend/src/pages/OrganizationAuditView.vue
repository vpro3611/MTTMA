<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { organizationsAPI as orgAPI } from "../api/organizations";
import type { AuditType } from "../types/audit_types";
import type { AuditEventAction } from "../types/audit_types";
import { AuditEventActions } from "../types/audit_types";
import { errorMessage } from "../utils/errorMessage";

const route = useRoute();
const router = useRouter();
const orgId = route.params.orgId as string;

// ---------------- STATE ----------------
const auditEvents = ref<AuditType[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// filters
const action = ref<AuditEventAction | undefined>(undefined);
const actorUserId = ref<string | undefined>(undefined);
const from = ref<string | undefined>(undefined);
const to = ref<string | undefined>(undefined);
const limit = ref(20);
const offset = ref(0);

// enum → array
const actionOptions = Object.values(AuditEventActions);

// ---------------- LOAD ----------------
const loadAudit = async () => {
  try {
    loading.value = true;
    error.value = null;

    auditEvents.value = await orgAPI.getFilteredAuditEvents(orgId, {
      action: action.value,
      actorUserId: actorUserId.value || undefined,
      from: from.value ? new Date(from.value).toISOString() : undefined,
      to: to.value ? new Date(to.value).toISOString() : undefined,
      limit: limit.value,
      offset: offset.value,
    });

  } catch (e: unknown) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
};

const applyFilters = async () => {
  offset.value = 0;
  await loadAudit();
};

const nextPage = async () => {
  offset.value += limit.value;
  await loadAudit();
};

const prevPage = async () => {
  if (offset.value === 0) return;
  offset.value -= limit.value;
  await loadAudit();
};

const goBack = () => {
  router.push(`/organizations/${orgId}`);
};

// initial load
loadAudit();
</script>

<template>
  <section style="padding:20px;">

    <h2>Organization Audit</h2>

    <!-- FILTERS -->
    <div style="margin-bottom:15px; display:flex; gap:10px; flex-wrap:wrap;">

      <!-- ACTION SELECT -->
      <select v-model="action">
        <option :value="undefined">All Actions</option>
        <option
            v-for="a in actionOptions"
            :key="a"
            :value="a"
        >
          {{ a }}
        </option>
      </select>

      <!-- ACTOR -->
      <input
          v-model="actorUserId"
          placeholder="Actor User ID"
      />

      <!-- DATES -->
      <input type="date" v-model="from" />
      <input type="date" v-model="to" />

      <button @click="applyFilters">
        Apply Filters
      </button>

    </div>

    <!-- CONTENT -->
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
        <li
            v-for="a in auditEvents"
            :key="a.id"
            style="margin-bottom:15px;"
        >
          <strong>Action:</strong> {{ a.action }}
          <br />
          <strong>Actor:</strong> {{ a.actorId }}
          <br />
          <strong>Date:</strong>
          {{ new Date(a.createdAt).toLocaleString() }}
          <hr />
        </li>
      </ul>

      <!-- PAGINATION -->
      <div style="margin-top:10px;">
        <button @click="prevPage" :disabled="offset === 0">
          Prev
        </button>

        <button @click="nextPage">
          Next
        </button>
      </div>

    </div>

    <button style="margin-top:20px;" @click="goBack">
      Back to Organization
    </button>

  </section>
</template>