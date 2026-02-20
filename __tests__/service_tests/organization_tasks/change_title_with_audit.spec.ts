import { ChangeTitleWithAudit } from
        "../../../src/modules/organization_task/application/service/change_title_with_audit.js";

import { ChangeOrgTaskTitleUseCase } from
        "../../../src/modules/organization_task/application/change_org_task_title_use_case.js";

import { AppendLogAuditEvents } from
        "../../../src/modules/audit_events/application/append_log_audit_events.js";

import { AuditEventActions } from
        "../../../src/modules/audit_events/domain/audit_event_actions.js";

describe("ChangeTitleWithAudit (transactional)", () => {

    const ORG_ID = "org-1";
    const TASK_ID = "task-1";
    const ACTOR_ID = "user-1";

    let changeTitleUseCase: jest.Mocked<ChangeOrgTaskTitleUseCase>;
    let auditUseCase: jest.Mocked<AppendLogAuditEvents>;
    let useCase: ChangeTitleWithAudit;

    const baseDto = {
        actorId: ACTOR_ID,
        orgId: ORG_ID,
        orgTaskId: TASK_ID,
        newTitle: "New title",
    };

    const fakeTaskDto = {
        id: TASK_ID,
        organizationId: ORG_ID,
        title: "New title",
        description: "Old description",
        status: "TODO",
        assignedTo: ACTOR_ID,
        createdBy: ACTOR_ID,
        createdAt: new Date(),
    };

    beforeEach(() => {

        changeTitleUseCase = {
            execute: jest.fn(),
        } as any;

        auditUseCase = {
            execute: jest.fn(),
        } as any;

        useCase = new ChangeTitleWithAudit(
            changeTitleUseCase,
            auditUseCase
        );
    });

    /* ===================== HAPPY PATH ===================== */

    it("should change task title and write audit", async () => {

        changeTitleUseCase.execute.mockResolvedValue(fakeTaskDto);
        auditUseCase.execute.mockResolvedValue(undefined);

        const result = await useCase.executeTx(baseDto);

        expect(changeTitleUseCase.execute)
            .toHaveBeenCalledWith(baseDto);

        expect(auditUseCase.execute)
            .toHaveBeenCalledTimes(1);

        const auditArg = auditUseCase.execute.mock.calls[0][0];

        expect(auditArg.getAction())
            .toBe(AuditEventActions.TASK_TITLE_CHANGED);

        expect(auditArg.getActorId())
            .toBe(ACTOR_ID);

        expect(result).toEqual(fakeTaskDto);
    });

    /* ===================== MAIN USE CASE FAILS ===================== */

    it("should NOT write audit if title change fails", async () => {

        changeTitleUseCase.execute
            .mockRejectedValue(new Error("rename fail"));

        await expect(
            useCase.executeTx(baseDto)
        ).rejects.toThrow("rename fail");

        expect(auditUseCase.execute)
            .not.toHaveBeenCalled();
    });

    /* ===================== AUDIT FAILS ===================== */

    it("should propagate error if audit writing fails", async () => {

        changeTitleUseCase.execute
            .mockResolvedValue(fakeTaskDto);

        auditUseCase.execute
            .mockRejectedValue(new Error("audit fail"));

        await expect(
            useCase.executeTx(baseDto)
        ).rejects.toThrow("audit fail");

        expect(changeTitleUseCase.execute)
            .toHaveBeenCalled();
    });
});
