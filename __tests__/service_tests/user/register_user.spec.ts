import { RegisterService } from
        "../../../backend/src/modules/user/application/service/register.js";

import { RegisterUseCase } from
        "../../../backend/src/modules/user/application/register_use_case.js";

describe("RegisterService (transactional)", () => {

    const EMAIL = "test@test.com";
    const PASSWORD = "password123";

    let registerUseCase: jest.Mocked<RegisterUseCase>;
    let service: RegisterService;

    const fakeUserDto = {
        id: "user-1",
        email: EMAIL,
        status: "ACTIVE",
        created_at: new Date(),
    };

    beforeEach(() => {

        registerUseCase = {
            execute: jest.fn(),
        } as any;

        service = new RegisterService(registerUseCase);
    });

    /* ===================== HAPPY PATH ===================== */

    it("should call use case and return registered user", async () => {

        registerUseCase.execute
            .mockResolvedValue(fakeUserDto);

        const result = await service.executeTx(
            EMAIL,
            PASSWORD
        );

        expect(registerUseCase.execute)
            .toHaveBeenCalledWith(
                EMAIL,
                PASSWORD
            );

        expect(result).toEqual(fakeUserDto);
    });

    /* ===================== ERROR PROPAGATION ===================== */

    it("should propagate error if registration fails", async () => {

        registerUseCase.execute
            .mockRejectedValue(new Error("Email already exists"));

        await expect(
            service.executeTx(EMAIL, PASSWORD)
        ).rejects.toThrow("Email already exists");

        expect(registerUseCase.execute)
            .toHaveBeenCalledWith(
                EMAIL,
                PASSWORD
            );
    });

});
