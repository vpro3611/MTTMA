import { ChangeOrgTaskStatusUseCase } from
        "../../../backend/src/modules/organization_task/application/change_org_task_status_use_case.js";

import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError,
    TargetNotAMemberError
} from "../../../backend/src/modules/organization_members/errors/organization_members_domain_error.js";

import {
    InvalidTaskStatusError,
    TaskNotFoundError
} from "../../../backend/src/modules/organization_task/errors/application_errors.js";

import { Task } from
        "../../../backend/src/modules/organization_task/domain/task_domain.js";

import { TaskTitle } from
        "../../../backend/src/modules/organization_task/domain/task_title.js";

import { TaskDescription } from
        "../../../backend/src/modules/organization_task/domain/task_description.js";

import { OrganizationMember } from
        "../../../backend/src/modules/organization_members/domain/organization_member_domain.js";


describe("ChangeOrgTaskStatusUseCase (application)", () => {

    const ORG_ID = "org-1";
    const OWNER_ID = "owner-1";
    const ADMIN_ID = "admin-1";
    const MEMBER_ID = "member-1";

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

    const baseDto = {
        actorId: OWNER_ID,
        orgId: ORG_ID,
        orgTaskId: "task-id",
        newStatus: "IN_PROGRESS",
    };

    const makeTask = (createdBy: string, assignedTo: string) =>
        Task.create(
            ORG_ID,
            TaskTitle.create("Test task"),
            TaskDescription.create("Old description"),
            assignedTo,
            createdBy
        );

    const expectDto = (result: any, task: Task) => {
        expect(result).toMatchObject({
            id: task.id,
            organizationId: task.organizationId,
            title: task.getTitle().getValue(),
            description: task.getDescription().getValue(),
            status: "IN_PROGRESS",
            assignedTo: task.getAssignedTo(),
            createdBy: task.getCreatedBy(),
        });

        expect(result.createdAt).toBeInstanceOf(Date);
    };

    /* ===================== HAPPY PATH ===================== */

    it("should allow OWNER to change task status", async () => {

        const task = makeTask(ADMIN_ID, ADMIN_ID);

        memberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, OWNER_ID, "OWNER")
            )
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ADMIN_ID, "ADMIN")
            );

        taskRepo.findById.mockResolvedValue(task);

        const result = await useCase.execute(baseDto);

        expect(task.getStatus()).toBe("IN_PROGRESS");
        expect(taskRepo.save).toHaveBeenCalledWith(task);

        expectDto(result, task);
    });

    it("should allow ADMIN to change MEMBER task status", async () => {

        const task = makeTask(MEMBER_ID, MEMBER_ID);

        memberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ADMIN_ID, "ADMIN")
            )
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, MEMBER_ID, "MEMBER")
            );

        taskRepo.findById.mockResolvedValue(task);

        const result = await useCase.execute({
            ...baseDto,
            actorId: ADMIN_ID,
        });

        expectDto(result, task);
    });

    it("should allow MEMBER to change own task status", async () => {

        const task = makeTask(MEMBER_ID, MEMBER_ID);

        memberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, MEMBER_ID, "MEMBER")
            )
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, MEMBER_ID, "MEMBER")
            );

        taskRepo.findById.mockResolvedValue(task);

        const result = await useCase.execute({
            ...baseDto,
            actorId: MEMBER_ID,
        });

        expectDto(result, task);
    });

    /* ===================== CONTEXT ERRORS ===================== */

    it("should throw if actor is not a member", async () => {
        memberRepo.findById.mockResolvedValue(null);

        await expect(useCase.execute(baseDto))
            .rejects.toBeInstanceOf(ActorNotAMemberError);
    });

    it("should throw if task does not exist", async () => {
        memberRepo.findById.mockResolvedValue(
            OrganizationMember.hire(ORG_ID, OWNER_ID, "OWNER")
        );

        taskRepo.findById.mockResolvedValue(null);

        await expect(useCase.execute(baseDto))
            .rejects.toBeInstanceOf(TaskNotFoundError);
    });

    it("should throw if assignee is not a member", async () => {

        const task = makeTask(MEMBER_ID, MEMBER_ID);

        memberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, OWNER_ID, "OWNER")
            )
            .mockResolvedValueOnce(null);

        taskRepo.findById.mockResolvedValue(task);

        await expect(useCase.execute(baseDto))
            .rejects.toBeInstanceOf(TargetNotAMemberError);
    });

    /* ===================== RBAC ===================== */

    it("should NOT allow MEMBER to change foreign task", async () => {

        const task = makeTask(OWNER_ID, OWNER_ID);

        memberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, MEMBER_ID, "MEMBER")
            )
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, OWNER_ID, "OWNER")
            );

        taskRepo.findById.mockResolvedValue(task);

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

        const task = makeTask(ADMIN_ID, ADMIN_ID);

        memberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ADMIN_ID, "ADMIN")
            )
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ADMIN_ID, "ADMIN")
            );

        taskRepo.findById.mockResolvedValue(task);

        await expect(
            useCase.execute({
                ...baseDto,
                actorId: ADMIN_ID,
            })
        ).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );
    });

    /* ===================== STATUS VALIDATION ===================== */

    it("should throw if status is invalid", async () => {

        const task = makeTask(MEMBER_ID, MEMBER_ID);

        memberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, OWNER_ID, "OWNER")
            )
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, MEMBER_ID, "MEMBER")
            );

        taskRepo.findById.mockResolvedValue(task);

        await expect(
            useCase.execute({
                ...baseDto,
                newStatus: "INVALID_STATUS",
            })
        ).rejects.toBeInstanceOf(InvalidTaskStatusError);
    });
});
