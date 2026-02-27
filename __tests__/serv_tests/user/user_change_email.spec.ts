import { ChangeEmailServ } from "../../../backend/src/modules/user/controller/services/change_email_serv.js";
import { ChangeEmailService } from "../../../backend/src/modules/user/application/service/change_email.js";

jest.mock(
    "../../../backend/src/modules/user/application/service/change_email.js",
    () => ({
        ChangeEmailService: jest.fn(),
    })
);

describe("ChangeEmailServ", () => {

    let txManager: any;
    let service: ChangeEmailServ;

    beforeEach(() => {

        const fakeUser = {
            id: "user-1",
            email: "updated@mail.com"
        };

        (ChangeEmailService as jest.Mock)
            .mockImplementation(() => ({
                executeTx: jest.fn().mockResolvedValue(fakeUser),
            }));

        txManager = {
            runInTransaction: jest.fn((callback) => callback({}))
        };

        service = new ChangeEmailServ(txManager);
    });

    it("should execute change email inside transaction", async () => {

        const result = await service.changeEmailS("user-1", "new@mail.com");

        expect(txManager.runInTransaction).toHaveBeenCalled();

        expect(result).toEqual({
            id: "user-1",
            email: "updated@mail.com"
        });
    });

});
