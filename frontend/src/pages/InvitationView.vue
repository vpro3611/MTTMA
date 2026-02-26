<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { organizationsAPI as orgAPI } from "../api/organizations";
import type { InvitationType } from "../types/invitation_types";
import { errorMessage } from "../utils/errorMessage";

const route = useRoute();
const router = useRouter();

const orgId = route.params.orgId as string;
const invId = route.params.invId as string;

const invitation = ref<InvitationType | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const cancelLoading = ref(false);
const cancelError = ref<string | null>(null);

const isPending = computed(() => {
  return invitation.value?.status === "PENDING";
});

const loadInvitation = async () => {
  try {
    loading.value = true;
    error.value = null;

    invitation.value =
        await orgAPI.getInvitationById(orgId, invId);

  } catch (e: unknown) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
};

const handleCancel = async () => {
  if (!invitation.value) return;

  try {
    cancelLoading.value = true;
    cancelError.value = null;

    invitation.value =
        await orgAPI.cancelInvitation(invitation.value.id);

  } catch (e: unknown) {
    cancelError.value = errorMessage(e);
  } finally {
    cancelLoading.value = false;
  }
};

const goBack = () => {
  router.push(`/organizations/${orgId}/invitations`);
};

onMounted(loadInvitation);
</script>

<template>
  <section>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>

    <div v-else-if="invitation">

      <h2>Invitation Details</h2>

      <p><strong>ID:</strong> {{ invitation.id }}</p>
      <p><strong>Status:</strong> {{ invitation.status }}</p>
      <p><strong>Invited User:</strong> {{ invitation.invitedUserId }}</p>
      <p><strong>Invited By:</strong> {{ invitation.invitedByUserId }}</p>
      <p><strong>Role:</strong> {{ invitation.role }}</p>
      <p><strong>Created:</strong>
        {{ new Date(invitation.createdAt).toLocaleString() }}
      </p>
      <p><strong>Expires:</strong>
        {{ new Date(invitation.expiredAt).toLocaleString() }}
      </p>

      <hr />

      <button
          v-if="isPending"
          @click="handleCancel"
          :disabled="cancelLoading"
          style="color:red;"
      >
        Cancel Invitation
      </button>

      <p v-if="cancelError" style="color:red;">
        {{ cancelError }}
      </p>

      <br />

      <button @click="goBack">
        Back
      </button>

    </div>

  </section>
</template>