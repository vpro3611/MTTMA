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

const goToInvitation = (invId: string) => {
  router.push(`/invitations/${invId}/view`);
};

onMounted(loadInvitations);
</script>

<template>
  <section class="container">
    <header class="page-header">
      <h1>My Invitations</h1>
      <p>Review pending organization invitations and your invitation history.</p>
    </header>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>

    <div v-else>
      <!-- Pending -->
      <div v-if="pendingInvitations.length" style="margin-bottom: 2rem;">
        <h2 style="margin-bottom:0.75rem;">Pending</h2>
        <div class="grid-cards">
          <article
            v-for="inv in pendingInvitations"
            :key="inv.id"
            class="card card--clickable"
            @click="goToInvitation(inv.id)"
          >
            <div class="card-header">
              <div>
                <h3 class="card-title">Invitation to {{ inv.organizationId }}</h3>
                <p class="card-subtitle">
                  Expires
                  {{ inv.expiredAt ? new Date(inv.expiredAt).toLocaleString() : "—" }}
                </p>
              </div>
              <span class="pill pill--status-pending">PENDING</span>
            </div>
            <div class="card-row">
              <span>Role: <strong>{{ inv.role }}</strong></span>
              <span>Invited by: <code>{{ inv.invitedByUserId }}</code></span>
            </div>
          </article>
        </div>
      </div>

      <!-- Other -->
      <div v-if="otherInvitations.length">
        <h2 style="margin-bottom:0.75rem;">History</h2>
        <div class="grid-cards">
          <article
            v-for="inv in otherInvitations"
            :key="inv.id"
            class="card"
          >
            <div class="card-header">
              <div>
                <h3 class="card-title">Invitation to {{ inv.organizationId }}</h3>
                <p class="card-subtitle">
                  Created
                  {{ inv.createdAt ? new Date(inv.createdAt).toLocaleString() : "—" }}
                </p>
              </div>
              <span
                class="pill"
                :class="{
                  'pill--status-accepted': inv.status === 'ACCEPTED',
                  'pill--status-rejected': inv.status === 'REJECTED',
                  'pill--status-expired': inv.status === 'EXPIRED',
                  'pill--status-canceled': inv.status === 'CANCELED'
                }"
              >
                {{ inv.status }}
              </span>
            </div>
            <div class="card-row">
              <span>Role: <strong>{{ inv.role }}</strong></span>
              <span>Invited by: <code>{{ inv.invitedByUserId }}</code></span>
            </div>
          </article>
        </div>
      </div>

      <p v-if="!invitations.length" style="margin-top:1.5rem; color:#aaaaaa;">
        You currently have no invitations.
      </p>

      <div style="margin-top:2rem;">
        <button @click="goBack">
          Back to Dashboard
        </button>
      </div>
    </div>
  </section>
</template>