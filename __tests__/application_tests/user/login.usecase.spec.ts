

import { LoginUseCase } from "../../../backend/src/modules/user/application/login_use_case.js";
import { UserNotFound } from "../../../backend/src/modules/user/errors/user_repository_errors.js";
import { InvalidCredentialsError } from "../../../backend/src/modules/user/errors/login_errors.js";

describe("LoginUseCase", () => {

    let userRepo: any;
    let passwordHasher: any;
    let useCase: LoginUseCase;

    let mockUser: any;
    let mockBannedUser: any;

    beforeEach(() => {

        userRepo = {
            findByEmail: jest.fn(),
        };

        passwordHasher = {
            compare: jest.fn(),
        };

        mockUser = {
            id: "user-1",
            getEmail: () => ({ getValue: () => "test@test.com" }),
            getStatus: () => "ACTIVE",
            getCreatedAt: () => new Date("2024-01-01"),
            getPasswordHash: () => "hashed-pass",
            checkUserStatus: jest.fn(),
        };

        mockBannedUser = {
            id: "user-1",
            getEmail: () => ({ getValue: () => "test@test.com" }),
            getStatus: () => "BANNED",
            getCreatedAt: () => new Date("2024-01-01"),
            getPasswordHash: () => "hashed-pass",
            checkUserStatus: jest.fn(),
        }

        useCase = new LoginUseCase(userRepo, passwordHasher);
    });

    /**
     * ✅ Happy path
     */
    it("should login successfully and return UserResponseDto", async () => {

        userRepo.findByEmail.mockResolvedValue(mockUser);
        passwordHasher.compare.mockResolvedValue(true);

        const result = await useCase.execute("test@test.com", "plain-pass");

        expect(userRepo.findByEmail).toHaveBeenCalled();
        expect(passwordHasher.compare)
            .toHaveBeenCalledWith("plain-pass", "hashed-pass");

        expect(result).toEqual({
            id: "user-1",
            email: "test@test.com",
            status: "ACTIVE",
            created_at: new Date("2024-01-01"),
        });
    });

    /**
     * ❌ User not found
     */
    it("should throw UserNotFound if user does not exist", async () => {

        userRepo.findByEmail.mockResolvedValue(null);

        await expect(
            useCase.execute("test@test.com", "plain-pass")
        ).rejects.toBeInstanceOf(UserNotFound);
    });

    /**
     * ❌ Invalid password
     */
    it("should throw InvalidCredentialsError if password invalid", async () => {

        userRepo.findByEmail.mockResolvedValue(mockUser);
        passwordHasher.compare.mockResolvedValue(false);

        await expect(
            useCase.execute("test@test.com", "wrong-pass")
        ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    /**
     * ❌ Inactive user
     */
    it("should throw if user status invalid", async () => {

        userRepo.findByEmail.mockResolvedValue(mockUser);
        passwordHasher.compare.mockResolvedValue(true);

        mockUser.checkUserStatus.mockImplementation(() => {
            throw new Error("User inactive");
        });

        await expect(
            useCase.execute("test@test.com", "plain-pass")
        ).rejects.toThrow("User inactive");
    });

    it ("should throw if user is banned", async () => {
        userRepo.findByEmail.mockResolvedValue(mockBannedUser);
        passwordHasher.compare.mockResolvedValue(true);

        mockBannedUser.checkUserStatus.mockImplementation(() => {
            throw new Error("User banned");
        })

        await expect(
            useCase.execute("test@test.com", "plain-pass")
        ).rejects.toThrow(
            "User banned"
        );
    })
});
