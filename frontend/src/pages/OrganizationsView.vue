<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { organizationsAPI as orgAPI } from "../api/organizations";
import type { OrganizationWithRole } from "../types/org_types";
import type { MemberType } from "../types/member_types";
import { errorMessage } from "../utils/errorMessage";

const route = useRoute();
const router = useRouter();

const orgId = route.params.orgId as string;

const org = ref<OrganizationWithRole | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// ---------------- RENAME ----------------
const isEditing = ref(false);
const newName = ref("");
const renameLoading = ref(false);
const renameError = ref<string | null>(null);

// ---------------- DELETE ----------------
const deleteLoading = ref(false);
const deleteError = ref<string | null>(null);

// ---------------- MEMBERS ----------------
const showMembers = ref(false);
const members = ref<MemberType[]>([]);
const membersLoading = ref(false);
const membersError = ref<string | null>(null);

// ---------------- CREATE TASK ----------------
const isCreatingTask = ref(false);
const taskTitle = ref("");
const taskDescription = ref("");
const assignedTo = ref<string | undefined>(undefined);
const taskLoading = ref(false);
const taskError = ref<string | null>(null);

// ---------------- LOAD ORG ----------------
onMounted(async () => {
  try {
    org.value = await orgAPI.getOrganizationWithRole(orgId);
  } catch (e: unknown) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
});

// ---------------- PERMISSIONS ----------------
const canRename = computed(() => org.value?.role === "OWNER");
const canDelete = computed(() => org.value?.role === "OWNER");

const canAssignOthers = computed(() => {
  return (
      org.value?.role === "OWNER" ||
      org.value?.role === "ADMIN"
  );
});

// ---------------- MEMBERS ----------------
const loadMembers = async () => {
  try {
    membersLoading.value = true;
    membersError.value = null;

    members.value = await orgAPI.getAllMembers(orgId);
  } catch (e: unknown) {
    membersError.value = errorMessage(e);
  } finally {
    membersLoading.value = false;
  }
};

const toggleMembers = async () => {
  showMembers.value = !showMembers.value;

  if (showMembers.value && members.value.length === 0) {
    await loadMembers();
  }
};

// переход на профиль участника

const goToMemberProfile = (userId: string) => {
  router.push(`/organizations/${orgId}/members/${userId}/view`);
};

// ---------------- FILTER FOR DROPDOWN ----------------
const assignableMembers = computed(() => {
  if (!org.value) return [];

  if (org.value.role === "OWNER") {
    return members.value;
  }

  if (org.value.role === "ADMIN") {
    return members.value.filter(m => m.role === "MEMBER");
  }

  return [];
});

// ---------------- RENAME ----------------
const startEditing = () => {
  if (!org.value) return;
  newName.value = org.value.name;
  isEditing.value = true;
};

const handleRename = async () => {
  if (!org.value || !newName.value.trim() || newName.value === org.value.name) return;

  try {
    renameLoading.value = true;
    renameError.value = null;

    const updated = await orgAPI.renameOrganization(orgId, newName.value);
    if (org.value) org.value.name = updated.name;

    isEditing.value = false;
  } catch (e: unknown) {
    renameError.value = errorMessage(e);
  } finally {
    renameLoading.value = false;
  }
};

// ---------------- DELETE ----------------
const handleDelete = async () => {
  const confirmed = confirm(
      "Are you sure you want to delete this organization?"
  );
  if (!confirmed) return;

  try {
    deleteLoading.value = true;
    deleteError.value = null;

    await orgAPI.deleteOrganization(orgId);
    router.push("/organizations");
  } catch (e: unknown) {
    deleteError.value = errorMessage(e);
  } finally {
    deleteLoading.value = false;
  }
};

// ---------------- CREATE TASK ----------------
const startCreateTask = async () => {
  taskTitle.value = "";
  taskDescription.value = "";
  assignedTo.value = undefined;
  taskError.value = null;
  isCreatingTask.value = true;

  // чтобы dropdown был заполнен
  if (members.value.length === 0) {
    await loadMembers();
  }
};

const handleCreateTask = async () => {
  if (!taskTitle.value.trim() || !taskDescription.value.trim()) return;

  try {
    taskLoading.value = true;
    taskError.value = null;

    await orgAPI.createTask(
        orgId,
        taskTitle.value,
        taskDescription.value,
        assignedTo.value
    );

    isCreatingTask.value = false;
  } catch (e: unknown) {
    taskError.value = errorMessage(e);
  } finally {
    taskLoading.value = false;
  }
};
</script>

<template>
  <section v-if="loading">Loading...</section>

  <section v-else-if="error">
    {{ error }}
  </section>

  <section v-else-if="org">

    <h1>{{ org.name }}</h1>

    <!-- RENAME -->
    <button v-if="canRename" @click="startEditing">
      Rename
    </button>

    <div v-if="isEditing">
      <input v-model="newName" />
      <button
          @click="handleRename"
          :disabled="
          renameLoading ||
          !newName.trim() ||
          newName === org.name
        "
      >
        Change
      </button>
      <button @click="isEditing = false">Cancel</button>
      <p v-if="renameError">{{ renameError }}</p>
    </div>

    <hr />

    <!-- DELETE -->
    <button
        v-if="canDelete"
        @click="handleDelete"
        :disabled="deleteLoading"
        style="color:red;"
    >
      Delete Organization
    </button>

    <p v-if="deleteError" style="color:red;">
      {{ deleteError }}
    </p>

    <hr />

    <!-- MEMBERS -->
    <button @click="toggleMembers">
      {{ showMembers ? "Hide Members" : "View Members" }}
    </button>

    <div v-if="showMembers">
      <div v-if="membersLoading">Loading members...</div>
      <div v-else-if="membersError">{{ membersError }}</div>

      <ul v-else>
        <li
            v-for="m in members"
            :key="m.userId"
            @click="goToMemberProfile(m.userId)"
            style="cursor:pointer;"
        >
          {{ m.userId }} — {{ m.role }} - {{m.joinedAt}}
        </li>
      </ul>
    </div>

    <hr />

    <!-- CREATE TASK -->
    <button @click="startCreateTask">
      Create Task
    </button>

    <div v-if="isCreatingTask">
      <h3>Create Task</h3>

      <input v-model="taskTitle" placeholder="Title" />
      <textarea v-model="taskDescription" placeholder="Description" />

      <div v-if="canAssignOthers">
        <label>Assign to:</label>
        <select v-model="assignedTo">
          <option :value="undefined">Self</option>

          <option
              v-for="m in assignableMembers"
              :key="m.userId"
              :value="m.userId"
          >
            {{ m.userId }} ({{ m.role }})
          </option>
        </select>
      </div>

      <button
          @click="handleCreateTask"
          :disabled="
          taskLoading ||
          !taskTitle.trim() ||
          !taskDescription.trim()
        "
      >
        Create
      </button>

      <button @click="isCreatingTask = false">Cancel</button>

      <p v-if="taskError" style="color:red;">
        {{ taskError }}
      </p>
    </div>

  </section>
</template>