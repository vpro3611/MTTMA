import { ChangeTaskStatusWithAudit } from
        "../../../backend/src/modules/organization_task/application/service/change_status_with_audit.js";

import { ChangeOrgTaskStatusUseCase } from
        "../../../backend/src/modules/organization_task/application/change_org_task_status_use_case.js";

import { AppendLogAuditEvents } from
        "../../../backend/src/modules/audit_events/application/append_log_audit_events.js";

import { AuditEventActions } from
        "../../../backend/src/modules/audit_events/domain/audit_event_actions.js";

describe("ChangeTaskStatusWithAudit (transactional)", () => {

    const ORG_ID = "org-1";
    const TASK_ID = "task-1";
    const ACTOR_ID = "user-1";

    let changeStatusUseCase: jest.Mocked<ChangeOrgTaskStatusUseCase>;
    let auditUseCase: jest.Mocked<AppendLogAuditEvents>;
    let useCase: ChangeTaskStatusWithAudit;

    const baseDto = {
        actorId: ACTOR_ID,
        orgId: ORG_ID,
        orgTaskId: TASK_ID,
        newStatus: "IN_PROGRESS",
    };

    const fakeTaskDto = {
        id: TASK_ID,
        organizationId: ORG_ID,
        title: "Test title",
        description: "Test description",
        status: "IN_PROGRESS",
        assignedTo: ACTOR_ID,
        createdBy: ACTOR_ID,
        createdAt: new Date(),
    };

    beforeEach(() => {

        changeStatusUseCase = {
            execute: jest.fn(),
        } as any;

        auditUseCase = {
            execute: jest.fn(),
        } as any;

        useCase = new ChangeTaskStatusWithAudit(
            changeStatusUseCase,
            auditUseCase
        );
    });

    /* ===================== HAPPY PATH ===================== */

    it("should change task status and write audit", async () => {

        changeStatusUseCase.execute.mockResolvedValue(fakeTaskDto);
        auditUseCase.execute.mockResolvedValue(undefined);

        const result = await useCase.executeTx(baseDto);

        expect(changeStatusUseCase.execute)
            .toHaveBeenCalledWith(baseDto);

        expect(auditUseCase.execute)
            .toHaveBeenCalledTimes(1);

        const auditArg = auditUseCase.execute.mock.calls[0][0];

        expect(auditArg.getAction())
            .toBe(AuditEventActions.TASK_STATUS_CHANGED);

        expect(auditArg.getActorId())
            .toBe(ACTOR_ID);

        expect(result).toEqual(fakeTaskDto);
    });

    /* ===================== MAIN USE CASE FAILS ===================== */

    it("should NOT write audit if status change fails", async () => {

        changeStatusUseCase.execute
            .mockRejectedValue(new Error("status fail"));

        await expect(
            useCase.executeTx(baseDto)
        ).rejects.toThrow("status fail");

        expect(auditUseCase.execute)
            .not.toHaveBeenCalled();
    });

    /* ===================== AUDIT FAILS ===================== */

    it("should propagate error if audit writing fails", async () => {

        changeStatusUseCase.execute
            .mockResolvedValue(fakeTaskDto);

        auditUseCase.execute
            .mockRejectedValue(new Error("audit fail"));

        await expect(
            useCase.executeTx(baseDto)
        ).rejects.toThrow("audit fail");

        expect(changeStatusUseCase.execute)
            .toHaveBeenCalled();
    });
});
