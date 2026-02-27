

import { GetFilterAuditWithAudit } from
        "../../../backend/src/modules/audit_events/application/service/get_filter_audit_with_audit.js";

import { AuditEventActions } from
        "../../../backend/src/modules/audit_events/domain/audit_event_actions.js";

describe("GetFilterAuditWithAudit (unit)", () => {

    const ACTOR_ID = "user-1";
    const ORG_ID = "org-1";

    let filteredAudit: any;
    let writeAudit: any;
    let service: GetFilterAuditWithAudit;

    const baseQuery = {
        actorId: ACTOR_ID,
        orgId: ORG_ID,
        filters: {
            limit: 10
        }
    };

    beforeEach(() => {
        filteredAudit = {
            execute: jest.fn()
        };

        writeAudit = {
            execute: jest.fn()
        };

        service = new GetFilterAuditWithAudit(
            filteredAudit,
            writeAudit
        );
    });

    /* ===================== HAPPY PATH ===================== */

    it("should write audit and return filtered audit result", async () => {

        const fakeResult = [
            { id: "1" },
            { id: "2" }
        ];

        filteredAudit.execute.mockResolvedValue(fakeResult);
        writeAudit.execute.mockResolvedValue(undefined);

        const result = await service.executeTx(baseQuery);

        // Проверяем что write был вызван
        expect(writeAudit.execute).toHaveBeenCalledTimes(1);

        const auditArg = writeAudit.execute.mock.calls[0][0];

        expect(auditArg.getActorId()).toBe(ACTOR_ID);
        expect(auditArg.getOrganizationId()).toBe(ORG_ID);
        expect(auditArg.getAction())
            .toBe(AuditEventActions.GET_AUDIT_EVENTS_FILTERED);

        // Проверяем что read вызван
        expect(filteredAudit.execute)
            .toHaveBeenCalledWith(baseQuery);

        expect(result).toEqual(fakeResult);
    });

    /* ===================== ERROR: WRITE FAIL ===================== */

    it("should propagate error if writeAudit fails", async () => {

        writeAudit.execute.mockRejectedValue(
            new Error("write failed")
        );

        await expect(
            service.executeTx(baseQuery)
        ).rejects.toThrow("write failed");

        expect(filteredAudit.execute).not.toHaveBeenCalled();
    });

    /* ===================== ERROR: READ FAIL ===================== */

    it("should propagate error if filteredAudit fails", async () => {

        writeAudit.execute.mockResolvedValue(undefined);
        filteredAudit.execute.mockRejectedValue(
            new Error("read failed")
        );

        await expect(
            service.executeTx(baseQuery)
        ).rejects.toThrow("read failed");
    });
});
