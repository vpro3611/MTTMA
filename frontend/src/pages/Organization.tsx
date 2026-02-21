import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { routes } from '../config/routes';
import * as meApi from '../api/me';
import * as orgApi from '../api/org';
import type { OrganizationResponse } from '../types/organization';
import type { OrgMember, OrgTask, AuditEvent, OrgInvitation } from '../types/orgDetails';
import { AUDIT_ACTIONS } from '../constants/auditActions';
import { ORG_ROLES } from '../constants/roles';
import { TASK_STATUSES } from '../constants/taskStatus';

export function Organization() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const [org, setOrg] = useState<OrganizationResponse | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [tasks, setTasks] = useState<OrgTask[]>([]);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [invitations, setInvitations] = useState<OrgInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [renameName, setRenameName] = useState('');
  const [hireUserId, setHireUserId] = useState('');
  const [hireRole, setHireRole] = useState<string>(ORG_ROLES[2]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [auditFilters, setAuditFilters] = useState({ action: '', actorUserId: '', from: '', to: '', limit: 20, offset: 0 });
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState<string>(ORG_ROLES[2]);
  const [invFilters, setInvFilters] = useState({ invited_user_id: '', status: '', createdFrom: '', createdTo: '' });

  const [acting, setActing] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!orgId) return;
    setError(null);
    try {
      const [orgData, membersData, tasksData, auditData, invData] = await Promise.all([
        meApi.getOrganization(orgId),
        orgApi.listMembers(orgId),
        orgApi.listTasks(orgId).catch(() => [] as OrgTask[]),
        orgApi.getAllAudit(orgId),
        orgApi.getOrgInvitations(orgId).catch(() => [] as OrgInvitation[]),
      ]);
      setOrg(orgData);
      setMembers(membersData);
      setTasks(tasksData);
      setAudit(auditData);
      setInvitations(invData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  const loadTasks = useCallback(async () => {
    if (!orgId) return;
    try {
      const tasksData = await orgApi.listTasks(orgId);
      setTasks(tasksData);
    } catch (e) {
      // Silently fail - tasks might fail but other data loaded
    }
  }, [orgId]);

  const loadAudit = useCallback(async () => {
    if (!orgId) return;
    try {
      const auditData = await orgApi.getAllAudit(orgId);
      setAudit(auditData);
    } catch (e) {
      // Silently fail
    }
  }, [orgId]);

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    load();
  }, [orgId, load]);

  useEffect(() => {
    if (org?.name) setRenameName(org.name);
  }, [org?.name]);

  if (!orgId) {
    return (
      <div className="page">
        <p>Missing organization ID.</p>
        <Link to={routes.organizations}>Back to Organizations</Link>
      </div>
    );
  }

  if (loading && !org) {
    return (
      <div className="page">
        <p>Loading organization…</p>
      </div>
    );
  }

  if (error && !org) {
    return (
      <div className="page">
        <p className="auth-error">{error}</p>
        <Link to={routes.organizations}>Back to Organizations</Link>
      </div>
    );
  }

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setActing('rename');
    try {
      const updated = await orgApi.renameOrganization(orgId, renameName.trim());
      setOrg(updated);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Rename failed');
    } finally {
      setActing(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this organization?')) return;
    setFormError(null);
    setActing('delete');
    try {
      await orgApi.deleteOrganization(orgId);
      navigate(routes.organizations);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Delete failed');
      setActing(null);
    }
  };

  const handleHire = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setActing('hire');
    try {
      await orgApi.hireMember(orgId, hireUserId.trim(), hireRole);
      setMembers(await orgApi.listMembers(orgId));
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Hire failed');
    } finally {
      setActing(null);
    }
  };

  const handleFire = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    setFormError(null);
    setActing(`fire-${userId}`);
    try {
      await orgApi.fireMember(orgId, userId);
      setMembers(await orgApi.listMembers(orgId));
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Fire failed');
    } finally {
      setActing(null);
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    setFormError(null);
    setActing(`role-${userId}`);
    try {
      await orgApi.changeMemberRole(orgId, userId, role);
      setMembers(await orgApi.listMembers(orgId));
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Change role failed');
    } finally {
      setActing(null);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setActing('task');
    try {
      await orgApi.createTask(orgId, {
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        assignedTo: taskAssignedTo.trim() || undefined,
      });
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssignedTo('');
      await Promise.all([loadTasks(), loadAudit()]);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Create task failed');
    } finally {
      setActing(null);
    }
  };

  const handleTaskTitle = async (taskId: string, newTitle: string) => {
    setActing(`task-title-${taskId}`);
    try {
      await orgApi.changeTaskTitle(orgId, taskId, newTitle);
      await Promise.all([loadTasks(), loadAudit()]);
    } finally {
      setActing(null);
    }
  };

  const handleTaskDesc = async (taskId: string, newDesc: string) => {
    setActing(`task-desc-${taskId}`);
    try {
      await orgApi.changeTaskDescription(orgId, taskId, newDesc);
      await Promise.all([loadTasks(), loadAudit()]);
    } finally {
      setActing(null);
    }
  };

  const handleTaskStatus = async (taskId: string, newStatus: string) => {
    setActing(`task-status-${taskId}`);
    try {
      await orgApi.changeTaskStatus(orgId, taskId, newStatus);
      await Promise.all([loadTasks(), loadAudit()]);
    } finally {
      setActing(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    setActing(`task-del-${taskId}`);
    try {
      await orgApi.deleteTask(orgId, taskId);
      await Promise.all([loadTasks(), loadAudit()]);
    } finally {
      setActing(null);
    }
  };

  const handleApplyAuditFilters = async (e: React.FormEvent) => {
    e.preventDefault();
    setActing('audit');
    try {
      const filters: orgApi.AuditFilters = {};
      if (auditFilters.action) filters.action = auditFilters.action;
      if (auditFilters.actorUserId) filters.actorUserId = auditFilters.actorUserId;
      if (auditFilters.from) filters.from = new Date(auditFilters.from).toISOString();
      if (auditFilters.to) filters.to = new Date(auditFilters.to).toISOString();
      if (auditFilters.limit) filters.limit = auditFilters.limit;
      if (auditFilters.offset) filters.offset = auditFilters.offset;
      const list = await orgApi.getFilteredAudit(orgId, filters);
      setAudit(list);
    } finally {
      setActing(null);
    }
  };

  const handleResetAudit = () => {
    load();
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setActing('invite');
    try {
      await orgApi.createInvitation(orgId, inviteUserId.trim(), inviteRole);
      setInvitations(await orgApi.getOrgInvitations(orgId));
      setInviteUserId('');
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Invite failed');
    } finally {
      setActing(null);
    }
  };

  const handleApplyInvFilters = async (e: React.FormEvent) => {
    e.preventDefault();
    setActing('inv-filters');
    try {
      const filters: orgApi.OrgInvitationFilters = {};
      if (invFilters.invited_user_id) filters.invited_user_id = invFilters.invited_user_id;
      if (invFilters.status) filters.status = invFilters.status;
      if (invFilters.createdFrom) filters.createdFrom = new Date(invFilters.createdFrom);
      if (invFilters.createdTo) filters.createdTo = new Date(invFilters.createdTo);
      const list = await orgApi.getOrgInvitations(orgId, Object.keys(filters).length > 0 ? filters : undefined);
      setInvitations(list);
    } finally {
      setActing(null);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    setActing(`cancel-${invitationId}`);
    try {
      await orgApi.cancelInvitation(invitationId);
      setInvitations(await orgApi.getOrgInvitations(orgId));
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="page organization-page">
      <nav className="page-nav">
        <Link to={routes.organizations}>Organizations</Link>
        <Link to={routes.dashboard}>Dashboard</Link>
        <Link to={routes.home}>Home</Link>
      </nav>

      {formError && <div className="auth-error">{formError}</div>}

      <section className="profile-section">
        <h1>{org?.name ?? 'Organization'}</h1>
        <dl className="profile-dl">
          <dt>ID</dt>
          <dd><code>{org?.id}</code></dd>
          <dt>Created</dt>
          <dd>{org?.createdAt ? new Date(org.createdAt).toLocaleString() : '—'}</dd>
        </dl>

        <form onSubmit={handleRename} className="auth-form inline-form">
          <label>
            Rename
            <input
              type="text"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              minLength={3}
              maxLength={255}
              placeholder="Organization name"
            />
          </label>
          <button type="submit" disabled={!!acting}>Rename</button>
        </form>
        <button type="button" className="btn-danger" onClick={handleDelete} disabled={!!acting}>
          Delete organization
        </button>
      </section>

      <section className="profile-section">
        <h2>Members</h2>
        {members.length === 0 ? (
          <p>No members yet.</p>
        ) : (
          <ul className="org-list">
            {members.map((m) => (
              <li key={`${m.organizationId}-${m.userId}`} className="org-list-item-actions">
                <span>User <code>{m.userId}</code> · {m.role} · {new Date(m.joinedAt).toLocaleString()}</span>
                <span className="item-actions">
                  <select
                    value={m.role}
                    onChange={(e) => handleChangeRole(m.userId, e.target.value)}
                    disabled={!!acting}
                  >
                    {ORG_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => handleFire(m.userId)} disabled={!!acting}>Fire</button>
                </span>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleHire} className="auth-form inline-form">
          <label>User ID <input type="text" value={hireUserId} onChange={(e) => setHireUserId(e.target.value)} required /></label>
          <label>Role <select value={hireRole} onChange={(e) => setHireRole(e.target.value)}>{ORG_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select></label>
          <button type="submit" disabled={!!acting}>Hire</button>
        </form>
      </section>

      <section className="profile-section">
        <h2>Tasks</h2>
        {tasks.length === 0 ? (
          <p>No tasks yet.</p>
        ) : (
          <ul className="org-list">
            {tasks.map((t) => (
              <li key={t.id} className="task-item">
                <div>
                  <strong>{t.title}</strong> · {t.status}
                  <br />
                  <small>{t.description}</small>
                  {t.assignedTo && <><br /><small>Assigned to: <code>{t.assignedTo}</code></small></>}
                  {t.createdBy && <><br /><small>Created by: <code>{t.createdBy}</code></small></>}
                </div>
                <div className="item-actions">
                  <input
                    type="text"
                    defaultValue={t.title}
                    onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== t.title) handleTaskTitle(t.id, v); }}
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    defaultValue={t.description}
                    onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== t.description) handleTaskDesc(t.id, v); }}
                    placeholder="Description"
                  />
                  <select value={t.status} onChange={(e) => handleTaskStatus(t.id, e.target.value)} disabled={!!acting}>
                    {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button type="button" onClick={() => handleDeleteTask(t.id)} disabled={!!acting}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleCreateTask} className="auth-form">
          <label>Title <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required minLength={1} maxLength={255} /></label>
          <label>Description <input type="text" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} required minLength={1} maxLength={500} /></label>
          <label>Assigned to (user ID, optional) <input type="text" value={taskAssignedTo} onChange={(e) => setTaskAssignedTo(e.target.value)} /></label>
          <button type="submit" disabled={!!acting}>Create task</button>
        </form>
      </section>

      <section className="profile-section">
        <h2>Audit events</h2>
        <form onSubmit={handleApplyAuditFilters} className="auth-form org-filters">
          <label>Action <select value={auditFilters.action} onChange={(e) => setAuditFilters((f) => ({ ...f, action: e.target.value }))}>
            <option value="">—</option>
            {AUDIT_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select></label>
          <label>Actor user ID <input type="text" value={auditFilters.actorUserId} onChange={(e) => setAuditFilters((f) => ({ ...f, actorUserId: e.target.value }))} /></label>
          <label>From <input type="datetime-local" value={auditFilters.from} onChange={(e) => setAuditFilters((f) => ({ ...f, from: e.target.value }))} /></label>
          <label>To <input type="datetime-local" value={auditFilters.to} onChange={(e) => setAuditFilters((f) => ({ ...f, to: e.target.value }))} /></label>
          <label>Limit <input type="number" min={1} max={100} value={auditFilters.limit} onChange={(e) => setAuditFilters((f) => ({ ...f, limit: Number(e.target.value) || 20 }))} /></label>
          <label>Offset <input type="number" min={0} value={auditFilters.offset} onChange={(e) => setAuditFilters((f) => ({ ...f, offset: Number(e.target.value) || 0 }))} /></label>
          <button type="submit" disabled={!!acting}>Apply filters</button>
          <button type="button" onClick={handleResetAudit} disabled={!!acting}>Reset (reload all)</button>
        </form>
        {audit.length === 0 ? (
          <p>No audit events.</p>
        ) : (
          <ul className="org-list">
            {audit.map((a) => (
              <li key={a.id}>{a.action} · actor <code>{a.actorId}</code> · {new Date(a.createdAt).toLocaleString()}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="profile-section">
        <h2>Invitations</h2>
        <form onSubmit={handleApplyInvFilters} className="auth-form org-filters">
          <label>Invited user ID <input type="text" value={invFilters.invited_user_id} onChange={(e) => setInvFilters((f) => ({ ...f, invited_user_id: e.target.value }))} /></label>
          <label>Status <input type="text" value={invFilters.status} onChange={(e) => setInvFilters((f) => ({ ...f, status: e.target.value }))} placeholder="PENDING, ACCEPTED, …" /></label>
          <label>Created from <input type="datetime-local" value={invFilters.createdFrom} onChange={(e) => setInvFilters((f) => ({ ...f, createdFrom: e.target.value }))} /></label>
          <label>Created to <input type="datetime-local" value={invFilters.createdTo} onChange={(e) => setInvFilters((f) => ({ ...f, createdTo: e.target.value }))} /></label>
          <button type="submit" disabled={!!acting}>Apply filters</button>
          <button type="button" onClick={() => load()} disabled={!!acting}>Reset</button>
        </form>
        <form onSubmit={handleInvite} className="auth-form inline-form">
          <label>Invite user ID <input type="text" value={inviteUserId} onChange={(e) => setInviteUserId(e.target.value)} required /></label>
          <label>Role <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>{ORG_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select></label>
          <button type="submit" disabled={!!acting}>Invite</button>
        </form>
        {invitations.length === 0 ? (
          <p>No invitations.</p>
        ) : (
          <ul className="org-list">
            {invitations.map((inv) => (
              <li key={inv.id} className="org-list-item-actions">
                <span>User <code>{inv.invitedUserId}</code> · {inv.role} · {inv.status} · {new Date(inv.createdAt).toLocaleString()}</span>
                <button type="button" onClick={() => handleCancelInvitation(inv.id)} disabled={!!acting}>Cancel</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
