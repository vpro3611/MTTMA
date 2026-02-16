import { ChangeTitleServ } from "../../../src/modules/organization_task/controller/services/change_title_serv.js";
import { ChangeTitleWithAudit } from "../../../src/modules/organization_task/application/service/change_title_with_audit.js";

jest.mock(
    "../../../src/modules/organization_task/application/service/change_title_with_audit.js",
    () => ({
        ChangeTitleWithAudit: jest.fn(),
    })
);

describe("ChangeTitleServ", () => {

    let txManager: any;
    let mockExecute: jest.Mock;
    let service: ChangeTitleServ;

    const dto = {
        taskId: "task-1",
        orgId: "org-1",
        userId: "user-1",
        newTitle: "Updated title"
    };

    beforeEach(() => {

        mockExecute = jest.fn().mockResolvedValue("updated-title");

        (ChangeTitleWithAudit as jest.Mock)
            .mockImplementation(() => ({
                executeTx: mockExecute
            }));

        txManager = {
            runInTransaction: jest.fn((callback) => callback({}))
        };

        service = new ChangeTitleServ(txManager);
    });

    /**
     * ✅ should execute inside transaction
     */
    it("should execute change title inside transaction", async () => {

        const result = await service.changeTitleS(dto as any);

        expect(txManager.runInTransaction).toHaveBeenCalled();

        expect(mockExecute).toHaveBeenCalledWith(dto);

        expect(result).toBe("updated-title");
    });

    /**
     * ❌ should propagate error
     */
    it("should propagate error if executeTx fails", async () => {

        const error = new Error("Failure");

        mockExecute.mockRejectedValue(error);

        await expect(service.changeTitleS(dto as any))
            .rejects.toThrow("Failure");
    });

});
