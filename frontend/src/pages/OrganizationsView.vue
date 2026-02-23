<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import { organizationsAPI as orgAPI } from "../api/organizations";

const route = useRoute();
const org = ref<any>(null);

onMounted(async () => {
  org.value = await orgAPI.getById(route.params.orgId as string);
});
</script>

<template>
  <section v-if="org">
    <h1>{{ org.name }}</h1>
  </section>

  <div v-else>
    Loading...
  </div>
</template>