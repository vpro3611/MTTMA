import { CheckProfileUseCase } from "../../../backend/src/modules/user/application/check_profile_use_case.js";
import { UserNotFound } from "../../../backend/src/modules/user/errors/user_repository_errors.js";

describe("CheckProfileUseCase", () => {

    let userRepo: any;
    let useCase: CheckProfileUseCase;

    let mockActor: any;
    let mockTarget: any;

    beforeEach(() => {

        userRepo = {
            findById: jest.fn(),
        };

        mockActor = {
            id: "actor-1",
            getEmail: () => ({ getValue: () => "actor@test.com" }),
            getStatus: () => "ACTIVE",
            getCreatedAt: () => new Date("2024-01-01"),
            getPasswordHash: () => "hashed-pass",
            checkUserStatus: jest.fn(),
        };

        mockTarget = {
            id: "target-1",
            getEmail: () => ({ getValue: () => "target@test.com" }),
            getStatus: () => "ACTIVE",
            getCreatedAt: () => new Date("2024-02-01"),
            getPasswordHash: () => "target-hash",
            checkUserStatus: jest.fn(),
        };

        useCase = new CheckProfileUseCase(userRepo);
    });

    /**
     * ✅ Actor checks own profile
     */
    it("should return profile with password if actor checks himself", async () => {

        userRepo.findById
            .mockResolvedValueOnce(mockActor)   // actor
            .mockResolvedValueOnce(mockActor);  // target (same id)

        const result = await useCase.execute("actor-1", "actor-1");

        expect(result).toEqual({
            id: "actor-1",
            email: "actor@test.com",
            status: "ACTIVE",
            created_at: new Date("2024-01-01"),
            password: "hashed-pass",
        });

        expect(mockActor.checkUserStatus).toHaveBeenCalled();
    });

    /**
     * ✅ Actor checks another user
     */
    it("should return profile without password when checking another user", async () => {

        userRepo.findById
            .mockResolvedValueOnce(mockActor)
            .mockResolvedValueOnce(mockTarget);

        const result = await useCase.execute("actor-1", "target-1");

        expect(result).toEqual({
            id: "target-1",
            email: "target@test.com",
            status: "ACTIVE",
            created_at: new Date("2024-02-01"),
            password: undefined,
        });
    });

    /**
     * ❌ Actor not found
     */
    it("should throw UserNotFound if actor not found", async () => {

        userRepo.findById.mockResolvedValueOnce(null);

        await expect(
            useCase.execute("actor-1", "target-1")
        ).rejects.toBeInstanceOf(UserNotFound);
    });

    /**
     * ❌ Target not found
     */
    it("should throw UserNotFound if target not found", async () => {

        userRepo.findById
            .mockResolvedValueOnce(mockActor)
            .mockResolvedValueOnce(null);

        await expect(
            useCase.execute("actor-1", "target-1")
        ).rejects.toBeInstanceOf(UserNotFound);
    });

    /**
     * ❌ Actor inactive
     */
    it("should throw if actor status invalid", async () => {

        userRepo.findById
            .mockResolvedValueOnce(mockActor)
            .mockResolvedValueOnce(mockTarget);

        mockActor.checkUserStatus.mockImplementation(() => {
            throw new Error("User inactive");
        });

        await expect(
            useCase.execute("actor-1", "target-1")
        ).rejects.toThrow("User inactive");
    });
});
