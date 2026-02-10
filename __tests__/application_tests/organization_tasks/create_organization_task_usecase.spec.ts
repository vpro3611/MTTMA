import { CreateOrganizationTaskUseCase } from
        "../../../src/modules/organization_task/application/create_org_task_use_case.js";

import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError,
    TargetNotAMemberError
} from "../../../src/modules/organization_members/errors/organization_members_domain_error.js";

import { OrganizationNotFoundError } from
        "../../../src/modules/organization/errors/organization_repository_errors.js";

import { Task } from "../../../src/modules/organization_task/domain/task_domain.js";

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

    let orgRepo: any;
    let orgMemberRepo: any;
    let taskRepo: any;

    let useCase: CreateOrganizationTaskUseCase;

    beforeEach(() => {
        orgRepo = {
            findById: jest.fn(),
        };

        orgMemberRepo = {
            findById: jest.fn(),
        };

        taskRepo = {
            save: jest.fn(),
        };

        useCase = new CreateOrganizationTaskUseCase(
            taskRepo,
            orgMemberRepo,
            orgRepo
        );
    });

    const mockMember = (role: "OWNER" | "ADMIN" | "MEMBER") => ({
        getRole: () => role,
    });

    /* ===================== HAPPY PATHS ===================== */

    it("should allow OWNER to create task for MEMBER", async () => {
        orgRepo.findById.mockResolvedValue({});
        orgMemberRepo.findById
            .mockResolvedValueOnce(mockMember("OWNER")) // creator
            .mockResolvedValueOnce(mockMember("MEMBER")); // assignee

        const task = await useCase.execute(baseDto);

        expect(task).toBeInstanceOf(Task);
        expect(taskRepo.save).toHaveBeenCalledTimes(1);
    });

    it("should allow ADMIN to create task for MEMBER", async () => {
        orgRepo.findById.mockResolvedValue({});
        orgMemberRepo.findById
            .mockResolvedValueOnce(mockMember("ADMIN"))
            .mockResolvedValueOnce(mockMember("MEMBER"));

        await expect(useCase.execute({
            ...baseDto,
            createdBy: ADMIN_ID,
        })).resolves.toBeInstanceOf(Task);
    });

    it("should allow MEMBER to create task for himself", async () => {
        orgRepo.findById.mockResolvedValue({});
        orgMemberRepo.findById
            .mockResolvedValueOnce(mockMember("MEMBER"))
            .mockResolvedValueOnce(mockMember("MEMBER"));

        const task = await useCase.execute({
            ...baseDto,
            createdBy: MEMBER_ID,
            assignedTo: undefined,
        });

        expect(task.getAssignedTo()).toBe(MEMBER_ID);
    });

    /* ===================== CONTEXT ERRORS ===================== */

    // it("should throw if organization does not exist", async () => {
    //     orgRepo.findById.mockResolvedValue(null);
    //
    //     await expect(useCase.execute(baseDto))
    //         .rejects.toBeInstanceOf(OrganizationNotFoundError);
    // });

    it("should throw if creator is not a member", async () => {
        orgRepo.findById.mockResolvedValue({});
        orgMemberRepo.findById.mockResolvedValue(null);

        await expect(useCase.execute(baseDto))
            .rejects.toBeInstanceOf(ActorNotAMemberError);
    });

    it("should throw if assignee is not a member", async () => {
        orgRepo.findById.mockResolvedValue({});
        orgMemberRepo.findById
            .mockResolvedValueOnce(mockMember("OWNER"))
            .mockResolvedValueOnce(null);

        await expect(useCase.execute(baseDto))
            .rejects.toBeInstanceOf(TargetNotAMemberError);
    });

    /* ===================== RBAC ===================== */

    it("should NOT allow MEMBER to create task for another user", async () => {
        orgRepo.findById.mockResolvedValue({});
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
        orgRepo.findById.mockResolvedValue({});
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
