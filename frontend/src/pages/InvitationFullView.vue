<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import type {InvitationViewType} from "../types/invitation_view";
import { errorMessage } from "../utils/errorMessage";
import {userAPI} from "../api/user.ts";

const route = useRoute();
const router = useRouter();

const invId = route.params.invId as string;

const invitation = ref<InvitationViewType | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

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

const goBack = () => {
  router.push("/invitations");
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

      <button @click="goBack">
        Back
      </button>

    </div>

  </section>
</template>