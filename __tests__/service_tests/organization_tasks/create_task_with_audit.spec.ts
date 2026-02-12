import { CreateTaskWithAudit } from
        "../../../src/modules/organization_task/application/service/create_task_with_audit.js";

import { CreateOrganizationTaskUseCase } from
        "../../../src/modules/organization_task/application/create_org_task_use_case.js";

import { AppendLogAuditEvents } from
        "../../../src/modules/audit_events/application/append_log_audit_events.js";

import { AuditEventActions } from
        "../../../src/modules/audit_events/domain/audit_event_actions.js";

describe("CreateTaskWithAudit (transactional)", () => {

    const ORG_ID = "org-1";
    const ACTOR_ID = "user-1";
    const TASK_ID = "task-1";

    let createTaskUseCase: jest.Mocked<CreateOrganizationTaskUseCase>;
    let auditUseCase: jest.Mocked<AppendLogAuditEvents>;
    let useCase: CreateTaskWithAudit;

    const baseDto = {
        organizationId: ORG_ID,
        title: "Task title",
        description: "Task description",
        assignedTo: "member-1",
        createdBy: ACTOR_ID,
    };

    const fakeTaskDto = {
        id: TASK_ID,
        organizationId: ORG_ID,
        title: "Task title",
        description: "Task description",
        status: "TODO",
        assignedTo: "member-1",
        createdBy: ACTOR_ID,
        createdAt: new Date(),
    };

    beforeEach(() => {

        createTaskUseCase = {
            execute: jest.fn(),
        } as any;

        auditUseCase = {
            execute: jest.fn(),
        } as any;

        useCase = new CreateTaskWithAudit(
            createTaskUseCase,
            auditUseCase
        );
    });

    /* ===================== HAPPY PATH ===================== */

    it("should create task and write audit", async () => {

        createTaskUseCase.execute.mockResolvedValue(fakeTaskDto);
        auditUseCase.execute.mockResolvedValue(undefined);

        const result = await useCase.executeTx(baseDto);

        expect(createTaskUseCase.execute)
            .toHaveBeenCalledWith(baseDto);

        expect(auditUseCase.execute)
            .toHaveBeenCalledTimes(1);

        const auditArg = auditUseCase.execute.mock.calls[0][0];

        expect(auditArg.getAction())
            .toBe(AuditEventActions.TASK_CREATED);

        expect(auditArg.getActorId())
            .toBe(ACTOR_ID);

        expect(auditArg.getOrganizationId())
            .toBe(ORG_ID);

        expect(result).toEqual(fakeTaskDto);
    });

    /* ===================== MAIN USE CASE FAILS ===================== */

    it("should NOT write audit if task creation fails", async () => {

        createTaskUseCase.execute
            .mockRejectedValue(new Error("create fail"));

        await expect(
            useCase.executeTx(baseDto)
        ).rejects.toThrow("create fail");

        expect(auditUseCase.execute)
            .not.toHaveBeenCalled();
    });

    /* ===================== AUDIT FAILS ===================== */

    it("should propagate error if audit writing fails", async () => {

        createTaskUseCase.execute
            .mockResolvedValue(fakeTaskDto);

        auditUseCase.execute
            .mockRejectedValue(new Error("audit fail"));

        await expect(
            useCase.executeTx(baseDto)
        ).rejects.toThrow("audit fail");

        expect(createTaskUseCase.execute)
            .toHaveBeenCalled();
    });
});
