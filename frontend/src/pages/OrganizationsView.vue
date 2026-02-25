<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { organizationsAPI as orgAPI } from "../api/organizations";
import type { OrganizationWithRole } from "../types/org_types";
import type { MemberType } from "../types/member_types";
import type { TaskType } from "../types/task_types";
import { errorMessage } from "../utils/errorMessage";

const route = useRoute();
const router = useRouter();
const orgId = route.params.orgId as string;

const org = ref<OrganizationWithRole | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// ---------------- TASKS ----------------
const tasks = ref<TaskType[]>([]);
const tasksLoading = ref(false);
const tasksError = ref<string | null>(null);

// FILTER STATE
const filterTitle = ref("");
const filterDescription = ref("");
const filterStatus = ref<"TODO" |  "COMPLETED" | "IN_PROGRESS" | "CANCELED" | undefined>(undefined);
const createdFrom = ref<string | undefined>(undefined);
const createdTo = ref<string | undefined>(undefined);

const limit = ref(20);
const offset = ref(0);

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

// ---------------- LOAD TASKS ----------------
const loadTasks = async () => {
  try {
    tasksLoading.value = true;
    tasksError.value = null;

    tasks.value = await orgAPI.listTasks(orgId, {
      title: filterTitle.value || undefined,
      description: filterDescription.value || undefined,
      status: filterStatus.value || undefined,
      createdFrom: createdFrom.value || undefined,
      createdTo: createdTo.value || undefined,
      limit: limit.value,
      offset: offset.value
    });

  } catch (e: unknown) {
    tasksError.value = errorMessage(e);
  } finally {
    tasksLoading.value = false;
  }
};

const applyFilters = async () => {
  offset.value = 0;
  await loadTasks();
};

const nextPage = async () => {
  offset.value += limit.value;
  await loadTasks();
};

const prevPage = async () => {
  if (offset.value === 0) return;
  offset.value -= limit.value;
  await loadTasks();
};

// ---------------- LOAD ORG ----------------
onMounted(async () => {
  try {
    org.value = await orgAPI.getOrganizationWithRole(orgId);
    await loadTasks();
  } catch (e: unknown) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
});

// ---------------- PERMISSIONS ----------------
const canRename = computed(() => org.value?.role === "OWNER");
const canDelete = computed(() => org.value?.role === "OWNER");

const canAssignOthers = computed(() =>
    org.value?.role === "OWNER" || org.value?.role === "ADMIN"
);

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

const goToMemberProfile = (userId: string) => {
  router.push(`/organizations/${orgId}/members/${userId}/view`);
};

const assignableMembers = computed(() => {
  if (!org.value) return [];
  if (org.value.role === "OWNER") return members.value;
  if (org.value.role === "ADMIN")
    return members.value.filter(m => m.role === "MEMBER");
  return [];
});

// ---------------- RENAME ----------------
const startEditing = () => {
  if (!org.value) return;
  newName.value = org.value.name;
  isEditing.value = true;
};

const handleRename = async () => {
  if (!org.value || !newName.value.trim() || newName.value === org.value.name)
    return;

  try {
    renameLoading.value = true;
    renameError.value = null;
    const updated = await orgAPI.renameOrganization(orgId, newName.value);
    org.value.name = updated.name;
    isEditing.value = false;
  } catch (e: unknown) {
    renameError.value = errorMessage(e);
  } finally {
    renameLoading.value = false;
  }
};

// ---------------- DELETE ----------------
const handleDelete = async () => {
  if (!confirm("Are you sure you want to delete this organization?")) return;

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
    await loadTasks();
  } catch (e: unknown) {
    taskError.value = errorMessage(e);
  } finally {
    taskLoading.value = false;
  }
};

const goToTask = (taskId: string) => {
  router.push(`/organizations/${orgId}/tasks/${taskId}`);
};

const canViewAudit = computed(() => {
  return org.value?.role === "OWNER" || org.value?.role === "ADMIN";
});

const goToAudit = () => {
  router.push(`/organizations/${orgId}/audit`);
};

const canViewInvitations = computed(() => {
  return org.value?.role === "OWNER" || org.value?.role === "ADMIN";
});

const goToInvitations = () => {
  router.push(`/organizations/${orgId}/invitations`);
};


const canInvite = computed(() => org.value?.role === "OWNER");

const inviteUserId = ref("");
const inviteRole = ref<"ADMIN" | "MEMBER">("MEMBER");
const inviteLoading = ref(false);
const inviteError = ref<string | null>(null);
const inviteSuccess = ref<string | null>(null);


const handleInvite = async () => {
  if (!inviteUserId.value.trim()) return;

  try {
    inviteLoading.value = true;
    inviteError.value = null;
    inviteSuccess.value = null;

    await orgAPI.createInvitation(
        orgId,
        inviteUserId.value.trim(),
        inviteRole.value
    );

    inviteSuccess.value = "Invitation sent successfully";
    inviteUserId.value = "";

  } catch (e: unknown) {
    inviteError.value = errorMessage(e);
  } finally {
    inviteLoading.value = false;
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

    <button
        v-if="canViewAudit"
        @click="goToAudit"
        style="margin-left:15px;"
    >
      View Audit
    </button>

    <button
        v-if="canViewInvitations"
        @click="goToInvitations"
        style="margin-left:15px;"
    >
      View Invitations
    </button>

    <!-- INVITE USER -->
    <div v-if="canInvite">
      <h3>Invite User</h3>

      <input
          v-model="inviteUserId"
          placeholder="User UUID"
      />

      <select v-model="inviteRole">
        <option value="MEMBER">MEMBER</option>
        <option value="ADMIN">ADMIN</option>
      </select>

      <button
          @click="handleInvite"
          :disabled="inviteLoading || !inviteUserId.trim()"
      >
        Invite
      </button>

      <p v-if="inviteError" style="color:red;">
        {{ inviteError }}
      </p>

      <p v-if="inviteSuccess" style="color:green;">
        {{ inviteSuccess }}
      </p>

      <hr />
    </div>

    <!-- RENAME -->
    <button v-if="canRename" @click="startEditing">
      Rename
    </button>

    <div v-if="isEditing">
      <input v-model="newName" />
      <button
          @click="handleRename"
          :disabled="renameLoading || !newName.trim() || newName === org.name"
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
          {{ m.userId }} — {{ m.role }} — {{ m.joinedAt }}
        </li>
      </ul>
    </div>

    <hr />

    <hr />

    <h3>Task Filters</h3>

    <div style="margin-bottom:10px;">
      <input v-model="filterTitle" placeholder="Title" />
      <input v-model="filterDescription" placeholder="Description" />

      <select v-model="filterStatus">
        <option :value="undefined">All statuses</option>
        <option value="TODO">TODO</option>
        <option value="IN_PROGRESS">IN_PROGRESS</option>
        <option value="DONE">DONE</option>
      </select>

      <input type="date" v-model="createdFrom" />
      <input type="date" v-model="createdTo" />

      <button @click="applyFilters">
        Apply
      </button>
    </div>

    <!-- TASK LIST -->
    <h2>Tasks</h2>

    <div v-if="tasksLoading">Loading tasks...</div>
    <div v-else-if="tasksError">{{ tasksError }}</div>

    <ul v-else>
      <li v-for="t in tasks" :key="t.id" @click="goToTask(t.id)" style="cursor:pointer;">
        <strong>{{ t.title }}</strong>
        — {{ t.status }}
        <br />
        {{ t.description }}
        <br />
        Assigned: {{ t.assignedTo }}
        <br />
        Created: {{ new Date(t.createdAt).toLocaleString() }}
        <hr />
      </li>
    </ul>

    <div style="margin-top:10px;">
      <button @click="prevPage" :disabled="offset === 0">
        Prev
      </button>

      <button @click="nextPage">
        Next
      </button>
    </div>

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
          :disabled="taskLoading || !taskTitle.trim() || !taskDescription.trim()"
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