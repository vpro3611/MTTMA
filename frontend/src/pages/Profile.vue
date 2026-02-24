<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed, watchEffect } from "vue";
import { userAPI } from "../api/user";
import { organizationsAPI as orgAPI } from "../api/organizations";
import { authStore } from "../stores/auth_store";
import type { User } from "../types/auth_types";
import type { OrganizationWithRole } from "../types/org_types";
import { errorMessage } from "../utils/errorMessage";

import ChangeEmail from "../components/ChangeEmail.vue";
import ChangePassword from "../components/ChangePassword.vue";
import Logout from "../components/Logout.vue";

type OrgRole = "OWNER" | "ADMIN" | "MEMBER";
type AssignableRole = Exclude<OrgRole, "OWNER">;

const route = useRoute();

const remoteProfile = ref<User | null>(null);
const error = ref<string | null>(null);
const isLoading = ref(false);

const myOrganizations = ref<OrganizationWithRole[]>([]);
const membershipMap = ref<Record<string, boolean>>({});

const hireLoading = ref<string | null>(null);
const hireError = ref<string | null>(null);

const selectedRoles = ref<Record<string, AssignableRole | null>>({});

const isOwnProfile = computed(() => {
  return authStore.user?.id === route.params.id;
});

const profile = computed(() => {
  return isOwnProfile.value
      ? authStore.user
      : remoteProfile.value;
});


// ---------------- LOAD PROFILE + MY ORGS ----------------
watchEffect(async () => {
  if (authStore.isBootstrapping) return;
  if (!route.params.id) return;

  if (isOwnProfile.value) {
    remoteProfile.value = null;
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;

    const targetUserId = route.params.id as string;

    remoteProfile.value = await userAPI.getProfile(targetUserId);
    myOrganizations.value = await orgAPI.getMyOrganizationsWithRole();

    // Проверяем, состоит ли пользователь уже в каждой организации
    const map: Record<string, boolean> = {};

    await Promise.all(
        myOrganizations.value.map(async (org) => {
          try {
            await orgAPI.getMemberById(org.orgId, targetUserId);
            map[org.orgId] = true; // уже участник
          } catch {
            map[org.orgId] = false; // не участник
          }
        })
    );

    membershipMap.value = map;

  } catch (e: unknown) {
    error.value = errorMessage(e);
  } finally {
    isLoading.value = false;
  }
});


// ---------------- PERMISSIONS ----------------
const canHireInOrg = (org: OrganizationWithRole): boolean => {
  return org.role === "OWNER" || org.role === "ADMIN";
};

const availableRoles = (org: OrganizationWithRole): AssignableRole[] => {
  if (org.role === "OWNER") return ["ADMIN", "MEMBER"];
  if (org.role === "ADMIN") return ["MEMBER"];
  return [];
};


// ---------------- HIRE ----------------
const handleHire = async (orgId: string) => {
  const role = selectedRoles.value[orgId];
  if (!role) return;

  try {
    hireLoading.value = orgId;
    hireError.value = null;

    await orgAPI.hireMember(
        orgId,
        route.params.id as string,
        role
    );

    // после успешного найма блокируем повторный
    membershipMap.value[orgId] = true;
    selectedRoles.value[orgId] = null;

  } catch (e: unknown) {
    hireError.value = errorMessage(e);
  } finally {
    hireLoading.value = null;
  }
};
</script>


<template>
  <div v-if="error">
    {{ error }}
  </div>

  <div v-else-if="isLoading">
    Loading...
  </div>

  <div v-else-if="profile">

    <h1>{{ profile.email }}</h1>
    <p>Status: {{ profile.status }}</p>

    <!-- OWN PROFILE -->
    <div v-if="isOwnProfile">
      <h2>Change email</h2>
      <ChangeEmail />

      <h2>Change password</h2>
      <ChangePassword />

      <Logout />
    </div>

    <!-- HIRE SECTION -->
    <div
        v-if="!isOwnProfile && myOrganizations.length"
        style="margin-top: 40px;"
    >
      <h3>Hire to Organization</h3>

      <div
          v-for="org in myOrganizations"
          :key="org.orgId"
          style="margin-bottom: 20px;"
      >

        <div v-if="canHireInOrg(org)">
          <strong>{{ org.name }}</strong>

          <!-- Если уже участник -->
          <div v-if="membershipMap[org.orgId]" style="color: gray; margin-top: 5px;">
            Already a member
          </div>

          <!-- Если не участник -->
          <div v-else style="margin-top: 5px;">

            <select
                v-model="selectedRoles[org.orgId]"
                :disabled="hireLoading === org.orgId"
            >
              <option disabled value="">
                Select role
              </option>

              <option
                  v-for="role in availableRoles(org)"
                  :key="role"
                  :value="role"
              >
                {{ role }}
              </option>
            </select>

            <button
                @click="handleHire(org.orgId)"
                :disabled="
                hireLoading === org.orgId ||
                !selectedRoles[org.orgId]
              "
                style="margin-left: 10px;"
            >
              Hire
            </button>

          </div>

        </div>

      </div>

      <p v-if="hireError" style="color:red;">
        {{ hireError }}
      </p>
    </div>

  </div>

  <div v-else>
    Loading...
  </div>
</template>