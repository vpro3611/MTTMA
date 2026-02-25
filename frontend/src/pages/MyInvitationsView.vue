<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import type { InvitationType } from "../types/invitation_types";
import { errorMessage } from "../utils/errorMessage";
import {userAPI} from "../api/user.ts";

const router = useRouter();

const invitations = ref<InvitationType[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const pendingInvitations = computed(() =>
    invitations.value.filter(inv => inv.status === "PENDING")
);

const otherInvitations = computed(() =>
    invitations.value.filter(inv => inv.status !== "PENDING")
);

const loadInvitations = async () => {
  try {
    loading.value = true;
    error.value = null;

    invitations.value = await userAPI.viewInvitations();

  } catch (e: unknown) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push("/dashboard");
};

onMounted(loadInvitations);
</script>

<template>
  <section>

    <h1>My Invitations</h1>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>

    <div v-else>

      <!-- Pending -->
      <div v-if="pendingInvitations.length">
        <h2>Pending</h2>
        <ul>
          <li v-for="inv in pendingInvitations" :key="inv.id">
            <strong>Organization:</strong> {{ inv.organizationId }}
            <br />
            <strong>Role:</strong> {{ inv.role }}
            <br />
            <strong>Invited By:</strong> {{ inv.invitedByUserId }}
            <br />
            <strong>Expires:</strong>
            {{ inv.expiredAt ? new Date(inv.expiredAt).toLocaleString() : '—' }}
            <hr />
          </li>
        </ul>
      </div>

      <!-- Other -->
      <div v-if="otherInvitations.length">
        <h2>History</h2>
        <ul>
          <li v-for="inv in otherInvitations" :key="inv.id">
            <strong>Organization:</strong> {{ inv.organizationId }}
            <br />
            <strong>Status:</strong> {{ inv.status }}
            <br />
            <strong>Role:</strong> {{ inv.role }}
            <br />
            <strong>Created:</strong>
            {{ inv.createdAt ? new Date(inv.createdAt).toLocaleString() : '—' }}
            <hr />
          </li>
        </ul>
      </div>

      <div v-if="!invitations.length">
        No invitations found.
      </div>

      <button @click="goBack">
        Back to Dashboard
      </button>

    </div>

  </section>
</template>