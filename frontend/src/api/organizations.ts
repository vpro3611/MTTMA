import {UrlConfig} from "../config.ts";
import {authorizedFetch} from "./http.ts";
import type {OrganizationType, OrganizationWithRole} from "../types/org_types.ts";
import type {TaskType} from "../types/task_types.ts";
import type {MemberType} from "../types/member_types.ts";
import type {OrganizationSearchFilters, OrganizationSearchResult} from "../types/org_search_types.ts";
import type {AuditFilterRequest, AuditType} from "../types/audit_types.ts";
import type {InvitationStatus, InvitationType} from "../types/invitation_types.ts";


export const organizationsAPI = {

    async createOrganization(name: string): Promise<OrganizationType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/create`, {
            method: "POST",
            body: JSON.stringify({name}),
            headers: {"Content-Type": "application/json"}
        })
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to create organization");
        }
        return data;
    },

    async getMyOrganizations(): Promise<OrganizationType[]> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/my_organizations`, {
            method: "GET"
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get organizations");
        }

        return data;
    },

    async getById(orgId: string): Promise<OrganizationType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/api/view/${orgId}`,
            {method: "GET"}
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get organization");
        }

        return data;
    },

    async getOrganizationWithRole(orgId: string): Promise<OrganizationWithRole>{
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/organizations/${orgId}/w_role`,
            {method: "GET"}
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get organization");
        }

        return data;
    },


    async renameOrganization(orgId: string, newName: string): Promise<OrganizationType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/rename`, {
            method: "PATCH",
            body: JSON.stringify({newName}),
            headers: {"Content-Type": "application/json"}
        })
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to rename organization");
        }
        return data;
    },

    async deleteOrganization(orgId: string) {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/delete`, {
            method: "DELETE"
        })

        if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error(data?.message || "Failed to delete organization");
        }
    },

    async createTask(orgId: string, title: string, description: string, assignedTo?: string): Promise<TaskType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/tasks/create`, {
            method: "POST",
            body: JSON.stringify({title, description, assignedTo}),
            headers: {"Content-Type": "application/json"}
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to create task");
        }

        return data;
    },

    async getAllMembers(orgId: string): Promise<MemberType[]> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/members`, {
            method: "GET"
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get members");
        }

        return data;
    },

    async getMemberById(orgId: string, memberId: string): Promise<MemberType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/members/${memberId}/view`, {
            method: "GET"
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get member");
        }

        return data;
    },

    async changeMemberRole(orgId: string, memberId: string, role: string): Promise<MemberType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/role/${memberId}`, {
            method: "PATCH",
            body: JSON.stringify({role}),
            headers: {"Content-Type": "application/json"}
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to change member role");
        }

        return data;
    },

    async fireMember(orgId: string, targetUserId: string): Promise<void> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/fire/${targetUserId}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error(data?.message || "Failed to fire member");
        }
    },

    async hireMember(orgId: string, targetUserId: string, role?: "ADMIN" | "MEMBER"): Promise<void> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/users/${targetUserId}/hire`, {
            method: "POST",
            body: JSON.stringify({role}),
            headers: {"Content-Type": "application/json"}
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to hire member");
        }

        return data;
    },

    async getMyOrganizationsWithRole(): Promise<OrganizationWithRole[]> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/my/with_roles`, {
            method: "GET"
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get organizations");
        }

        return data;
    },

    async listTasks(orgId: string, filters?: {
        title?: string,
        description?: string,
        status?: "TODO" |  "COMPLETED" | "IN_PROGRESS" | "CANCELED" | undefined
        assigneeId?: string,
        creatorId?: string,
        createdFrom?: string,
        createdTo?: string,
        limit?: number,
        offset?: number,

    }): Promise<TaskType[]> {

        const params = new URLSearchParams();

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    params.append(key, String(value));
                }
            });
        }


        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/tasks?${params.toString()}`, {
            method: "GET"
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get tasks");
        }

        return data;
    },

    async getTaskById(orgId: string, taskId: string): Promise<TaskType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/tasks/${taskId}/view`, {
            method: "GET"
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get tasks");
        }

        return data;
    },

    async changeTaskDescription(orgId: string, taskId: string, description: string): Promise<TaskType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/tasks/${taskId}/description`, {
            method: "PATCH",
            body: JSON.stringify({newDesc: description}),
            headers: {"Content-Type": "application/json"}
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to change task description");
        }

        return data;
    },

    async changeTaskStatus(orgId: string, taskId: string, newStatus: "TODO" | "COMPLETED" | "IN_PROGRESS" | "CANCELED"): Promise<TaskType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/tasks/${taskId}/status`, {
            method: "PATCH",
            body: JSON.stringify({newStatus}),
            headers: {"Content-Type": "application/json"}
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to change task status");
        }

        return data;
    },

    async changeTaskTitle(orgId: string, taskId: string, newTitle: string): Promise<TaskType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/tasks/${taskId}/title`, {
            method: "PATCH",
            body: JSON.stringify({newTitle}),
            headers: {"Content-Type": "application/json"}
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to change task title");
        }
        return data;
    },

    async deleteTask(orgId: string, taskId: string) {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/tasks/${taskId}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data?.message || "Failed to delete task");
        }
    },

    async searchOrganizations(filters: OrganizationSearchFilters): Promise<OrganizationSearchResult[]> {
        const params = new URLSearchParams();

        params.append("query", filters.query);

        if (filters.createdFrom) {
            params.append("createdFrom", filters.createdFrom);
        }

        if (filters.createdTo) {
            params.append("createdTo", filters.createdTo);
        }

        if (filters.sortBy) {
            params.append("sortBy", filters.sortBy);
        }

        if (filters.order) {
            params.append("order", filters.order);
        }

        if (filters.limit !== undefined) {
            params.append("limit", filters.limit.toString());
        }

        if (filters.offset !== undefined) {
            params.append("offset", filters.offset.toString());
        }

        const res = await authorizedFetch(
            `${UrlConfig.apiBaseUrl}/api/organizations?${params.toString()}`,
            { method: "GET" }
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to search organizations");
        }

        return data;
    },

    /*
    export type AuditDto = {
    id: string,
    actorId: string,
    organizationId: string,
    action: string,
    createdAt: Date,
}
     */

    async getAllAuditEvents(orgId: string): Promise<AuditType[]> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/audit_events/all`, {
            method: "GET"
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get audit events");
        }

        return data;
    },

    async getFilteredAuditEvents(orgId: string, filters?: AuditFilterRequest): Promise<AuditType[]> {
        const params = new URLSearchParams();

        if (filters?.action) params.append("action", filters.action);
        if (filters?.actorUserId) params.append("actorUserId", filters.actorUserId);
        if (filters?.from) params.append("from", filters.from);
        if (filters?.to) params.append("to", filters.to);
        if (filters?.limit !== undefined) params.append("limit", String(filters.limit));
        if (filters?.offset !== undefined) params.append("offset", String(filters.offset));

        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/audit_events/filtered?${params.toString()}`, {
            method: "GET"
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get audit events");
        }

        return data;
    },

    async getAllInvitations(orgId: string, filters?: {
        invited_user_id?: string,
        status?: InvitationStatus,
        createdFrom?: string,
        createdTo?: string,
    }): Promise<InvitationType[]> {
        const params = new URLSearchParams();

        if (filters?.invited_user_id) {
            params.append("invited_user_id", filters.invited_user_id);
        }
        if (filters?.status) {
            params.append("status", filters.status);
        }

        if (filters?.createdFrom) {
            params.append("createdFrom", filters.createdFrom);
        }
        if (filters?.createdTo) {
            params.append("createdTo", filters.createdTo);
        }

        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/invitations?${params.toString()}`, {
            method: "GET"
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get invitations");
        }

        return data;
    },

    async createInvitation(orgId: string, invitedUserId: string, role?: "ADMIN" | "MEMBER"): Promise<InvitationType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/invite/${invitedUserId}`, {
            method: "POST",
            body: JSON.stringify({role}),
            headers: {"Content-Type": "application/json"}
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to create invitation");
        }

        return data;
    },

    async getInvitationById(orgId: string, invitationId: string): Promise<InvitationType> {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${orgId}/invitations/${invitationId}/view`, {
            method: "GET"
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to get invitation");
        }

        return data;
    },

    async cancelInvitation(invitationId: string) {
        const res = await authorizedFetch(`${UrlConfig.apiBaseUrl}/org/${invitationId}/cancel`, {
            method: "PATCH"
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Failed to cancel invitation");
        }

        return data;
    }

}
//import {OrgMemsRole} from "../domain/org_members_role.js";
//
//
// export type AllOrgsWithRoles = {
//     orgId: string,
//     name: string,
//     role: OrgMemsRole,
//