import { SearchOrganizationUseCase } from "../../../src/modules/organization/application/search_organization_use_case.js";
import { UserNotFound } from "../../../src/modules/user/errors/user_repository_errors.js";

describe("SearchOrganizationUseCase", () => {

    let mockSearchRepo: any;
    let mockUserRepo: any;
    let useCase: SearchOrganizationUseCase;

    let mockUser: any;

    beforeEach(() => {

        mockSearchRepo = {
            search: jest.fn()
        };

        mockUser = {
            id: "user-1",
            getStatus: jest.fn().mockReturnValue("ACTIVE"),
            checkUserStatus: jest.fn()
        };

        mockUserRepo = {
            findById: jest.fn()
        };

        useCase = new SearchOrganizationUseCase(
            mockSearchRepo,
            mockUserRepo
        );
    });

    it("should throw UserNotFound if actor does not exist", async () => {

        mockUserRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute("actor-id", { query: "test" })
        ).rejects.toBeInstanceOf(UserNotFound);

        expect(mockSearchRepo.search).not.toHaveBeenCalled();
    });

    it("should throw if user status check fails (e.g. banned)", async () => {

        mockUserRepo.findById.mockResolvedValue(mockUser);

        mockUser.checkUserStatus.mockImplementation(() => {
            throw new Error("User banned");
        });

        await expect(
            useCase.execute("actor-id", { query: "test" })
        ).rejects.toThrow("User banned");

        expect(mockSearchRepo.search).not.toHaveBeenCalled();
    });

    it("should call search if user is active", async () => {

        mockUserRepo.findById.mockResolvedValue(mockUser);

        mockSearchRepo.search.mockResolvedValue([
            { id: "org-1", name: "Test Org" }
        ]);

        const result = await useCase.execute(
            "actor-id",
            { query: "test" }
        );

        expect(mockUser.checkUserStatus)
            .toHaveBeenCalledWith("ACTIVE");

        expect(mockSearchRepo.search)
            .toHaveBeenCalledWith({ query: "test" });

        expect(result).toEqual([
            { id: "org-1", name: "Test Org" }
        ]);
    });

    it("should propagate error from search repository", async () => {

        mockUserRepo.findById.mockResolvedValue(mockUser);

        mockSearchRepo.search.mockRejectedValue(
            new Error("DB error")
        );

        await expect(
            useCase.execute("actor-id", { query: "test" })
        ).rejects.toThrow("DB error");
    });

});
