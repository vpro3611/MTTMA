<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import { organizationsAPI } from "../api/organizations";
import type { InvitationType, InvitationStatus } from "../types/invitation_types";
import { errorMessage } from "../utils/errorMessage";

const route = useRoute();
const orgId = route.params.orgId as string;

const invitations = ref<InvitationType[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// ---------------- FILTER STATE ----------------
const filterInvitedUserId = ref<string | undefined>(undefined);
const filterStatus = ref<InvitationStatus | undefined>(undefined);
const createdFrom = ref<string | undefined>(undefined);
const createdTo = ref<string | undefined>(undefined);

// ---------------- LOAD ----------------
const loadInvitations = async () => {
  try {
    loading.value = true;
    error.value = null;

    invitations.value =
        await organizationsAPI.getAllInvitations(orgId, {
          invited_user_id: filterInvitedUserId.value || undefined,
          status: filterStatus.value || undefined,
          createdFrom: createdFrom.value || undefined,
          createdTo: createdTo.value || undefined,
        });

  } catch (e: unknown) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
};

const applyFilters = async () => {
  await loadInvitations();
};

const resetFilters = async () => {
  filterInvitedUserId.value = undefined;
  filterStatus.value = undefined;
  createdFrom.value = undefined;
  createdTo.value = undefined;
  await loadInvitations();
};

onMounted(loadInvitations);
</script>

<template>
  <section>
    <h1>Organization Invitations</h1>

    <!-- FILTERS -->
    <hr />
    <h3>Filters</h3>

    <div style="margin-bottom:15px;">
      <input
          v-model="filterInvitedUserId"
          placeholder="Invited User ID"
      />

      <select v-model="filterStatus">
        <option :value="undefined">All statuses</option>
        <option value="PENDING">PENDING</option>
        <option value="ACCEPTED">ACCEPTED</option>
        <option value="REJECTED">REJECTED</option>
        <option value="EXPIRED">EXPIRED</option>
        <option value="CANCELED">CANCELED</option>
      </select>

      <input type="date" v-model="createdFrom" />
      <input type="date" v-model="createdTo" />

      <button @click="applyFilters">
        Apply
      </button>

      <button @click="resetFilters">
        Reset
      </button>
    </div>

    <hr />

    <!-- CONTENT -->
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>

    <ul v-else>
      <li v-for="inv in invitations" :key="inv.id" @click="$router.push(`/organizations/${orgId}/invitations/${inv.id}`)"
      style="cursor:pointer; padding:10px; border:1px solid #ccc; margin-bottom:10px;"
      >
        <strong>Status:</strong> {{ inv.status }}
        <br />
        Invited User: {{ inv.invitedUserId }}
        <br />
        Invited By: {{ inv.invitedByUserId }}
        <br />
        Role: {{ inv.role }}
        <br />
        Created: {{ new Date(inv.createdAt).toLocaleString() }}
        <br />
        Expired: {{ new Date(inv.expiredAt).toLocaleString() }}
        <hr />
      </li>
    </ul>
  </section>
</template>