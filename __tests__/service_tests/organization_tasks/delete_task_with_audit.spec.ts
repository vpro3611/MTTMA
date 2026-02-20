import { DeleteTaskWithAudit } from
        "../../../src/modules/organization_task/application/service/delete_task_with_audit.js";

import { DeleteTaskUseCase } from
        "../../../src/modules/organization_task/application/delete_task_use_case.js";

import { AppendLogAuditEvents } from
        "../../../src/modules/audit_events/application/append_log_audit_events.js";

import { AuditEventActions } from
        "../../../src/modules/audit_events/domain/audit_event_actions.js";

describe("DeleteTaskWithAudit (transactional)", () => {

    const ORG_ID = "org-1";
    const ACTOR_ID = "user-1";
    const TASK_ID = "task-1";

    let deleteTaskUseCase: jest.Mocked<DeleteTaskUseCase>;
    let auditUseCase: jest.Mocked<AppendLogAuditEvents>;
    let useCase: DeleteTaskWithAudit;

    const baseDto = {
        orgTaskId: TASK_ID,
        orgId: ORG_ID,
        actorId: ACTOR_ID,
    };

    const fakeDeletedTaskDto = {
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

        deleteTaskUseCase = {
            execute: jest.fn(),
        } as any;

        auditUseCase = {
            execute: jest.fn(),
        } as any;

        useCase = new DeleteTaskWithAudit(
            deleteTaskUseCase,
            auditUseCase
        );
    });

    /* ===================== HAPPY PATH ===================== */

    it("should delete task and write audit event", async () => {

        deleteTaskUseCase.execute.mockResolvedValue(fakeDeletedTaskDto);
        auditUseCase.execute.mockResolvedValue(undefined);

        const result = await useCase.executeTx(baseDto);

        expect(deleteTaskUseCase.execute)
            .toHaveBeenCalledWith(baseDto);

        expect(auditUseCase.execute)
            .toHaveBeenCalledTimes(1);

        const auditArg = auditUseCase.execute.mock.calls[0][0];

        expect(auditArg.getAction())
            .toBe(AuditEventActions.TASK_DELETED);

        expect(auditArg.getActorId())
            .toBe(ACTOR_ID);

        expect(auditArg.getOrganizationId())
            .toBe(ORG_ID);

        expect(result).toEqual(fakeDeletedTaskDto);
    });

    /* ===================== MAIN USE CASE FAILS ===================== */

    it("should NOT write audit if delete fails", async () => {

        deleteTaskUseCase.execute
            .mockRejectedValue(new Error("delete failed"));

        await expect(
            useCase.executeTx(baseDto)
        ).rejects.toThrow("delete failed");

        expect(auditUseCase.execute)
            .not.toHaveBeenCalled();
    });

    /* ===================== AUDIT FAILS ===================== */

    it("should propagate error if audit writing fails", async () => {

        deleteTaskUseCase.execute
            .mockResolvedValue(fakeDeletedTaskDto);

        auditUseCase.execute
            .mockRejectedValue(new Error("audit failed"));

        await expect(
            useCase.executeTx(baseDto)
        ).rejects.toThrow("audit failed");

        expect(deleteTaskUseCase.execute)
            .toHaveBeenCalled();
    });
});
