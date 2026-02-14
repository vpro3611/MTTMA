import { ChangePassServ } from "../../src/modules/user/controller/services/change_pass_serv.js";
import { ChangePassService } from "../../src/modules/user/application/service/change_pass.js";

jest.mock("../../src/modules/user/application/service/change_pass.js");

describe("ChangePassServ", () => {

    let txManager: any;
    let mockChangePassServiceInstance: any;
    let service: ChangePassServ;

    beforeEach(() => {

        mockChangePassServiceInstance = {
            executeTx: jest.fn().mockResolvedValue("password-updated"),
        };

        (ChangePassService as jest.Mock)
            .mockImplementation(() => mockChangePassServiceInstance);

        txManager = {
            runInTransaction: jest.fn((callback) => {
                return callback({});
            }),
        };

        service = new ChangePassServ(
            {} as any,
            txManager
        );
    });

    it("should execute change password inside transaction", async () => {

        const result = await service.changePassS("user-1", "old", "new");

        expect(txManager.runInTransaction).toHaveBeenCalled();

        expect(mockChangePassServiceInstance.executeTx)
            .toHaveBeenCalledWith("user-1", "old", "new");

        expect(result).toBe("password-updated");
    });

});
