import { GetAuditByIdServ } from
        "../../../backend/src/modules/audit_events/controllers/services/get_audit_by_id_serv.js";

import { GetAllAuditWithAudit } from
        "../../../backend/src/modules/audit_events/application/service/get_audit_byId_with_audit.js";

jest.mock(
    "../../../backend/src/modules/audit_events/application/service/get_audit_byId_with_audit.js",
    () => ({
        GetAllAuditWithAudit: jest.fn(),
    })
);

describe("GetAuditByIdServ", () => {

    let txManager: any;
    let mockProxyInstance: any;
    let service: GetAuditByIdServ;

    const actorId = "actor-id";
    const orgId = "org-id";

    beforeEach(() => {

        mockProxyInstance = {
            executeTx: jest.fn().mockResolvedValue([
                { id: "audit-1" },
                { id: "audit-2" },
            ])
        };

        (GetAllAuditWithAudit as jest.Mock)
            .mockImplementation(() => mockProxyInstance);

        txManager = {
            runInTransaction: jest.fn((callback) => callback({}))
        };

        service = new GetAuditByIdServ(txManager);
    });

    /**
     * ✅ Happy path
     */
    it("should execute get audit inside transaction", async () => {

        const result = await service.getAuditByOrgIdS(actorId, orgId);

        expect(txManager.runInTransaction).toHaveBeenCalledTimes(1);

        expect(mockProxyInstance.executeTx)
            .toHaveBeenCalledWith(actorId, orgId);

        expect(result).toEqual([
            { id: "audit-1" },
            { id: "audit-2" },
        ]);
    });

    /**
     * ❌ Should propagate error
     */
    it("should throw if use case fails", async () => {

        mockProxyInstance.executeTx
            .mockRejectedValue(new Error("audit failed"));

        await expect(
            service.getAuditByOrgIdS(actorId, orgId)
        ).rejects.toThrow("audit failed");

        expect(txManager.runInTransaction).toHaveBeenCalledTimes(1);
    });

});
