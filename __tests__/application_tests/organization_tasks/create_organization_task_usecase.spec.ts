import { CreateOrganizationTaskUseCase } from
        "../../../src/modules/organization_task/application/create_org_task_use_case.js";

import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError,
    TargetNotAMemberError
} from
        "../../../src/modules/organization_members/errors/organization_members_domain_error.js";

import { OrganizationNotFoundError } from
        "../../../src/modules/organization/errors/organization_repository_errors.js";

describe("CreateOrganizationTaskUseCase (application)", () => {

    const ORG_ID = "org-1";
    const OWNER_ID = "owner-1";
    const ADMIN_ID = "admin-1";
    const MEMBER_ID = "member-1";

    const baseDto = {
        organizationId: ORG_ID,
        title: "Task title",
        description: "Task description",
        createdBy: OWNER_ID,
        assignedTo: MEMBER_ID,
    };

    let orgMemberRepo: any;
    let taskRepo: any;
    let orgRepo: any;

    let useCase: CreateOrganizationTaskUseCase;

    beforeEach(() => {

        orgMemberRepo = {
            findById: jest.fn(),
        };

        taskRepo = {
            save: jest.fn(),
        };

        orgRepo = {
            findById: jest.fn(),
        };

        // по умолчанию организация существует
        orgRepo.findById.mockResolvedValue({ id: ORG_ID });

        useCase = new CreateOrganizationTaskUseCase(
            taskRepo,
            orgMemberRepo,
            orgRepo
        );
    });

    const mockMember = (role: "OWNER" | "ADMIN" | "MEMBER") => ({
        getRole: () => role,
    });

    const expectDto = (result: any, assignedTo: string) => {
        expect(result).toMatchObject({
            organizationId: ORG_ID,
            title: "Task title",
            description: "Task description",
            status: "TODO",
            assignedTo,
            createdBy: expect.any(String),
        });

        expect(result.id).toBeDefined();
        expect(result.createdAt).toBeInstanceOf(Date);
    };

    /* ===================== HAPPY PATHS ===================== */

    it("should allow OWNER to create task for MEMBER", async () => {

        orgMemberRepo.findById
            .mockResolvedValueOnce(mockMember("OWNER"))
            .mockResolvedValueOnce(mockMember("MEMBER"));

        const result = await useCase.execute(baseDto);

        expect(taskRepo.save).toHaveBeenCalledTimes(1);

        expectDto(result, MEMBER_ID);
    });

    it("should allow ADMIN to create task for MEMBER", async () => {

        orgMemberRepo.findById
            .mockResolvedValueOnce(mockMember("ADMIN"))
            .mockResolvedValueOnce(mockMember("MEMBER"));

        const result = await useCase.execute({
            ...baseDto,
            createdBy: ADMIN_ID,
        });

        expectDto(result, MEMBER_ID);
    });

    it("should allow MEMBER to create task for himself", async () => {

        orgMemberRepo.findById
            .mockResolvedValueOnce(mockMember("MEMBER"))
            .mockResolvedValueOnce(mockMember("MEMBER"));

        const result = await useCase.execute({
            ...baseDto,
            createdBy: MEMBER_ID,
            assignedTo: undefined,
        });

        expectDto(result, MEMBER_ID);
    });

    /* ===================== CONTEXT ERRORS ===================== */

    it("should throw if organization does not exist", async () => {

        orgRepo.findById.mockResolvedValue(null);

        await expect(useCase.execute(baseDto))
            .rejects.toBeInstanceOf(OrganizationNotFoundError);
    });

    it("should throw if creator is not a member", async () => {

        orgMemberRepo.findById.mockResolvedValue(null);

        await expect(useCase.execute(baseDto))
            .rejects.toBeInstanceOf(ActorNotAMemberError);
    });

    it("should throw if assignee is not a member", async () => {

        orgMemberRepo.findById
            .mockResolvedValueOnce(mockMember("OWNER"))
            .mockResolvedValueOnce(null);

        await expect(useCase.execute(baseDto))
            .rejects.toBeInstanceOf(TargetNotAMemberError);
    });

    /* ===================== RBAC ===================== */

    it("should NOT allow MEMBER to create task for another user", async () => {

        orgMemberRepo.findById
            .mockResolvedValueOnce(mockMember("MEMBER"))
            .mockResolvedValueOnce(mockMember("MEMBER"));

        await expect(useCase.execute({
            ...baseDto,
            createdBy: MEMBER_ID,
            assignedTo: ADMIN_ID,
        })).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );
    });

    it("should NOT allow ADMIN to create task for ADMIN", async () => {

        orgMemberRepo.findById
            .mockResolvedValueOnce(mockMember("ADMIN"))
            .mockResolvedValueOnce(mockMember("ADMIN"));

        await expect(useCase.execute({
            ...baseDto,
            createdBy: ADMIN_ID,
            assignedTo: ADMIN_ID,
        })).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );
    });
});