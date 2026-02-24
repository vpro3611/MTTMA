<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { organizationsAPI as orgAPI } from "../api/organizations";
import type { TaskType } from "../types/task_types";
import { errorMessage } from "../utils/errorMessage";
import { authStore } from "../stores/auth_store";

type Role = "OWNER" | "ADMIN" | "MEMBER";
type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";

const route = useRoute();
const router = useRouter();

const orgId = route.params.orgId as string;
const taskId = route.params.taskId as string;

const task = ref<TaskType | null>(null);
const myRole = ref<Role | null>(null);

const loading = ref(true);
const error = ref<string | null>(null);

// -------- EDIT DESCRIPTION --------
const isEditingDesc = ref(false);
const newDesc = ref("");
const editDescLoading = ref(false);
const editDescError = ref<string | null>(null);

// -------- EDIT STATUS --------
const isEditingStatus = ref(false);
const newStatus = ref<TaskStatus | null>(null);
const editStatusLoading = ref(false);
const editStatusError = ref<string | null>(null);

// -------- EDIT TITLE --------
const isEditingTitle = ref(false);
const newTitle = ref("");
const editTitleLoading = ref(false);
const editTitleError = ref<string | null>(null);

// ---------------- LOAD ----------------
onMounted(async () => {
  try {
    const org = await orgAPI.getOrganizationWithRole(orgId);
    myRole.value = org.role;

    task.value = await orgAPI.getTaskById(orgId, taskId);

  } catch (e: unknown) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
});

// ---------------- PERMISSIONS ----------------
const canModify = computed(() => {
  if (!task.value || !myRole.value) return false;

  if (myRole.value === "MEMBER") {
    return task.value.createdBy === authStore.user?.id;
  }

  return myRole.value === "ADMIN" || myRole.value === "OWNER";
});

// ---------------- STATUS RULES (UI-level only) ----------------
const availableStatuses = computed<TaskStatus[]>(() => {
  if (!task.value) return [];

  if (task.value.status === "CANCELED") return [];
  if (task.value.status === "COMPLETED") {
    return ["COMPLETED"]; // backend не даст вернуть в IN_PROGRESS
  }

  return ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELED"];
});

// ---------------- EDIT DESCRIPTION ----------------
const startEditDesc = () => {
  if (!task.value) return;
  newDesc.value = task.value.description;
  isEditingDesc.value = true;
};

const handleSaveDesc = async () => {
  if (!task.value || !newDesc.value.trim()) return;

  try {
    editDescLoading.value = true;
    editDescError.value = null;

    const updated = await orgAPI.changeTaskDescription(
        orgId,
        taskId,
        newDesc.value
    );

    task.value = updated;
    isEditingDesc.value = false;

  } catch (e: unknown) {
    editDescError.value = errorMessage(e);
  } finally {
    editDescLoading.value = false;
  }
};

// ---------------- EDIT STATUS ----------------
const startEditStatus = () => {
  if (!task.value) return;
  newStatus.value = task.value.status as TaskStatus;
  isEditingStatus.value = true;
};

const handleSaveStatus = async () => {
  if (!task.value || !newStatus.value) return;

  try {
    editStatusLoading.value = true;
    editStatusError.value = null;

    const updated = await orgAPI.changeTaskStatus(
        orgId,
        taskId,
        newStatus.value
    );

    task.value = updated;
    isEditingStatus.value = false;

  } catch (e: unknown) {
    editStatusError.value = errorMessage(e);
  } finally {
    editStatusLoading.value = false;
  }
};

const goBack = () => {
  router.push(`/organizations/${orgId}`);
};

// ---------------- EDIT TITLE ----------------
const startEditTitle = () => {
  if (!task.value) return;
  newTitle.value = task.value.title;
  isEditingTitle.value = true;
};

const handleSaveTitle = async () => {
  if (!task.value || !newTitle.value.trim()) return;

  try {
    editTitleLoading.value = true;
    editTitleError.value = null;

    const updated = await orgAPI.changeTaskTitle(
        orgId,
        taskId,
        newTitle.value
    );

    task.value = updated;
    isEditingTitle.value = false;

  } catch (e: unknown) {
    editTitleError.value = errorMessage(e);
  } finally {
    editTitleLoading.value = false;
  }
};


</script>

<template>
  <section v-if="loading">Loading task...</section>

  <section v-else-if="error">
    {{ error }}
  </section>

  <section v-else-if="task">

    <h2>
  <span v-if="!isEditingTitle">
    {{ task.title }}

    <button
        v-if="canModify && task.status !== 'COMPLETED' && task.status !== 'CANCELED'"
        @click="startEditTitle"
        style="margin-left:10px;"
    >
      Edit Title
    </button>
  </span>

      <span v-else>
    <input v-model="newTitle" />

    <button
        @click="handleSaveTitle"
        :disabled="editTitleLoading || !newTitle.trim()"
    >
      Save
    </button>

    <button @click="isEditingTitle = false">
      Cancel
    </button>

    <p v-if="editTitleError" style="color:red;">
      {{ editTitleError }}
    </p>
  </span>
    </h2>

    <!-- STATUS -->
    <div>
      <strong>Status:</strong>

      <span v-if="!isEditingStatus">
        {{ task.status }}
        <button
            v-if="canModify && availableStatuses.length > 0"
            @click="startEditStatus"
        >
          Change Status
        </button>
      </span>

      <div v-else>
        <select v-model="newStatus">
          <option
              v-for="s in availableStatuses"
              :key="s"
              :value="s"
          >
            {{ s }}
          </option>
        </select>

        <button
            @click="handleSaveStatus"
            :disabled="editStatusLoading"
        >
          Save
        </button>

        <button @click="isEditingStatus = false">
          Cancel
        </button>

        <p v-if="editStatusError" style="color:red;">
          {{ editStatusError }}
        </p>
      </div>
    </div>

    <p><strong>Created By:</strong> {{ task.createdBy }}</p>
    <p><strong>Assigned To:</strong> {{ task.assignedTo }}</p>
    <p><strong>Created At:</strong> {{ new Date(task.createdAt).toLocaleString() }}</p>

    <hr />

    <!-- DESCRIPTION -->
    <div v-if="!isEditingDesc">
      <p><strong>Description:</strong></p>
      <p>{{ task.description }}</p>

      <button
          v-if="canModify"
          @click="startEditDesc"
      >
        Edit Description
      </button>
    </div>

    <div v-else>
      <textarea v-model="newDesc" rows="5" cols="50" />

      <br />

      <button
          @click="handleSaveDesc"
          :disabled="editDescLoading || !newDesc.trim()"
      >
        Save
      </button>

      <button @click="isEditingDesc = false">
        Cancel
      </button>

      <p v-if="editDescError" style="color:red;">
        {{ editDescError }}
      </p>
    </div>

    <hr />

    <button @click="goBack">
      Back to Organization
    </button>

  </section>
</template>