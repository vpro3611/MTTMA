<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import type { InvitationViewType } from "../types/invitation_view";
import type { InvitationType } from "../types/invitation_types";
import { errorMessage } from "../utils/errorMessage";
import { userAPI } from "../api/user";

const route = useRoute();
const router = useRouter();

const invId = route.params.invId as string;

const invitation = ref<InvitationViewType | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const actionLoading = ref(false);
const actionError = ref<string | null>(null);

const isPending = computed(() => invitation.value?.status === "PENDING");

// ---------------- LOAD ----------------
const loadInvitation = async () => {
  try {
    loading.value = true;
    error.value = null;

    invitation.value = await userAPI.viewSpecificInvitation(invId);

  } catch (e: unknown) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
};

// ---------------- NAVIGATION ----------------
const goBack = () => {
  router.push("/invitations");
};

const goToOrganization = (orgId: string) => {
  router.push(`/organizations/view/${orgId}`);
};

// ---------------- ACCEPT ----------------
const handleAccept = async () => {
  if (!invitation.value) return;

  try {
    actionLoading.value = true;
    actionError.value = null;

    const updated: InvitationType =
        await userAPI.acceptInvitation(invitation.value.id);

    // обновляем статус локально
    invitation.value.status = updated.status;

  } catch (e: unknown) {
    actionError.value = errorMessage(e);
  } finally {
    actionLoading.value = false;
  }
};

// ---------------- REJECT ----------------
const handleReject = async () => {
  if (!invitation.value) return;

  try {
    actionLoading.value = true;
    actionError.value = null;

    const updated: InvitationType =
        await userAPI.rejectInvitation(invitation.value.id);

    invitation.value.status = updated.status;

  } catch (e: unknown) {
    actionError.value = errorMessage(e);
  } finally {
    actionLoading.value = false;
  }
};

onMounted(loadInvitation);
</script>

<template>
  <section class="container">
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>

    <div v-else-if="invitation">
      <header class="page-header">
        <h1>Invitation Details</h1>
        <p>
          Invitation to {{ invitation.organizationName }} for role
          <strong>{{ invitation.role }}</strong>.
        </p>
      </header>

      <article class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">{{ invitation.organizationName }}</h2>
            <p class="card-subtitle">
              Org ID: <code>{{ invitation.organizationId }}</code>
            </p>
          </div>
          <span
            class="pill"
            :class="{
              'pill--status-pending': invitation.status === 'PENDING',
              'pill--status-accepted': invitation.status === 'ACCEPTED',
              'pill--status-rejected': invitation.status === 'REJECTED',
              'pill--status-expired': invitation.status === 'EXPIRED',
              'pill--status-canceled': invitation.status === 'CANCELED'
            }"
          >
            {{ invitation.status }}
          </span>
        </div>

        <div class="card-row">
          <span>Role: <strong>{{ invitation.role }}</strong></span>
          <span>Invited by: <code>{{ invitation.invitedByUserId }}</code></span>
        </div>
        <div class="card-row">
          <span>
            Created: {{ new Date(invitation.createdAt).toLocaleString() }}
          </span>
          <span>
            Expires: {{ new Date(invitation.expiredAt).toLocaleString() }}
          </span>
        </div>

        <div class="page-actions" style="margin-top:1.5rem;">
          <button
            v-if="isPending"
            @click="handleAccept"
            :disabled="actionLoading"
            style="background:#16a34a;"
          >
            Accept
          </button>
          <button
            v-if="isPending"
            @click="handleReject"
            :disabled="actionLoading"
            style="background:#b91c1c;"
          >
            Reject
          </button>
          <button @click="goToOrganization(invitation.organizationId)">
            View organization
          </button>
        </div>

        <p v-if="actionError" style="color:#fca5a5; margin-top:0.75rem;">
          {{ actionError }}
        </p>
      </article>

      <div style="margin-top:1.5rem;">
        <button @click="goBack">
          Back to invitations
        </button>
      </div>
    </div>
  </section>
</template>