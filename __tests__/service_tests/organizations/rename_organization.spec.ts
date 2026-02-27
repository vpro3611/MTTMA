import { RenameWithAudit } from
        "../../../backend/src/modules/organization/application/service/rename_with_audit.js";

import { AuditEventActions } from
        "../../../backend/src/modules/audit_events/domain/audit_event_actions.js";

describe("RenameWithAudit (unit)", () => {

    const ORG_ID = "org-1";
    const ACTOR_ID = "user-1";
    const NEW_NAME = "New Name";

    let renameUseCase: any;
    let appendAudit: any;
    let service: RenameWithAudit;

    beforeEach(() => {
        renameUseCase = {
            execute: jest.fn()
        };

        appendAudit = {
            execute: jest.fn()
        };

        service = new RenameWithAudit(
            renameUseCase,
            appendAudit
        );
    });

    /* ===================== HAPPY PATH ===================== */

    it("should rename organization and write audit", async () => {

        const fakeOrgDto = {
            id: ORG_ID,
            name: NEW_NAME,
            createdAt: new Date()
        };

        renameUseCase.execute.mockResolvedValue(fakeOrgDto);
        appendAudit.execute.mockResolvedValue(undefined);

        const result = await service.executeTx(
            ORG_ID,
            NEW_NAME,
            ACTOR_ID
        );

        // 1️⃣ rename вызывается
        expect(renameUseCase.execute)
            .toHaveBeenCalledWith(ORG_ID, NEW_NAME, ACTOR_ID);

        // 2️⃣ audit вызывается
        expect(appendAudit.execute).toHaveBeenCalledTimes(1);

        const auditArg = appendAudit.execute.mock.calls[0][0];

        expect(auditArg.getActorId()).toBe(ACTOR_ID);
        expect(auditArg.getOrganizationId()).toBe(ORG_ID);
        expect(auditArg.getAction())
            .toBe(AuditEventActions.ORGANIZATION_RENAMED);

        // 3️⃣ возвращается DTO
        expect(result).toEqual(fakeOrgDto);
    });

    /* ===================== RENAME FAIL ===================== */

    it("should not write audit if rename fails", async () => {

        renameUseCase.execute.mockRejectedValue(
            new Error("rename failed")
        );

        await expect(
            service.executeTx(ORG_ID, NEW_NAME, ACTOR_ID)
        ).rejects.toThrow("rename failed");

        expect(appendAudit.execute).not.toHaveBeenCalled();
    });

    /* ===================== AUDIT FAIL ===================== */

    it("should propagate error if audit writing fails", async () => {

        const fakeOrgDto = {
            id: ORG_ID,
            name: NEW_NAME,
            createdAt: new Date()
        };

        renameUseCase.execute.mockResolvedValue(fakeOrgDto);

        appendAudit.execute.mockRejectedValue(
            new Error("audit failed")
        );

        await expect(
            service.executeTx(ORG_ID, NEW_NAME, ACTOR_ID)
        ).rejects.toThrow("audit failed");
    });
});
