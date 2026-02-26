<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, computed, watch } from "vue";
import { organizationsAPI as orgAPI } from "../api/organizations";
import { authStore } from "../stores/auth_store";
import { errorMessage } from "../utils/errorMessage";

type Role = "MEMBER" | "ADMIN" | "OWNER";
type AssignableRole = Exclude<Role, "OWNER">;

const parseRole = (role: string): Role => {
  if (role === "MEMBER" || role === "ADMIN" || role === "OWNER") {
    return role;
  }
  throw new Error(`Unknown role: ${role}`);
};

const route = useRoute();
const router = useRouter();

const orgId = route.params.orgId as string;
const memberId = route.params.targetUserId as string;

const member = ref<{
  userId: string;
  role: Role;
  joinedAt: string;
} | null>(null);

const myRole = ref<Role | null>(null);

const loading = ref(true);
const error = ref<string | null>(null);

const roleLoading = ref(false);
const roleError = ref<string | null>(null);

const fireLoading = ref(false);
const fireError = ref<string | null>(null);

const selectedRole = ref<AssignableRole | null>(null);

// ---------------- SELF CHECK ----------------
const isSelf = computed(() => {
  return authStore.user?.id === member.value?.userId;
});

// ---------------- LOAD DATA ----------------
onMounted(async () => {
  try {
    const org = await orgAPI.getOrganizationWithRole(orgId);
    myRole.value = parseRole(org.role);

    const data = await orgAPI.getMemberById(orgId, memberId);
    const parsedRole = parseRole(data.role);

    member.value = {
      userId: data.userId,
      role: parsedRole,
      joinedAt: data.joinedAt.toString(),
    };

    // OWNER нельзя выбирать — поэтому только если не OWNER
    selectedRole.value =
        parsedRole === "OWNER" ? null : parsedRole;

  } catch (e: unknown) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
});

// ---------------- ROLE HIERARCHY ----------------
const hierarchy: Role[] = ["MEMBER", "ADMIN", "OWNER"];

const canManage = computed(() => {
  if (!myRole.value || !member.value) return false;
  if (isSelf.value) return false; // нельзя менять себе

  const actorIndex = hierarchy.indexOf(myRole.value);
  const targetIndex = hierarchy.indexOf(member.value.role);

  return actorIndex > targetIndex;
});

const availableRoles = computed<AssignableRole[]>(() => {
  if (!canManage.value || !myRole.value) return [];

  const actorIndex = hierarchy.indexOf(myRole.value);

  return hierarchy
      .filter(
          (role) =>
              role !== "OWNER" &&
              hierarchy.indexOf(role) <= actorIndex
      ) as AssignableRole[];
});

// ---------------- CHANGE ROLE ----------------
watch(selectedRole, async (newRole) => {
  if (!newRole || !member.value) return;
  if (newRole === member.value.role) return;

  try {
    roleLoading.value = true;
    roleError.value = null;

    const updated = await orgAPI.changeMemberRole(
        orgId,
        memberId,
        newRole
    );

    const parsedRole = parseRole(updated.role);

    member.value.role = parsedRole;
    selectedRole.value =
        parsedRole === "OWNER" ? null : parsedRole;

  } catch (e: unknown) {
    roleError.value = errorMessage(e);
    selectedRole.value =
        member.value?.role === "OWNER"
            ? null
            : (member.value?.role as AssignableRole | null);
  } finally {
    roleLoading.value = false;
  }
});

// ---------------- FIRE MEMBER ----------------
const canFire = computed(() => {
  if (!myRole.value || !member.value) return false;

  return myRole.value === "OWNER" && !isSelf.value;
});

const handleFire = async () => {
  const confirmed = confirm(
      "Are you sure you want to remove this member from organization?"
  );
  if (!confirmed) return;

  try {
    fireLoading.value = true;
    fireError.value = null;

    await orgAPI.fireMember(orgId, memberId);

    router.push(`/organizations/${orgId}`);

  } catch (e: unknown) {
    fireError.value = errorMessage(e);
  } finally {
    fireLoading.value = false;
  }
};

// ---------------- NAVIGATION ----------------
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

    <p>
      <strong>Role:</strong>

      <span v-if="!canManage">
        {{ member.role }}
        <span v-if="isSelf" style="color: gray;">
          (This is you; you cannot change your own role.)
        </span>
      </span>

      <select
          v-else
          v-model="selectedRole"
          :disabled="roleLoading"
      >
        <option
            v-for="role in availableRoles"
            :key="role"
            :value="role"
        >
          {{ role }}
        </option>
      </select>

    </p>

    <p><strong>Joined At:</strong> {{ member.joinedAt }}</p>

    <p v-if="roleError" style="color:red;">
      {{ roleError }}
    </p>

    <!-- FIRE SECTION -->
    <div style="margin-top: 20px;">

      <button
          v-if="canFire"
          @click="handleFire"
          :disabled="fireLoading"
          style="color: red;"
      >
        Remove Member
      </button>

      <span
          v-else-if="myRole === 'OWNER' && isSelf"
          style="color: gray;"
      >
        (You cannot remove yourself)
      </span>

    </div>

    <p v-if="fireError" style="color:red;">
      {{ fireError }}
    </p>

    <button @click="goBack">
      Back to Organization
    </button>

  </section>
</template>