import { CreateOrganizationWithAudit } from
        "../../../backend/src/modules/organization/application/service/create_with_audit.js";

import { AuditEventActions } from
        "../../../backend/src/modules/audit_events/domain/audit_event_actions.js";

describe("CreateOrganizationWithAudit (unit)", () => {

    const ACTOR_ID = "user-1";
    const ORG_ID = "org-1";

    let createOrganization: any;
    let appendAudit: any;
    let service: CreateOrganizationWithAudit;

    beforeEach(() => {
        createOrganization = {
            execute: jest.fn()
        };

        appendAudit = {
            execute: jest.fn()
        };

        service = new CreateOrganizationWithAudit(
            createOrganization,
            appendAudit
        );
    });

    /* ===================== HAPPY PATH ===================== */

    it("should create organization and write audit", async () => {

        const fakeOrgDto = {
            id: ORG_ID,
            name: "Test Org",
            createdAt: new Date()
        };

        createOrganization.execute.mockResolvedValue(fakeOrgDto);
        appendAudit.execute.mockResolvedValue(undefined);

        const result = await service.executeTx(
            "Test Org",
            ACTOR_ID
        );

        // 1️⃣ проверяем что организация создаётся
        expect(createOrganization.execute)
            .toHaveBeenCalledWith("Test Org", ACTOR_ID);

        // 2️⃣ проверяем что аудит создаётся
        expect(appendAudit.execute).toHaveBeenCalledTimes(1);

        const auditArg = appendAudit.execute.mock.calls[0][0];

        expect(auditArg.getActorId()).toBe(ACTOR_ID);
        expect(auditArg.getOrganizationId()).toBe(ORG_ID);
        expect(auditArg.getAction())
            .toBe(AuditEventActions.ORGANIZATION_CREATED);

        // 3️⃣ возвращается DTO организации
        expect(result).toEqual(fakeOrgDto);
    });

    /* ===================== CREATE FAIL ===================== */

    it("should not write audit if organization creation fails", async () => {

        createOrganization.execute.mockRejectedValue(
            new Error("create failed")
        );

        await expect(
            service.executeTx("Test Org", ACTOR_ID)
        ).rejects.toThrow("create failed");

        expect(appendAudit.execute).not.toHaveBeenCalled();
    });

    /* ===================== AUDIT FAIL ===================== */

    it("should propagate error if audit writing fails", async () => {

        const fakeOrgDto = {
            id: ORG_ID,
            name: "Test Org",
            createdAt: new Date()
        };

        createOrganization.execute.mockResolvedValue(fakeOrgDto);

        appendAudit.execute.mockRejectedValue(
            new Error("audit failed")
        );

        await expect(
            service.executeTx("Test Org", ACTOR_ID)
        ).rejects.toThrow("audit failed");
    });
});
