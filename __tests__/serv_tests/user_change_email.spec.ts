import { ChangeEmailServ } from "../../src/modules/user/controller/services/change_email_serv.js";
import { ChangeEmailService } from "../../src/modules/user/application/service/change_email.js";

jest.mock("../../src/modules/user/application/service/change_email.js");

describe("ChangeEmailServ", () => {

    let txManager: any;
    let mockChangeEmailServiceInstance: any;
    let service: ChangeEmailServ;

    beforeEach(() => {

        mockChangeEmailServiceInstance = {
            executeTx: jest.fn().mockResolvedValue("updated-user"),
        };

        (ChangeEmailService as jest.Mock)
            .mockImplementation(() => mockChangeEmailServiceInstance);

        txManager = {
            runInTransaction: jest.fn((callback) => {
                return callback({}); // fake client
            }),
        };

        service = new ChangeEmailServ(
            {} as any, // не используется
            txManager
        );
    });

    it("should execute change email inside transaction", async () => {

        const result = await service.changeEmailS("user-1", "new@mail.com");

        expect(txManager.runInTransaction).toHaveBeenCalled();

        expect(mockChangeEmailServiceInstance.executeTx)
            .toHaveBeenCalledWith("user-1", "new@mail.com");

        expect(result).toBe("updated-user");
    });

});
