import { ViewOrganizationServiceWithAudit } from
        "../../../backend/src/modules/organization/application/service/view_organization_service_with_audit.js";

import { AuditEvent } from
        "../../../backend/src/modules/audit_events/domain/audit_event_domain.js";

import { AuditEventActions } from
        "../../../backend/src/modules/audit_events/domain/audit_event_actions.js";

describe("ViewOrganizationServiceWithAudit", () => {

    let useCase: any;
    let auditWrite: any;
    let service: ViewOrganizationServiceWithAudit;

    const actorId = "user-1";
    const orgId = "org-1";

    beforeEach(() => {

        useCase = {
            execute: jest.fn(),
        };

        auditWrite = {
            execute: jest.fn(),
        };

        service = new ViewOrganizationServiceWithAudit(
            useCase,
            auditWrite
        );
    });

    /**
     * ✅ Happy path
     */
    it("should call use case and write audit event", async () => {

        const orgDto = {
            id: orgId,
            name: "Test Org",
            createdAt: new Date(),
        };

        useCase.execute.mockResolvedValue(orgDto);

        const result = await service.executeTx(actorId, orgId);

        expect(useCase.execute)
            .toHaveBeenCalledWith(actorId, orgId);

        expect(auditWrite.execute).toHaveBeenCalledTimes(1);

        const auditArg = auditWrite.execute.mock.calls[0][0];

        expect(auditArg).toBeInstanceOf(AuditEvent);
        expect(auditArg.getActorId()).toBe(actorId);
        expect(auditArg.getOrganizationId()).toBe(orgId);
        expect(auditArg.getAction())
            .toBe(AuditEventActions.ORGANIZATION_VIEWED);

        expect(result).toBe(orgDto);
    });

    /**
     * ❌ Use case throws
     */
    it("should not write audit if use case fails", async () => {

        useCase.execute.mockRejectedValue(
            new Error("View failed")
        );

        await expect(
            service.executeTx(actorId, orgId)
        ).rejects.toThrow("View failed");

        expect(auditWrite.execute).not.toHaveBeenCalled();
    });

});