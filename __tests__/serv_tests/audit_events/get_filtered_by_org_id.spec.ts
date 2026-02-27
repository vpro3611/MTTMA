import { GetFilteredAuditServ } from
        "../../../backend/src/modules/audit_events/controllers/services/get_filtered_audit_serv.js";

import { GetFilterAuditWithAudit } from
        "../../../backend/src/modules/audit_events/application/service/get_filter_audit_with_audit.js";
import {GetAuditEventQuery} from "../../../backend/src/modules/audit_events/DTO/get_audit_event_query.js";

import {AuditEventActions} from "../../../backend/src/modules/audit_events/domain/audit_event_actions.js";

jest.mock(
    "../../../backend/src/modules/audit_events/application/service/get_filter_audit_with_audit.js",
    () => ({
        GetFilterAuditWithAudit: jest.fn(),
    })
);

describe("GetFilteredAuditServ", () => {

    let txManager: any;
    let mockProxyInstance: any;
    let service: GetFilteredAuditServ;

    const queryDto: GetAuditEventQuery = {
        actorId: "actor-id",
        orgId: "org-id",
        filters: {
            action: AuditEventActions.GET_AUDIT_EVENTS_FILTERED,
            from: new Date("2024-01-01"),
            to: new Date("2024-12-31"),
            limit: 20,
            offset: 0,
        }
    };

    beforeEach(() => {

        mockProxyInstance = {
            executeTx: jest.fn().mockResolvedValue([
                { id: "audit-1" },
                { id: "audit-2" },
            ])
        };

        (GetFilterAuditWithAudit as jest.Mock)
            .mockImplementation(() => mockProxyInstance);

        txManager = {
            runInTransaction: jest.fn((callback) => callback({}))
        };

        service = new GetFilteredAuditServ(txManager);
    });

    /**
     * ✅ Happy path
     */
    it("should execute filtered audit inside transaction", async () => {

        const result = await service.getFilteredAuditS(queryDto);

        expect(txManager.runInTransaction).toHaveBeenCalledTimes(1);

        expect(mockProxyInstance.executeTx)
            .toHaveBeenCalledWith(queryDto);

        expect(result).toEqual([
            { id: "audit-1" },
            { id: "audit-2" },
        ]);
    });

    /**
     * ❌ Should propagate error
     */
    it("should throw if executeTx fails", async () => {

        mockProxyInstance.executeTx
            .mockRejectedValue(new Error("filter audit failed"));

        await expect(
            service.getFilteredAuditS(queryDto)
        ).rejects.toThrow("filter audit failed");

        expect(txManager.runInTransaction).toHaveBeenCalledTimes(1);
    });

});
