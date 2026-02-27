import { RejectInvitationService } from "../../../backend/src/modules/invitations/application/services/reject_invitation_service.js";
import { AuditEvent } from "../../../backend/src/modules/audit_events/domain/audit_event_domain.js";
import { AuditEventActions } from "../../../backend/src/modules/audit_events/domain/audit_event_actions.js";

describe("RejectInvitationService", () => {

    let rejectUseCase: any;
    let auditAppender: any;
    let service: RejectInvitationService;

    const actorId = "user-1";
    const invitationId = "inv-1";
    const orgId = "org-1";

    beforeEach(() => {

        rejectUseCase = {
            execute: jest.fn(),
        };

        auditAppender = {
            execute: jest.fn(),
        };

        service = new RejectInvitationService(
            rejectUseCase,
            auditAppender
        );
    });

    // --------------------------------------------------
    // HAPPY PATH
    // --------------------------------------------------

    it("should execute reject use case and write audit event", async () => {

        const rejectedDto = {
            id: invitationId,
            organizationId: orgId,
            invitedUserId: actorId,
            invitedByUserId: "owner-1",
            role: "MEMBER",
            status: "REJECTED",
            createdAt: new Date(),
            expiredAt: new Date(),
        };

        rejectUseCase.execute.mockResolvedValue(rejectedDto);

        const result = await service.executeTx(actorId, invitationId);

        // use case called
        expect(rejectUseCase.execute)
            .toHaveBeenCalledWith(actorId, invitationId);

        // audit written
        expect(auditAppender.execute).toHaveBeenCalledTimes(1);

        const auditArg = auditAppender.execute.mock.calls[0][0];

        expect(auditArg).toBeInstanceOf(AuditEvent);

        expect(auditArg.getActorId()).toBe(actorId);
        expect(auditArg.getOrganizationId()).toBe(orgId);
        expect(auditArg.getAction())
            .toBe(AuditEventActions.INVITATION_REJECTED);

        // result returned
        expect(result).toBe(rejectedDto);
    });

    // --------------------------------------------------
    // USE CASE FAILS
    // --------------------------------------------------

    it("should not write audit if use case throws", async () => {

        rejectUseCase.execute.mockRejectedValue(
            new Error("Reject failed")
        );

        await expect(
            service.executeTx(actorId, invitationId)
        ).rejects.toThrow("Reject failed");

        expect(auditAppender.execute).not.toHaveBeenCalled();
    });

});