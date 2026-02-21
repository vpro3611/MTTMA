import { apiFetch } from './client';
import { apiPaths } from '../config/api';
import type { User, ChangePassInput, ChangeEmailInput } from '../types/user';
import type {
  OrganizationResponse,
  OrganizationSearchResult,
  SearchOrganizationsQuery,
} from '../types/organization';
import type { InvitationView } from '../types/invitation';

function parseJson<T>(res: Response): Promise<T> {
  return res.json();
}

async function throwOnNotOk(res: Response, msg: string): Promise<void> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string })?.message ?? `${msg}: ${res.status}`);
  }
}

/** GET /me/:targetUserId – check profile (self returns password) */
export async function getProfile(targetUserId: string): Promise<User> {
  const res = await apiFetch(apiPaths.me.profile(targetUserId));
  await throwOnNotOk(res, 'Profile fetch failed');
  return parseJson<User>(res);
}

/** PATCH /me/change_pass */
export async function changePassword(body: ChangePassInput): Promise<User> {
  const res = await apiFetch(apiPaths.me.changePass, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  await throwOnNotOk(res, 'Change password failed');
  return parseJson<User>(res);
}

/** PATCH /me/change_email */
export async function changeEmail(body: ChangeEmailInput): Promise<User> {
  const res = await apiFetch(apiPaths.me.changeEmail, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  await throwOnNotOk(res, 'Change email failed');
  return parseJson<User>(res);
}

/** GET /me/organizations – search organizations */
export async function searchOrganizations(
  query: SearchOrganizationsQuery
): Promise<OrganizationSearchResult[]> {
  const params = new URLSearchParams();
  params.set('query', query.query);
  if (query.createdFrom) params.set('createdFrom', query.createdFrom);
  if (query.createdTo) params.set('createdTo', query.createdTo);
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.order) params.set('order', query.order);
  if (query.limit != null) params.set('limit', String(query.limit));
  if (query.offset != null) params.set('offset', String(query.offset));
  const url = `${apiPaths.me.organizations}?${params.toString()}`;
  const res = await apiFetch(url);
  await throwOnNotOk(res, 'Search organizations failed');
  return parseJson<OrganizationSearchResult[]>(res);
}

/** GET /me/organizations/:orgId – view one organization */
export async function getOrganization(orgId: string): Promise<OrganizationResponse> {
  const res = await apiFetch(apiPaths.me.organization(orgId));
  await throwOnNotOk(res, 'Organization fetch failed');
  return parseJson<OrganizationResponse>(res);
}

/** GET /me/invitations – list current user invitations */
export async function getMyInvitations(): Promise<InvitationView[]> {
  const res = await apiFetch(apiPaths.me.invitations);
  await throwOnNotOk(res, 'Invitations fetch failed');
  return parseJson<InvitationView[]>(res);
}

/** PATCH /me/:invitationId/accept */
export async function acceptInvitation(invitationId: string): Promise<unknown> {
  const res = await apiFetch(apiPaths.me.acceptInvitation(invitationId), {
    method: 'PATCH',
  });
  await throwOnNotOk(res, 'Accept invitation failed');
  return res.json().catch(() => ({}));
}

/** PATCH /me/:invitationId/reject */
export async function rejectInvitation(invitationId: string): Promise<unknown> {
  const res = await apiFetch(apiPaths.me.rejectInvitation(invitationId), {
    method: 'PATCH',
  });
  await throwOnNotOk(res, 'Reject invitation failed');
  return res.json().catch(() => ({}));
}
