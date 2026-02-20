import { ChangePassService } from
        "../../../src/modules/user/application/service/change_pass.js";

import { ChangePasswordUseCase } from
        "../../../src/modules/user/application/change_pass_use_case.js";

describe("ChangePassService (transactional)", () => {

    const USER_ID = "user-1";
    const OLD_PASS = "old-pass";
    const NEW_PASS = "new-pass";

    let changePassUseCase: jest.Mocked<ChangePasswordUseCase>;
    let service: ChangePassService;

    const fakeUserDto = {
        id: USER_ID,
        email: "user@test.com",
        status: "ACTIVE",
        created_at: new Date(),
    };

    beforeEach(() => {

        changePassUseCase = {
            execute: jest.fn(),
        } as any;

        service = new ChangePassService(changePassUseCase);
    });

    /* ===================== HAPPY PATH ===================== */

    it("should call use case and return user dto", async () => {

        changePassUseCase.execute
            .mockResolvedValue(fakeUserDto);

        const result = await service.executeTx(
            USER_ID,
            OLD_PASS,
            NEW_PASS
        );

        expect(changePassUseCase.execute)
            .toHaveBeenCalledWith(
                USER_ID,
                OLD_PASS,
                NEW_PASS
            );

        expect(result).toEqual(fakeUserDto);
    });

    /* ===================== ERROR PROPAGATION ===================== */

    it("should propagate error if use case fails", async () => {

        changePassUseCase.execute
            .mockRejectedValue(new Error("invalid password"));

        await expect(
            service.executeTx(USER_ID, OLD_PASS, NEW_PASS)
        ).rejects.toThrow("invalid password");

        expect(changePassUseCase.execute)
            .toHaveBeenCalledWith(
                USER_ID,
                OLD_PASS,
                NEW_PASS
            );
    });

});
