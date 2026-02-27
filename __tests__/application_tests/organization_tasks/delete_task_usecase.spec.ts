import { DeleteTaskUseCase } from
        "../../../backend/src/modules/organization_task/application/delete_task_use_case.js";

import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError,
    TargetNotAMemberError
} from
        "../../../backend/src/modules/organization_members/errors/organization_members_domain_error.js";

import { TaskNotFoundError } from
        "../../../backend/src/modules/organization_task/errors/application_errors.js";


describe("DeleteTaskUseCase (application)", () => {

    const ORG_ID = "org-1";
    const OWNER_ID = "owner-1";
    const ADMIN_ID = "admin-1";
    const MEMBER_ID = "member-1";
    const TASK_ID = "task-1";

    let taskRepo: any;
    let memberRepo: any;
    let useCase: DeleteTaskUseCase;

    beforeEach(() => {
        taskRepo = {
            findById: jest.fn(),
            delete: jest.fn(),
        };

        memberRepo = {
            findById: jest.fn(),
        };

        useCase = new DeleteTaskUseCase(taskRepo, memberRepo);
    });

    const mockMember = (role: "OWNER" | "ADMIN" | "MEMBER") => ({
        getRole: () => role,
    });

    const makeTask = (createdBy: string, assignedTo: string) => ({
        id: TASK_ID,
        organizationId: ORG_ID,
        getCreatedBy: () => createdBy,
        getAssignedTo: () => assignedTo,
        getTitle: () => ({ getValue: () => "Test task" }),
        getDescription: () => ({ getValue: () => "Test description" }),
        getStatus: () => "TODO",
        getCreatedAt: () => new Date(),
    });

    const baseDto = {
        actorId: OWNER_ID,
        orgId: ORG_ID,
        orgTaskId: TASK_ID,
    };

    const expectDto = (result: any, assignedTo: string, createdBy: string) => {
        expect(result).toMatchObject({
            id: TASK_ID,
            organizationId: ORG_ID,
            title: "Test task",
            description: "Test description",
            status: "TODO",
            assignedTo,
            createdBy,
        });

        expect(result.createdAt).toBeInstanceOf(Date);
    };

    /* ===================== HAPPY PATH ===================== */

    it("should allow OWNER to delete any task", async () => {

        memberRepo.findById
            .mockResolvedValueOnce(mockMember("OWNER"))
            .mockResolvedValueOnce(mockMember("ADMIN"));

        const task = makeTask(ADMIN_ID, ADMIN_ID);

        taskRepo.findById.mockResolvedValue(task);
        taskRepo.delete.mockResolvedValue(task);

        const result = await useCase.execute(baseDto);

        expect(taskRepo.delete)
            .toHaveBeenCalledWith(TASK_ID, ORG_ID);

        expectDto(result, ADMIN_ID, ADMIN_ID);
    });

    it("should allow ADMIN to delete MEMBER task", async () => {

        memberRepo.findById
            .mockResolvedValueOnce(mockMember("ADMIN"))
            .mockResolvedValueOnce(mockMember("MEMBER"));

        const task = makeTask(MEMBER_ID, MEMBER_ID);

        taskRepo.findById.mockResolvedValue(task);
        taskRepo.delete.mockResolvedValue(task);

        const result = await useCase.execute({
            ...baseDto,
            actorId: ADMIN_ID,
        });

        expectDto(result, MEMBER_ID, MEMBER_ID);
    });

    it("should allow MEMBER to delete own task", async () => {

        memberRepo.findById
            .mockResolvedValueOnce(mockMember("MEMBER"))
            .mockResolvedValueOnce(mockMember("MEMBER"));

        const task = makeTask(MEMBER_ID, MEMBER_ID);

        taskRepo.findById.mockResolvedValue(task);
        taskRepo.delete.mockResolvedValue(task);

        const result = await useCase.execute({
            ...baseDto,
            actorId: MEMBER_ID,
        });

        expectDto(result, MEMBER_ID, MEMBER_ID);
    });

    /* ===================== CONTEXT ERRORS ===================== */

    it("should throw if actor is not a member", async () => {
        memberRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(baseDto)
        ).rejects.toBeInstanceOf(ActorNotAMemberError);
    });

    it("should throw if task does not exist", async () => {

        memberRepo.findById
            .mockResolvedValueOnce(mockMember("OWNER"));

        taskRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(baseDto)
        ).rejects.toBeInstanceOf(TaskNotFoundError);
    });

    it("should throw if assignee is not a member", async () => {

        memberRepo.findById
            .mockResolvedValueOnce(mockMember("OWNER"))
            .mockResolvedValueOnce(null);

        taskRepo.findById.mockResolvedValue(
            makeTask(MEMBER_ID, MEMBER_ID)
        );

        await expect(
            useCase.execute(baseDto)
        ).rejects.toBeInstanceOf(TargetNotAMemberError);
    });

    /* ===================== RBAC ===================== */

    it("should NOT allow MEMBER to delete foreign task", async () => {

        memberRepo.findById
            .mockResolvedValueOnce(mockMember("MEMBER"))
            .mockResolvedValueOnce(mockMember("MEMBER"));

        taskRepo.findById.mockResolvedValue(
            makeTask(OWNER_ID, OWNER_ID)
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

    it("should NOT allow ADMIN to delete ADMIN task", async () => {

        memberRepo.findById
            .mockResolvedValueOnce(mockMember("ADMIN"))
            .mockResolvedValueOnce(mockMember("ADMIN"));

        taskRepo.findById.mockResolvedValue(
            makeTask(ADMIN_ID, ADMIN_ID)
        );

        await expect(
            useCase.execute({
                ...baseDto,
                actorId: ADMIN_ID,
            })
        ).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );
    });

    /* ===================== DELETE RESULT ===================== */

    it("should throw if delete returns null", async () => {

        memberRepo.findById
            .mockResolvedValueOnce(mockMember("OWNER"))
            .mockResolvedValueOnce(mockMember("MEMBER"));

        const task = makeTask(MEMBER_ID, MEMBER_ID);

        taskRepo.findById.mockResolvedValue(task);
        taskRepo.delete.mockResolvedValue(null);

        await expect(
            useCase.execute(baseDto)
        ).rejects.toBeInstanceOf(TaskNotFoundError);
    });
});
