export interface OrgTask {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  status: string;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
}

export interface OrgMember {
  organizationId: string;
  userId: string;
  role: string;
  joinedAt: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  organizationId: string;
  action: string;
  createdAt: string;
}

export interface OrgInvitation {
  id: string;
  organizationId: string;
  invitedUserId: string;
  invitedByUserId: string;
  role: string;
  status: string;
  createdAt: string;
  expiredAt: string;
}

