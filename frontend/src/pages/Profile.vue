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
type OrgUserState = "MEMBER" | "INVITED" | "NONE";

const route = useRoute();

const remoteProfile = ref<User | null>(null);
const error = ref<string | null>(null);
const isLoading = ref(false);

const myOrganizations = ref<OrganizationWithRole[]>([]);
const orgUserStateMap = ref<Record<string, OrgUserState>>({});

const isMemberOfAnyOrg = ref<boolean>(false);

const actionLoading = ref<string | null>(null);
const actionError = ref<string | null>(null);

const selectedRoles = ref<Record<string, AssignableRole | null>>({});

const isOwnProfile = computed(() => {
  return authStore.user?.id === route.params.id;
});

const profile = computed(() => {
  return isOwnProfile.value
      ? authStore.user
      : remoteProfile.value;
});


// ---------------- LOAD PROFILE + STATE ----------------
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

    // 🔥 Новый вызов membership-check
    const membershipStatus = await userAPI.checkMembership(targetUserId);
    isMemberOfAnyOrg.value = membershipStatus.hasOrganizations === true;

    const stateMap: Record<string, OrgUserState> = {};

    await Promise.all(
        myOrganizations.value.map(async (org) => {
          try {
            await orgAPI.getMemberById(org.orgId, targetUserId);
            stateMap[org.orgId] = "MEMBER";
          } catch {
            try {
              const invitations = await orgAPI.getAllInvitations(org.orgId, {
                invited_user_id: targetUserId,
                status: "PENDING"
              });

              stateMap[org.orgId] =
                  invitations.length > 0 ? "INVITED" : "NONE";

            } catch {
              stateMap[org.orgId] = "NONE";
            }
          }
        })
    );

    orgUserStateMap.value = stateMap;

  } catch (e: unknown) {
    error.value = errorMessage(e);
  } finally {
    isLoading.value = false;
  }
});


// ---------------- PERMISSIONS ----------------
const canManageInOrg = (org: OrganizationWithRole): boolean => {
  return org.role === "OWNER" || org.role === "ADMIN";
};

const availableRoles = (org: OrganizationWithRole): AssignableRole[] => {
  if (org.role === "OWNER") return ["ADMIN", "MEMBER"];
  if (org.role === "ADMIN") return ["MEMBER"];
  return [];
};

// 🔥 Новая логика для Hire
const canHireTarget = (orgId: string): boolean => {
  if (orgUserStateMap.value[orgId] !== "NONE") return false;
  if (isMemberOfAnyOrg.value) return false;
  return true;
};

const canInviteTarget = (orgId: string): boolean => {
  return orgUserStateMap.value[orgId] === "NONE";
};


// ---------------- ACTION ----------------
const handleAction = async (
    orgId: string,
    mode: "HIRE" | "INVITE"
) => {
  const role = selectedRoles.value[orgId];
  if (!role) return;

  try {
    actionLoading.value = orgId;
    actionError.value = null;

    if (mode === "HIRE") {
      await orgAPI.hireMember(
          orgId,
          route.params.id as string,
          role
      );

      orgUserStateMap.value[orgId] = "MEMBER";
      isMemberOfAnyOrg.value = true;
    }

    if (mode === "INVITE") {
      await orgAPI.createInvitation(
          orgId,
          route.params.id as string,
          role
      );

      orgUserStateMap.value[orgId] = "INVITED";
    }

    selectedRoles.value[orgId] = null;

  } catch (e: unknown) {
    actionError.value = errorMessage(e);
  } finally {
    actionLoading.value = null;
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

    <div v-if="isOwnProfile">
      <h2>Change email</h2>
      <ChangeEmail />
      <h2>Change password</h2>
      <ChangePassword />
      <Logout />
    </div>

    <div
        v-if="!isOwnProfile && myOrganizations.length"
        style="margin-top: 40px;"
    >
      <h3>Manage in Organizations</h3>

      <div
          v-for="org in myOrganizations"
          :key="org.orgId"
          style="margin-bottom: 30px;"
      >

        <div v-if="canManageInOrg(org)">
          <strong>{{ org.name }}</strong>

          <div v-if="orgUserStateMap[org.orgId] === 'MEMBER'"
               style="color: gray; margin-top: 5px;">
            Already a member
          </div>

          <div v-else-if="orgUserStateMap[org.orgId] === 'INVITED'"
               style="color: gray; margin-top: 5px;">
            Invitation already sent
          </div>

          <div v-else style="margin-top: 10px;">

            <select
                v-model="selectedRoles[org.orgId]"
                :disabled="actionLoading === org.orgId"
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

            <!-- HIRE -->
            <button
                v-if="canHireTarget(org.orgId)"
                @click="handleAction(org.orgId, 'HIRE')"
                :disabled="
                  actionLoading === org.orgId ||
                  !selectedRoles[org.orgId]
                "
                style="margin-left: 10px;"
            >
              Hire
            </button>

            <!-- INVITE -->
            <button
                v-if="canInviteTarget(org.orgId)"
                @click="handleAction(org.orgId, 'INVITE')"
                :disabled="
                  actionLoading === org.orgId ||
                  !selectedRoles[org.orgId]
                "
                style="margin-left: 10px;"
            >
              Invite
            </button>

          </div>

        </div>

      </div>

      <p v-if="actionError" style="color:red;">
        {{ actionError }}
      </p>
    </div>

  </div>

  <div v-else>
    Loading...
  </div>
</template>