<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { organizationsAPI as orgAPI } from "../api/organizations";

const route = useRoute();
const router = useRouter();

const orgId = route.params.orgId as string;
const memberId = route.params.targetUserId as string;

const member = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    member.value = await orgAPI.getMemberById(orgId, memberId);
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

const goBack = () => {
  router.push(`/organizations/${orgId}`);
};
</script>

<template>
  <section v-if="loading">
    Loading member...
  </section>

  <section v-else-if="error">
    {{ error }}
  </section>

  <section v-else-if="member">

    <h2>Member Profile</h2>

    <p><strong>User ID:</strong> {{ member.userId }}</p>
    <p><strong>Role:</strong> {{ member.role }}</p>
    <p><strong>Joined At:</strong> {{ member.joinedAt }}</p>

    <button @click="goBack">
      Back to Organization
    </button>

  </section>
</template>