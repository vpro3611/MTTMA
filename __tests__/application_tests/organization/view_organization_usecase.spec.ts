import { ViewOrganizationUseCase } from
        "../../../src/modules/organization/application/view_organization_use_case.js";

import { UserDoesNotExistError } from
        "../../../src/modules/organization_task/errors/repository_errors.js";
import {OrganizationNotFoundError} from "../../../src/modules/organization/errors/organization_repository_errors.js";

describe("ViewOrganizationUseCase", () => {

    let organizationRepo: any;
    let userRepo: any;
    let useCase: ViewOrganizationUseCase;

    const actorId = "user-1";
    const orgId = "org-1";

    beforeEach(() => {

        organizationRepo = {
            findById: jest.fn(),
        };

        userRepo = {
            findById: jest.fn(),
        };

        useCase = new ViewOrganizationUseCase(
            organizationRepo,
            userRepo
        );
    });

    /**
     * ✅ Happy path
     */
    it("should return organization dto", async () => {

        const mockUser = {
            ensureIsActive: jest.fn(),
        };

        const mockOrganization = {
            id: orgId,
            getName: () => ({
                getValue: () => "Test Org"
            }),
            getCreatedAt: () => new Date("2024-01-01"),
        };

        userRepo.findById.mockResolvedValue(mockUser);
        organizationRepo.findById.mockResolvedValue(mockOrganization);

        const result = await useCase.execute(actorId, orgId);

        expect(userRepo.findById).toHaveBeenCalledWith(actorId);
        expect(mockUser.ensureIsActive).toHaveBeenCalled();

        expect(organizationRepo.findById).toHaveBeenCalledWith(orgId);

        expect(result).toEqual({
            id: orgId,
            name: "Test Org",
            createdAt: new Date("2024-01-01"),
        });
    });

    /**
     * ❌ User does not exist
     */
    it("should throw if user not found", async () => {

        userRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(actorId, orgId)
        ).rejects.toBeInstanceOf(UserDoesNotExistError);
    });

    /**
     * ❌ User inactive
     */
    it("should throw if user not active", async () => {

        const mockUser = {
            ensureIsActive: jest.fn(() => {
                throw new Error("Inactive");
            }),
        };

        userRepo.findById.mockResolvedValue(mockUser);

        await expect(
            useCase.execute(actorId, orgId)
        ).rejects.toThrow("Inactive");
    });

    /**
     * ❌ Organization not found
     */
    it("should throw if organization not found", async () => {

        const mockUser = {
            ensureIsActive: jest.fn(),
        };

        userRepo.findById.mockResolvedValue(mockUser);
        organizationRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(actorId, orgId)
        ).rejects.toBeInstanceOf(OrganizationNotFoundError);
    });

});