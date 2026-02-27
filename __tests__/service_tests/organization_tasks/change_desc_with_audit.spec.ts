

import { ChangeDescWithAudit } from "../../../backend/src/modules/organization_task/application/service/change_desc_with_audit.js";
import { ChangeOrgTaskDescriptionUseCase } from "../../../backend/src/modules/organization_task/application/change_org_task_description_use_case.js";
import { AppendLogAuditEvents } from "../../../backend/src/modules/audit_events/application/append_log_audit_events.js";
import { AuditEventActions } from "../../../backend/src/modules/audit_events/domain/audit_event_actions.js";
import {ChangeDescDTO} from "../../../backend/src/modules/organization_task/DTO/change_desc_dto.js";

describe("ChangeDescWithAudit (transactional)", () => {

    const ORG_ID = "org-1";
    const TASK_ID = "task-1";
    const ACTOR_ID = "user-1";

    let changeDescUseCase: jest.Mocked<ChangeOrgTaskDescriptionUseCase>;
    let auditUseCase: jest.Mocked<AppendLogAuditEvents>;
    let useCase: ChangeDescWithAudit;

    const baseDto = {
        newDesc: "New description",
        actorId: ACTOR_ID,
        orgTaskId: TASK_ID,
        orgId: ORG_ID,
    };

    const fakeTaskDto = {
        id: TASK_ID,
        organizationId: ORG_ID,
        title: "Title",
        description: "New description",
        status: "TODO",
        assignedTo: ACTOR_ID,
        createdBy: ACTOR_ID,
        createdAt: new Date(),
    };

    beforeEach(() => {

        changeDescUseCase = {
            execute: jest.fn(),
        } as any;

        auditUseCase = {
            execute: jest.fn(),
        } as any;

        useCase = new ChangeDescWithAudit(
            changeDescUseCase,
            auditUseCase
        );
    });

    /* ===================== HAPPY PATH ===================== */

    it("should change description and write audit", async () => {

        changeDescUseCase.execute.mockResolvedValue(fakeTaskDto);
        auditUseCase.execute.mockResolvedValue(undefined);

        const result = await useCase.executeTx(baseDto);

        expect(changeDescUseCase.execute)
            .toHaveBeenCalledWith(baseDto);

        expect(auditUseCase.execute)
            .toHaveBeenCalledTimes(1);

        const auditArg = auditUseCase.execute.mock.calls[0][0];

        expect(auditArg.getAction())
            .toBe(AuditEventActions.TASK_DESCRIPTION_CHANGED);

        expect(auditArg.getActorId())
            .toBe(ACTOR_ID);

        expect(result).toEqual(fakeTaskDto);
    });

    /* ===================== MAIN USE CASE FAILS ===================== */

    it("should NOT write audit if description change fails", async () => {

        changeDescUseCase.execute
            .mockRejectedValue(new Error("fail"));

        await expect(
            useCase.executeTx(baseDto)
        ).rejects.toThrow("fail");

        expect(auditUseCase.execute)
            .not.toHaveBeenCalled();
    });

    /* ===================== AUDIT FAILS ===================== */

    it("should propagate error if audit writing fails", async () => {

        changeDescUseCase.execute
            .mockResolvedValue(fakeTaskDto);

        auditUseCase.execute
            .mockRejectedValue(new Error("audit fail"));

        await expect(
            useCase.executeTx(baseDto)
        ).rejects.toThrow("audit fail");

        expect(changeDescUseCase.execute)
            .toHaveBeenCalled();
    });
});

