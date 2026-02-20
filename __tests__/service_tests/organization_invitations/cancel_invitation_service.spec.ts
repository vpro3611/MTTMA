import { CancelInvitationService } from "../../../src/modules/invitations/application/services/cancel_invitation_service.js";
import { AuditEventActions } from "../../../src/modules/audit_events/domain/audit_event_actions.js";
import { AuditEvent } from "../../../src/modules/audit_events/domain/audit_event_domain.js";

describe("CancelInvitationService", () => {

    let cancelUseCase: any;
    let auditAppender: any;
    let service: CancelInvitationService;

    const actorId = "owner-1";
    const invitationId = "inv-1";
    const orgId = "org-1";

    beforeEach(() => {

        cancelUseCase = {
            execute: jest.fn(),
        };

        auditAppender = {
            execute: jest.fn(),
        };

        service = new CancelInvitationService(
            cancelUseCase,
            auditAppender
        );
    });

    // --------------------------------------------------
    // HAPPY PATH
    // --------------------------------------------------

    it("should execute cancel use case and write audit event", async () => {

        const cancelledDto = {
            id: invitationId,
            organizationId: orgId,
            invitedUserId: "user-2",
            invitedByUserId: actorId,
            role: "MEMBER",
            status: "CANCELED",
            createdAt: new Date(),
            expiredAt: new Date(),
        };

        cancelUseCase.execute.mockResolvedValue(cancelledDto);

        const result = await service.executeTx(actorId, invitationId);

        // use case called
        expect(cancelUseCase.execute)
            .toHaveBeenCalledWith(actorId, invitationId);

        // audit written
        expect(auditAppender.execute).toHaveBeenCalledTimes(1);

        const auditArg = auditAppender.execute.mock.calls[0][0];

        expect(auditArg).toBeInstanceOf(AuditEvent);

        // через геттеры
        expect(auditArg.getActorId()).toBe(actorId);
        expect(auditArg.getOrganizationId()).toBe(orgId);
        expect(auditArg.getAction())
            .toBe(AuditEventActions.INVITATION_CANCELED);

        // result returned
        expect(result).toBe(cancelledDto);
    });

    // --------------------------------------------------
    // USE CASE FAILS
    // --------------------------------------------------

    it("should not write audit if use case throws", async () => {

        cancelUseCase.execute.mockRejectedValue(
            new Error("Cancel failed")
        );

        await expect(
            service.executeTx(actorId, invitationId)
        ).rejects.toThrow("Cancel failed");

        expect(auditAppender.execute).not.toHaveBeenCalled();
    });

});