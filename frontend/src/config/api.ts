/** Central API path constants – no hardcoded /pub, /me, /org in feature code */

const PUB = '/pub';
const ME = '/me';
const ORG = '/org';

export const apiPaths = {
  pub: {
    register: `${PUB}/register`,
    login: `${PUB}/login`,
    refresh: `${PUB}/refresh`,
  },
  me: {
    logout: `${ME}/logout`,
    changePass: `${ME}/change_pass`,
    changeEmail: `${ME}/change_email`,
    profile: (targetUserId: string) => `${ME}/${targetUserId}`,
    organizations: `${ME}/organizations`,
    organization: (orgId: string) => `${ME}/organizations/${orgId}`,
    acceptInvitation: (invitationId: string) => `${ME}/${invitationId}/accept`,
    rejectInvitation: (invitationId: string) => `${ME}/${invitationId}/reject`,
    invitations: `${ME}/invitations`,
  },
  org: {
    base: ORG,
    create: `${ORG}/create`,
    byId: (orgId: string) => `${ORG}/${orgId}`,
    rename: (orgId: string) => `${ORG}/${orgId}/rename`,
    delete: (orgId: string) => `${ORG}/${orgId}/delete`,
    view: (orgId: string) => `${ORG}/${orgId}`,
    members: (orgId: string) => `${ORG}/${orgId}/members`,
    hire: (orgId: string) => `${ORG}/${orgId}/hire`,
    fire: (orgId: string, targetUserId: string) => `${ORG}/${orgId}/fire/${targetUserId}`,
    role: (orgId: string, targetUserId: string) => `${ORG}/${orgId}/role/${targetUserId}`,
    tasks: {
      list: (orgId: string) => `${ORG}/${orgId}/tasks`,
      create: (orgId: string) => `${ORG}/${orgId}/tasks/create`,
      byId: (orgId: string, taskId: string) => `${ORG}/${orgId}/tasks/${taskId}`,
      description: (orgId: string, taskId: string) => `${ORG}/${orgId}/tasks/${taskId}/description`,
      title: (orgId: string, taskId: string) => `${ORG}/${orgId}/tasks/${taskId}/title`,
      status: (orgId: string, taskId: string) => `${ORG}/${orgId}/tasks/${taskId}/status`,
      delete: (orgId: string, taskId: string) => `${ORG}/${orgId}/tasks/${taskId}`,
    },
    audit: {
      all: (orgId: string) => `${ORG}/${orgId}/audit_events/all`,
      filtered: (orgId: string) => `${ORG}/${orgId}/audit_events/filtered`,
    },
    invitations: {
      list: (orgId: string) => `${ORG}/${orgId}/invitations`,
      create: (orgId: string, invitedUserId: string) => `${ORG}/${orgId}/invite/${invitedUserId}`,
      cancel: (invitationId: string) => `${ORG}/${invitationId}/cancel`,
    },
  },
} as const;
