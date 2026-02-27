import { AppendLogAuditEvents } from
        "../../../backend/src/modules/audit_events/application/append_log_audit_events.js";

import { AuditEvent } from
        "../../../backend/src/modules/audit_events/domain/audit_event_domain.js";

describe("AppendLogAuditEvents (unit)", () => {

    it("should call repository.append with given event", async () => {
        const repo = {
            append: jest.fn().mockResolvedValue(undefined),
        };

        const useCase = new AppendLogAuditEvents(repo as any);

        const event = AuditEvent.create(
            "actor-1",
            "org-1",
            "ORG_MEMBER_HIRED" as any
        );

        await useCase.execute(event);

        expect(repo.append).toHaveBeenCalledTimes(1);
        expect(repo.append).toHaveBeenCalledWith(event);
    });

    it("should propagate error from repository", async () => {
        const repo = {
            append: jest.fn().mockRejectedValue(new Error("db error")),
        };

        const useCase = new AppendLogAuditEvents(repo as any);

        const event = AuditEvent.create(
            "actor-1",
            "org-1",
            "ORG_MEMBER_HIRED" as any
        );

        await expect(
            useCase.execute(event)
        ).rejects.toThrow("db error");
    });

});
