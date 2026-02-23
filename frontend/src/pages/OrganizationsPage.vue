<script setup lang="ts">
import { ref, onMounted } from "vue";
import { organizationsAPI as orgAPI } from "../api/organizations";
import { useRouter } from "vue-router";

const router = useRouter();
const organizations = ref<any[]>([]);
const name = ref("");
const isLoading = ref(false);
const error = ref<string | null>(null);


const loadOrganizations = async () => {
  organizations.value = await orgAPI.getMyOrganizations();
};

const handleCreate = async () => {
  if (isLoading.value) return;
  try {
    error.value = null;
    isLoading.value = true;

    if (!name.value.trim()) return;

    const newOrg = await orgAPI.createOrganization(name.value);
    organizations.value.unshift(newOrg);
    name.value = "";

    await router.push(`/organizations/${newOrg.id}`);
  } catch (e: any) {
    error.value = e.message;
  } finally {
    isLoading.value = false;
  }
};
onMounted(loadOrganizations);

</script>

<template>
  <section>
    <h1>Organizations</h1>

    <div>
      <input v-model="name" placeholder="Organization name" />
      <button @click="handleCreate">Create</button>
    </div>

    <div>
      <article
          v-for="org in organizations"
          :key="org.id"
          @click="router.push(`/organizations/${org.id}`)"
      >
        <h2>{{ org.name }}</h2>
      </article>
    </div>
  </section>
</template>