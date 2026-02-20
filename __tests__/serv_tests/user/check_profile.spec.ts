import {CheckProfileServ} from "../../../src/modules/user/controller/services/check_profile_serv.js";

describe("CheckProfileServ", () => {

    let txManager: any;
    let service: CheckProfileServ;

    beforeEach(() => {
        txManager = {
            runInTransaction: jest.fn().mockResolvedValue("mock-result")
        };

        service = new CheckProfileServ(txManager);
    });

    it("should call transaction and return result", async () => {

        const result = await service.checkProfileS("actor-1", "target-1");

        expect(txManager.runInTransaction).toHaveBeenCalled();
        expect(result).toBe("mock-result");
    });

    it("should propagate error if transaction fails", async () => {
        const error = new Error("transaction failed");

        txManager.runInTransaction.mockRejectedValue(error);

        await expect(
            service.checkProfileS("actor-1", "target-1")
        ).rejects.toThrow("transaction failed");

        expect(txManager.runInTransaction).toHaveBeenCalledTimes(1);
    });
});


