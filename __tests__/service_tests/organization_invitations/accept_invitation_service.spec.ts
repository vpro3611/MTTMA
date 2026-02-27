import { AcceptInvitationService } from "../../../backend/src/modules/invitations/application/services/accept_invitation_service.js";
import { AuditEventActions } from "../../../backend/src/modules/audit_events/domain/audit_event_actions.js";
import { AuditEvent } from "../../../backend/src/modules/audit_events/domain/audit_event_domain.js";

describe("AcceptInvitationService", () => {

    let acceptUseCase: any;
    let auditAppender: any;
    let service: AcceptInvitationService;

    const actorId = "user-1";
    const invitationId = "inv-1";
    const orgId = "org-1";

    beforeEach(() => {

        acceptUseCase = {
            execute: jest.fn(),
        };

        auditAppender = {
            execute: jest.fn(),
        };

        service = new AcceptInvitationService(
            acceptUseCase,
            auditAppender
        );
    });

    // --------------------------------------------------
    // HAPPY PATH
    // --------------------------------------------------

    it("should execute use case and write audit event", async () => {

        const acceptedDto = {
            id: invitationId,
            organizationId: orgId,
            invitedUserId: actorId,
            invitedByUserId: "owner-1",
            role: "MEMBER",
            status: "ACCEPTED",
            createdAt: new Date(),
            expiredAt: new Date(),
        };

        acceptUseCase.execute.mockResolvedValue(acceptedDto);

        const result = await service.executeTx(actorId, invitationId);

        // use case called
        expect(acceptUseCase.execute)
            .toHaveBeenCalledWith(actorId, invitationId);

        // audit written
        expect(auditAppender.execute)
            .toHaveBeenCalledTimes(1);

        const auditArg = auditAppender.execute.mock.calls[0][0];

        expect(auditArg).toBeInstanceOf(AuditEvent);
        expect(auditArg.getActorId()).toBe(actorId);
        expect(auditArg.getOrganizationId()).toBe(orgId);
        expect(auditArg.getAction()).toBe(AuditEventActions.INVITATION_ACCEPTED);

        // result returned
        expect(result).toBe(acceptedDto);
    });

    // --------------------------------------------------
    // USE CASE FAILS
    // --------------------------------------------------

    it("should not write audit if use case throws", async () => {

        acceptUseCase.execute.mockRejectedValue(
            new Error("Something failed")
        );

        await expect(
            service.executeTx(actorId, invitationId)
        ).rejects.toThrow("Something failed");

        expect(auditAppender.execute).not.toHaveBeenCalled();
    });

});