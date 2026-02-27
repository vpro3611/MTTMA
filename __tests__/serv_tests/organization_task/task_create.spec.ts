import { CreateTaskServ } from "../../../backend/src/modules/organization_task/controller/services/create_task_serv.js";
import { CreateTaskWithAudit } from "../../../backend/src/modules/organization_task/application/service/create_task_with_audit.js";

jest.mock(
    "../../../backend/src/modules/organization_task/application/service/create_task_with_audit.js",
    () => ({
        CreateTaskWithAudit: jest.fn(),
    })
);

describe("CreateTaskServ", () => {

    let txManager: any;
    let mockExecute: jest.Mock;
    let service: CreateTaskServ;

    const dto = {
        orgId: "org-1",
        userId: "user-1",
        title: "New task",
        description: "Task description"
    };

    beforeEach(() => {

        mockExecute = jest.fn().mockResolvedValue("created-task");

        (CreateTaskWithAudit as jest.Mock)
            .mockImplementation(() => ({
                executeTx: mockExecute
            }));

        txManager = {
            runInTransaction: jest.fn((callback) => callback({}))
        };

        service = new CreateTaskServ(txManager);
    });

    /**
     * ✅ should execute inside transaction
     */
    it("should execute create task inside transaction", async () => {

        const result = await service.createTaskS(dto as any);

        expect(txManager.runInTransaction).toHaveBeenCalled();

        expect(mockExecute).toHaveBeenCalledWith(dto);

        expect(result).toBe("created-task");
    });

    /**
     * ❌ should propagate error
     */
    it("should propagate error if executeTx fails", async () => {

        const error = new Error("Failure");

        mockExecute.mockRejectedValue(error);

        await expect(service.createTaskS(dto as any))
            .rejects.toThrow("Failure");
    });

});
