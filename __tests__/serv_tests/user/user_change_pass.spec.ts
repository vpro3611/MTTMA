import { ChangePassServ } from "../../../backend/src/modules/user/controller/services/change_pass_serv.js";
import { ChangePassService } from "../../../backend/src/modules/user/application/service/change_pass.js";

jest.mock(
    "../../../backend/src/modules/user/application/service/change_pass.js",
    () => ({
        ChangePassService: jest.fn(),
    })
);

describe("ChangePassServ", () => {

    let txManager: any;
    let service: ChangePassServ;

    beforeEach(() => {

        const fakeUser = {
            id: "user-1",
            email: "updated@mail.com"
        };

        (ChangePassService as jest.Mock)
            .mockImplementation(() => ({
                executeTx: jest.fn().mockResolvedValue(fakeUser),
            }));

        txManager = {
            runInTransaction: jest.fn((callback) => callback({}))
        };

        service = new ChangePassServ(txManager);
    });

    it("should execute change password inside transaction", async () => {

        const result = await service.changePassS("user-1", "old", "new");

        expect(txManager.runInTransaction).toHaveBeenCalled();

        expect(result).toEqual({
            id: "user-1",
            email: "updated@mail.com"
        });
    });

});
