import { CreateInvitationService } from "../../../src/modules/invitations/application/services/create_invitation_service.js";
import { AuditEvent } from "../../../src/modules/audit_events/domain/audit_event_domain.js";
import { AuditEventActions } from "../../../src/modules/audit_events/domain/audit_event_actions.js";
import { OrgMemsRole } from "../../../src/modules/organization_members/domain/org_members_role.js";

describe("CreateInvitationService", () => {

    let createUseCase: any;
    let auditAppender: any;
    let service: CreateInvitationService;

    const dto = {
        organizationId: "org-1",
        invitedUserId: "user-2",
        actorId: "owner-1",
        role: OrgMemsRole.MEMBER,
    };

    beforeEach(() => {

        createUseCase = {
            execute: jest.fn(),
        };

        auditAppender = {
            execute: jest.fn(),
        };

        service = new CreateInvitationService(
            createUseCase,
            auditAppender
        );
    });

    // --------------------------------------------------
    // HAPPY PATH
    // --------------------------------------------------

    it("should execute create use case and write audit event", async () => {

        const createdDto = {
            id: "inv-1",
            organizationId: dto.organizationId,
            invitedUserId: dto.invitedUserId,
            invitedByUserId: dto.actorId,
            role: dto.role,
            status: "PENDING",
            createdAt: new Date(),
            expiredAt: new Date(),
        };

        createUseCase.execute.mockResolvedValue(createdDto);

        const result = await service.executeTx(dto);

        // use case called correctly
        expect(createUseCase.execute).toHaveBeenCalledWith(dto);

        // audit written
        expect(auditAppender.execute).toHaveBeenCalledTimes(1);

        const auditArg = auditAppender.execute.mock.calls[0][0];

        expect(auditArg).toBeInstanceOf(AuditEvent);

        expect(auditArg.getActorId()).toBe(dto.actorId);
        expect(auditArg.getOrganizationId()).toBe(dto.organizationId);
        expect(auditArg.getAction())
            .toBe(AuditEventActions.INVITATION_CREATED);

        // result returned
        expect(result).toBe(createdDto);
    });

    // --------------------------------------------------
    // USE CASE FAILS
    // --------------------------------------------------

    it("should not write audit if use case throws", async () => {

        createUseCase.execute.mockRejectedValue(
            new Error("Create failed")
        );

        await expect(
            service.executeTx(dto)
        ).rejects.toThrow("Create failed");

        expect(auditAppender.execute).not.toHaveBeenCalled();
    });

});