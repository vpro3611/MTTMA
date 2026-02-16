import { ChangeDescServ } from "../../../src/modules/organization_task/controller/services/change_desc_serv.js";
import { ChangeDescWithAudit } from "../../../src/modules/organization_task/application/service/change_desc_with_audit.js";

jest.mock(
    "../../../src/modules/organization_task/application/service/change_desc_with_audit.js",
    () => ({
        ChangeDescWithAudit: jest.fn(),
    })
);

describe("ChangeDescServ", () => {

    let txManager: any;
    let mockExecute: jest.Mock;
    let service: ChangeDescServ;

    const dto = {
        taskId: "task-1",
        orgId: "org-1",
        userId: "user-1",
        newDescription: "updated description"
    };

    beforeEach(() => {

        mockExecute = jest.fn().mockResolvedValue("updated-task");

        (ChangeDescWithAudit as jest.Mock)
            .mockImplementation(() => ({
                executeTx: mockExecute
            }));

        txManager = {
            runInTransaction: jest.fn((callback) => callback({}))
        };

        service = new ChangeDescServ(txManager);
    });

    /**
     *  should run inside transaction and call executeTx
     */
    it("should execute change description inside transaction", async () => {

        const result = await service.changeDescS(dto as any);

        expect(txManager.runInTransaction).toHaveBeenCalled();

        expect(mockExecute).toHaveBeenCalledWith(dto);

        expect(result).toBe("updated-task");
    });

    /**
     *  should propagate error if executeTx throws
     */
    it("should propagate error if executeTx fails", async () => {

        const error = new Error("Something failed");

        mockExecute.mockRejectedValue(error);

        await expect(service.changeDescS(dto as any))
            .rejects.toThrow("Something failed");
    });

});
