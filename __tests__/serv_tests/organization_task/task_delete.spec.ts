import { DeleteTaskServ } from "../../../backend/src/modules/organization_task/controller/services/delete_task_serv.js";
import { DeleteTaskWithAudit } from "../../../backend/src/modules/organization_task/application/service/delete_task_with_audit.js";

jest.mock(
    "../../../backend/src/modules/organization_task/application/service/delete_task_with_audit.js",
    () => ({
        DeleteTaskWithAudit: jest.fn(),
    })
);

describe("DeleteTaskServ", () => {

    let txManager: any;
    let mockExecute: jest.Mock;
    let service: DeleteTaskServ;

    const dto = {
        taskId: "task-1",
        orgId: "org-1",
        userId: "user-1",
    };

    beforeEach(() => {

        mockExecute = jest.fn().mockResolvedValue("deleted-task");

        (DeleteTaskWithAudit as jest.Mock)
            .mockImplementation(() => ({
                executeTx: mockExecute
            }));

        txManager = {
            runInTransaction: jest.fn((callback) => callback({}))
        };

        service = new DeleteTaskServ(txManager);
    });

    /**
     * ✅ should execute inside transaction
     */
    it("should execute delete task inside transaction", async () => {

        const result = await service.deleteTaskS(dto as any);

        expect(txManager.runInTransaction).toHaveBeenCalled();

        expect(mockExecute).toHaveBeenCalledWith(dto);

        expect(result).toBe("deleted-task");
    });

    /**
     * ❌ should propagate error
     */
    it("should propagate error if executeTx fails", async () => {

        const error = new Error("Failure");

        mockExecute.mockRejectedValue(error);

        await expect(service.deleteTaskS(dto as any))
            .rejects.toThrow("Failure");
    });

});
