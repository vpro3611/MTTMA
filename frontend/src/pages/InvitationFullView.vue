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
  <section>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>

    <div v-else-if="invitation">

      <h1>Invitation Details</h1>

      <p><strong>Organization:</strong> {{ invitation.organizationName }}</p>
      <p><strong>Organization ID:</strong> {{ invitation.organizationId }}</p>
      <p><strong>Members Count:</strong> {{ invitation.membersCount }}</p>

      <button @click="goToOrganization(invitation.organizationId)">
        View Organization
      </button>

      <hr />

      <p><strong>Status:</strong> {{ invitation.status }}</p>
      <p><strong>Role:</strong> {{ invitation.role }}</p>
      <p><strong>Invited By:</strong> {{ invitation.invitedByUserId }}</p>

      <p>
        <strong>Created:</strong>
        {{ new Date(invitation.createdAt).toLocaleString() }}
      </p>

      <p>
        <strong>Expires:</strong>
        {{ new Date(invitation.expiredAt).toLocaleString() }}
      </p>

      <hr />

      <!-- ACTION BUTTONS -->
      <div v-if="isPending">

        <button
            @click="handleAccept"
            :disabled="actionLoading"
            style="margin-right:10px; background:green; color:white;"
        >
          Accept
        </button>

        <button
            @click="handleReject"
            :disabled="actionLoading"
            style="background:red; color:white;"
        >
          Reject
        </button>

      </div>

      <p v-if="actionError" style="color:red;">
        {{ actionError }}
      </p>

      <br />

      <button @click="goBack">
        Back
      </button>

    </div>

  </section>
</template>