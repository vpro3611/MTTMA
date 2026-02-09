import { ChangeOrgTaskStatusUseCase } from
        "../../../src/modules/organization_task/application/change_org_task_status_use_case.js";

import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError,
    TargetNotAMemberError
} from "../../../src/modules/organization_members/errors/organization_members_domain_error.js";

import {
    InvalidTaskStatusError,
    TaskNotFoundError
} from "../../../src/modules/organization_task/errors/application_errors.js";

describe("ChangeOrgTaskStatusUseCase (application)", () => {

    const ORG_ID = "org-1";
    const OWNER_ID = "owner-1";
    const ADMIN_ID = "admin-1";
    const MEMBER_ID = "member-1";
    const TASK_ID = "task-1";

    let taskRepo: any;
    let memberRepo: any;
    let useCase: ChangeOrgTaskStatusUseCase;

    beforeEach(() => {
        taskRepo = {
            findById: jest.fn(),
            save: jest.fn(),
        };

        memberRepo = {
            findById: jest.fn(),
        };

        useCase = new ChangeOrgTaskStatusUseCase(taskRepo, memberRepo);
    });

    const mockMember = (role: "OWNER" | "ADMIN" | "MEMBER") => ({
        getRole: () => role,
    });

    const mockTask = (createdBy: string, assignedTo: string) => ({
        getCreatedBy: () => createdBy,
        getAssignedTo: () => assignedTo,
        changeStatus: jest.fn(),
    });

    const baseDto = {
        actorId: OWNER_ID,
        orgId: ORG_ID,
        orgTaskId: TASK_ID,
        newStatus: "IN_PROGRESS",
    };

    /* ===================== HAPPY PATH ===================== */

    it("should allow OWNER to change task status", async () => {
        const task = mockTask(ADMIN_ID, ADMIN_ID);

        memberRepo.findById
            .mockResolvedValueOnce(mockMember("OWNER"))
            .mockResolvedValueOnce(mockMember("ADMIN"));

        taskRepo.findById.mockResolvedValue(task);

        await expect(useCase.execute(baseDto))
            .resolves.toBe(task);

        expect(task.changeStatus).toHaveBeenCalledWith("IN_PROGRESS");
        expect(taskRepo.save).toHaveBeenCalledWith(task);
    });

    it("should allow ADMIN to change MEMBER task status", async () => {
        const task = mockTask(MEMBER_ID, MEMBER_ID);

        memberRepo.findById
            .mockResolvedValueOnce(mockMember("ADMIN"))
            .mockResolvedValueOnce(mockMember("MEMBER"));

        taskRepo.findById.mockResolvedValue(task);

        await expect(useCase.execute({
            ...baseDto,
            actorId: ADMIN_ID,
        })).resolves.toBe(task);
    });

    it("should allow MEMBER to change own task status", async () => {
        const task = mockTask(MEMBER_ID, MEMBER_ID);

        memberRepo.findById
            .mockResolvedValueOnce(mockMember("MEMBER"))
            .mockResolvedValueOnce(mockMember("MEMBER"));

        taskRepo.findById.mockResolvedValue(task);

        await expect(useCase.execute({
            ...baseDto,
            actorId: MEMBER_ID,
        })).resolves.toBe(task);
    });

    /* ===================== CONTEXT ERRORS ===================== */

    it("should throw if actor is not a member", async () => {
        memberRepo.findById.mockResolvedValue(null);

        await expect(useCase.execute(baseDto))
            .rejects.toBeInstanceOf(ActorNotAMemberError);
    });

    it("should throw if task does not exist", async () => {
        memberRepo.findById.mockResolvedValue(mockMember("OWNER"));
        taskRepo.findById.mockResolvedValue(null);

        await expect(useCase.execute(baseDto))
            .rejects.toBeInstanceOf(TaskNotFoundError);
    });

    it("should throw if assignee is not a member", async () => {
        memberRepo.findById
            .mockResolvedValueOnce(mockMember("OWNER"))
            .mockResolvedValueOnce(null);

        taskRepo.findById.mockResolvedValue(
            mockTask(MEMBER_ID, MEMBER_ID)
        );

        await expect(useCase.execute(baseDto))
            .rejects.toBeInstanceOf(TargetNotAMemberError);
    });

    /* ===================== RBAC ===================== */

    it("should NOT allow MEMBER to change foreign task", async () => {
        memberRepo.findById
            .mockResolvedValueOnce(mockMember("MEMBER")) // actor
            .mockResolvedValueOnce(mockMember("MEMBER")); // assignee

        taskRepo.findById.mockResolvedValue(
            mockTask(OWNER_ID, OWNER_ID) // чужая задача
        );

        await expect(
            useCase.execute({
                ...baseDto,
                actorId: MEMBER_ID,
            })
        ).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );
    });


    it("should NOT allow ADMIN to change ADMIN task status", async () => {
        memberRepo.findById
            .mockResolvedValueOnce(mockMember("ADMIN"))
            .mockResolvedValueOnce(mockMember("ADMIN"));

        taskRepo.findById.mockResolvedValue(
            mockTask(ADMIN_ID, ADMIN_ID)
        );

        await expect(useCase.execute({
            ...baseDto,
            actorId: ADMIN_ID,
        })).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );
    });

    /* ===================== STATUS VALIDATION ===================== */

    it("should throw if status is invalid", async () => {
        memberRepo.findById
            .mockResolvedValueOnce(mockMember("OWNER"))
            .mockResolvedValueOnce(mockMember("MEMBER"));

        taskRepo.findById.mockResolvedValue(
            mockTask(MEMBER_ID, MEMBER_ID)
        );

        await expect(useCase.execute({
            ...baseDto,
            newStatus: "INVALID_STATUS",
        })).rejects.toBeInstanceOf(InvalidTaskStatusError);
    });
});
