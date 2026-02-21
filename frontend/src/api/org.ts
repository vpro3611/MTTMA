import { apiFetch } from './client';
import { apiPaths } from '../config/api';
import type { OrganizationResponse } from '../types/organization';
import type { OrgTask, OrgMember, AuditEvent, OrgInvitation } from '../types/orgDetails';

export interface OrgInvitationFilters {
  invited_user_id?: string;
  status?: string;
  createdFrom?: Date;
  createdTo?: Date;
}

async function ensureOk(res: Response, msg: string): Promise<void> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `${msg}: ${res.status}`);
  }
}

export async function createOrganization(name: string): Promise<OrganizationResponse> {
  const res = await apiFetch(apiPaths.org.create, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  await ensureOk(res, 'Create organization failed');
  return res.json();
}

export async function renameOrganization(orgId: string, newName: string): Promise<OrganizationResponse> {
  const res = await apiFetch(apiPaths.org.rename(orgId), {
    method: 'PATCH',
    body: JSON.stringify({ newName }),
  });
  await ensureOk(res, 'Rename organization failed');
  return res.json();
}

export async function deleteOrganization(orgId: string): Promise<void> {
  const res = await apiFetch(apiPaths.org.delete(orgId), {
    method: 'DELETE',
  });
  await ensureOk(res, 'Delete organization failed');
}

export async function listMembers(orgId: string): Promise<OrgMember[]> {
  const res = await apiFetch(apiPaths.org.members(orgId));
  await ensureOk(res, 'Get members failed');
  return res.json();
}

export async function hireMember(orgId: string, userId: string, role: string): Promise<OrgMember> {
  const res = await apiFetch(apiPaths.org.hire(orgId), {
    method: 'POST',
    body: JSON.stringify({ targetUserId: userId, role }),
  });
  await ensureOk(res, 'Hire member failed');
  return res.json();
}

export async function fireMember(orgId: string, userId: string): Promise<void> {
  const res = await apiFetch(apiPaths.org.fire(orgId, userId), {
    method: 'DELETE',
  });
  await ensureOk(res, 'Fire member failed');
}

export async function changeMemberRole(orgId: string, userId: string, role: string): Promise<OrgMember> {
  const res = await apiFetch(apiPaths.org.role(orgId, userId), {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
  await ensureOk(res, 'Change role failed');
  return res.json();
}

export interface TaskFilters {
  title?: string;
  description?: string;
  status?: string;
  assigneeId?: string;
  creatorId?: string;
  createdFrom?: string;
  createdTo?: string;
  limit?: number;
  offset?: number;
}

export async function listTasks(orgId: string, filters?: TaskFilters): Promise<OrgTask[]> {
  const params = new URLSearchParams();
  if (filters?.title) params.set('title', filters.title);
  if (filters?.description) params.set('description', filters.description);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.assigneeId) params.set('assigneeId', filters.assigneeId);
  if (filters?.creatorId) params.set('creatorId', filters.creatorId);
  if (filters?.createdFrom) params.set('createdFrom', filters.createdFrom);
  if (filters?.createdTo) params.set('createdTo', filters.createdTo);
  if (filters?.limit != null) params.set('limit', String(filters.limit));
  if (filters?.offset != null) params.set('offset', String(filters.offset));
  const qs = params.toString();
  const url = qs ? `${apiPaths.org.tasks.list(orgId)}?${qs}` : apiPaths.org.tasks.list(orgId);
  const res = await apiFetch(url);
  await ensureOk(res, 'List tasks failed');
  return res.json();
}

export interface CreateTaskInput {
  title: string;
  description: string;
  assignedTo?: string;
}

export async function createTask(orgId: string, input: CreateTaskInput): Promise<OrgTask> {
  const res = await apiFetch(apiPaths.org.tasks.create(orgId), {
    method: 'POST',
    body: JSON.stringify(input),
  });
  await ensureOk(res, 'Create task failed');
  return res.json();
}

export async function changeTaskTitle(orgId: string, taskId: string, newTitle: string): Promise<OrgTask> {
  const res = await apiFetch(apiPaths.org.tasks.title(orgId, taskId), {
    method: 'PATCH',
    body: JSON.stringify({ newTitle }),
  });
  await ensureOk(res, 'Change title failed');
  return res.json();
}

export async function changeTaskDescription(
  orgId: string,
  taskId: string,
  newDesc: string,
): Promise<OrgTask> {
  const res = await apiFetch(apiPaths.org.tasks.description(orgId, taskId), {
    method: 'PATCH',
    body: JSON.stringify({ newDesc }),
  });
  await ensureOk(res, 'Change description failed');
  return res.json();
}

export async function changeTaskStatus(
  orgId: string,
  taskId: string,
  newStatus: string,
): Promise<OrgTask> {
  const res = await apiFetch(apiPaths.org.tasks.status(orgId, taskId), {
    method: 'PATCH',
    body: JSON.stringify({ newStatus }),
  });
  await ensureOk(res, 'Change status failed');
  return res.json();
}

export async function deleteTask(orgId: string, taskId: string): Promise<void> {
  const res = await apiFetch(apiPaths.org.tasks.delete(orgId, taskId), {
    method: 'DELETE',
  });
  await ensureOk(res, 'Delete task failed');
}

export interface AuditFilters {
  action?: string;
  actorUserId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export async function getAllAudit(orgId: string): Promise<AuditEvent[]> {
  const res = await apiFetch(apiPaths.org.audit.all(orgId));
  await ensureOk(res, 'Get audit failed');
  return res.json();
}

export async function getFilteredAudit(orgId: string, filters: AuditFilters): Promise<AuditEvent[]> {
  const params = new URLSearchParams();
  if (filters.action) params.set('action', filters.action);
  if (filters.actorUserId) params.set('actorUserId', filters.actorUserId);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.limit != null) params.set('limit', String(filters.limit));
  if (filters.offset != null) params.set('offset', String(filters.offset));
  const url = `${apiPaths.org.audit.filtered(orgId)}?${params.toString()}`;
  const res = await apiFetch(url);
  await ensureOk(res, 'Get filtered audit failed');
  return res.json();
}

export async function getOrgInvitations(
  orgId: string,
  filters?: Partial<OrgInvitationFilters>,
): Promise<OrgInvitation[]> {
  const params = new URLSearchParams();
  if (filters?.invited_user_id) params.set('invited_user_id', filters.invited_user_id);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.createdFrom)
    params.set('createdFrom', filters.createdFrom instanceof Date ? filters.createdFrom.toISOString() : String(filters.createdFrom));
  if (filters?.createdTo)
    params.set('createdTo', filters.createdTo instanceof Date ? filters.createdTo.toISOString() : String(filters.createdTo));
  const qs = params.toString();
  const url = qs ? `${apiPaths.org.invitations.list(orgId)}?${qs}` : apiPaths.org.invitations.list(orgId);
  const res = await apiFetch(url);
  await ensureOk(res, 'Get org invitations failed');
  return res.json();
}

export async function createInvitation(
  orgId: string,
  invitedUserId: string,
  role?: string,
): Promise<OrgInvitation> {
  const res = await apiFetch(apiPaths.org.invitations.create(orgId, invitedUserId), {
    method: 'POST',
    body: JSON.stringify(role != null ? { role } : {}),
  });
  await ensureOk(res, 'Create invitation failed');
  return res.json();
}

export async function cancelInvitation(invitationId: string): Promise<OrgInvitation> {
  const res = await apiFetch(apiPaths.org.invitations.cancel(invitationId), {
    method: 'PATCH',
  });
  await ensureOk(res, 'Cancel invitation failed');
  return res.json();
}

