import { ChangeStatusServ } from "../../../src/modules/organization_task/controller/services/change_status_serv.js";
import { ChangeTaskStatusWithAudit } from "../../../src/modules/organization_task/application/service/change_status_with_audit.js";

jest.mock(
    "../../../src/modules/organization_task/application/service/change_status_with_audit.js",
    () => ({
        ChangeTaskStatusWithAudit: jest.fn(),
    })
);

describe("ChangeStatusServ", () => {

    let txManager: any;
    let mockExecute: jest.Mock;
    let service: ChangeStatusServ;

    const dto = {
        taskId: "task-1",
        orgId: "org-1",
        userId: "user-1",
        newStatus: "DONE"
    };

    beforeEach(() => {

        mockExecute = jest.fn().mockResolvedValue("updated-status");

        (ChangeTaskStatusWithAudit as jest.Mock)
            .mockImplementation(() => ({
                executeTx: mockExecute
            }));

        txManager = {
            runInTransaction: jest.fn((callback) => callback({}))
        };

        service = new ChangeStatusServ(txManager);
    });

    /**
     * ✅ should execute inside transaction
     */
    it("should execute change status inside transaction", async () => {

        const result = await service.changeStatusS(dto as any);

        expect(txManager.runInTransaction).toHaveBeenCalled();

        expect(mockExecute).toHaveBeenCalledWith(dto);

        expect(result).toBe("updated-status");
    });

    /**
     * ❌ should propagate error
     */
    it("should propagate error if executeTx fails", async () => {

        const error = new Error("Failure");

        mockExecute.mockRejectedValue(error);

        await expect(service.changeStatusS(dto as any))
            .rejects.toThrow("Failure");
    });

});
