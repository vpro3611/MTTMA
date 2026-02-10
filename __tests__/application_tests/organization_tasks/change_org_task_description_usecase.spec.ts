import { ChangeOrgTaskDescriptionUseCase } from
        "../../../src/modules/organization_task/application/change_org_task_description_use_case.js";

import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError,
    TargetNotAMemberError
} from "../../../src/modules/organization_members/errors/organization_members_domain_error.js";

import { TaskNotFoundError } from
        "../../../src/modules/organization_task/errors/application_errors.js";

import { OrganizationMember } from
        "../../../src/modules/organization_members/domain/organization_member_domain.js";

import { Task } from
        "../../../src/modules/organization_task/domain/task_domain.js";

import { TaskDescription } from
        "../../../src/modules/organization_task/domain/task_description.js";
import { TaskTitle } from "../../../src/modules/organization_task/domain/task_title.js";
import {create} from "node:domain";

describe("ChangeOrgTaskDescriptionUseCase (application)", () => {

    const ORG_ID = "org-1";
    const OWNER_ID = "owner-1";
    const ADMIN_ID = "admin-1";
    const MEMBER_ID = "member-1";
    const TASK_ID = "task-1";

    let taskRepo: any;
    let memberRepo: any;
    let useCase: ChangeOrgTaskDescriptionUseCase;
    beforeEach(() => {
        taskRepo = {
            findById: jest.fn(),
            save: jest.fn(),
        };

        memberRepo = {
            findById: jest.fn(),
        };

        useCase = new ChangeOrgTaskDescriptionUseCase(taskRepo, memberRepo);
    });

    const baseDto = {
        actorId: OWNER_ID,
        orgId: ORG_ID,
        orgTaskId: TASK_ID,
        newDesc: "New description",
    };

    const makeTask = (
        createdBy: string,
        assignedTo: string
    ) =>
        Task.create(
            ORG_ID,
            TaskTitle.create("Test task"),
            TaskDescription.create("Old description"),
            assignedTo,
            createdBy
        );

    /* ===================== HAPPY PATH ===================== */

    it("should allow OWNER to change task description", async () => {
        const task = makeTask(ADMIN_ID, ADMIN_ID);

        memberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, OWNER_ID, "OWNER")
            )
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ADMIN_ID, "ADMIN")
            );

        taskRepo.findById.mockResolvedValue(task);

        await expect(
            useCase.execute(baseDto)
        ).resolves.toBe(task);

        expect(task.getDescription().getValue()).toBe("New description");
        expect(taskRepo.save).toHaveBeenCalledWith(task);
    });

    it("should allow ADMIN to change MEMBER task description", async () => {
        const task = makeTask(MEMBER_ID, MEMBER_ID);

        memberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ADMIN_ID, "ADMIN")
            )
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, MEMBER_ID, "MEMBER")
            );

        taskRepo.findById.mockResolvedValue(task);

        await expect(
            useCase.execute({
                ...baseDto,
                actorId: ADMIN_ID,
            })
        ).resolves.toBe(task);
    });

    it("should allow MEMBER to change own task description", async () => {
        const task = makeTask(MEMBER_ID, MEMBER_ID);

        memberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, MEMBER_ID, "MEMBER")
            )
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, MEMBER_ID, "MEMBER")
            );

        taskRepo.findById.mockResolvedValue(task);

        await expect(
            useCase.execute({
                ...baseDto,
                actorId: MEMBER_ID,
            })
        ).resolves.toBe(task);
    });

    /* ===================== CONTEXT ERRORS ===================== */

    it("should throw if actor is not a member", async () => {
        memberRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(baseDto)
        ).rejects.toBeInstanceOf(ActorNotAMemberError);
    });

    it("should throw if task does not exist", async () => {
        memberRepo.findById.mockResolvedValue(
            OrganizationMember.hire(ORG_ID, OWNER_ID, "OWNER")
        );
        taskRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(baseDto)
        ).rejects.toBeInstanceOf(TaskNotFoundError);
    });

    it("should throw if assignee is not a member", async () => {
        memberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, OWNER_ID, "OWNER")
            )
            .mockResolvedValueOnce(null);

        taskRepo.findById.mockResolvedValue(
            makeTask(MEMBER_ID, MEMBER_ID)
        );

        await expect(
            useCase.execute(baseDto)
        ).rejects.toBeInstanceOf(TargetNotAMemberError);
    });

    /* ===================== RBAC ===================== */

    it("should NOT allow MEMBER to change foreign task description", async () => {
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

    it("should NOT allow ADMIN to change ADMIN task description", async () => {
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
});
