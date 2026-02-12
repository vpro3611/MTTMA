import { ChangeEmailService } from
    "../../../src/modules/user/application/service/change_email.js";

import { ChangeUserEmailUseCase } from
        "../../../src/modules/user/application/change_user_email_use_case.js";

describe("ChangeEmailService (transactional)", () => {

    const USER_ID = "user-1";
    const NEW_EMAIL = "new@test.com";

    let changeEmailUseCase: jest.Mocked<ChangeUserEmailUseCase>;
    let service: ChangeEmailService;

    const fakeUserDto = {
        id: USER_ID,
        email: NEW_EMAIL,
        status: "ACTIVE",
        created_at: new Date(),
    };

    beforeEach(() => {

        changeEmailUseCase = {
            execute: jest.fn(),
        } as any;

        service = new ChangeEmailService(changeEmailUseCase);
    });

    /* ===================== HAPPY PATH ===================== */

    it("should call use case and return user dto", async () => {

        changeEmailUseCase.execute.mockResolvedValue(fakeUserDto);

        const result = await service.executeTx(USER_ID, NEW_EMAIL);

        expect(changeEmailUseCase.execute)
            .toHaveBeenCalledWith(USER_ID, NEW_EMAIL);

        expect(result).toEqual(fakeUserDto);
    });

    /* ===================== ERROR PROPAGATION ===================== */

    it("should propagate error if use case fails", async () => {

        changeEmailUseCase.execute
            .mockRejectedValue(new Error("email invalid"));

        await expect(
            service.executeTx(USER_ID, NEW_EMAIL)
        ).rejects.toThrow("email invalid");

        expect(changeEmailUseCase.execute)
            .toHaveBeenCalledWith(USER_ID, NEW_EMAIL);
    });

});
