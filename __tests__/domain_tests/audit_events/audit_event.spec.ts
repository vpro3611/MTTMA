import { AuditEvent } from "../../../backend/src/modules/audit_events/domain/audit_event_domain.js";
import { AuditEventActions } from "../../../backend/src/modules/audit_events/domain/audit_event_actions.js";

describe("AuditEvent (unit)", () => {

    it("should create audit event with generated id and current date", () => {
        const actorId = crypto.randomUUID();
        const orgId = crypto.randomUUID();

        const before = new Date();

        const event = AuditEvent.create(
            actorId,
            orgId,
            AuditEventActions.ORG_MEMBER_HIRED
        );

        const after = new Date();

        expect(event.id).toBeDefined();
        expect(typeof event.id).toBe("string");

        expect(event.getActorId()).toBe(actorId);
        expect(event.getOrganizationId()).toBe(orgId);
        expect(event.getAction())
            .toBe(AuditEventActions.ORG_MEMBER_HIRED);

        expect(event.getCreatedAt()).toBeInstanceOf(Date);

        // проверяем, что дата попадает в диапазон
        expect(event.getCreatedAt().getTime())
            .toBeGreaterThanOrEqual(before.getTime());

        expect(event.getCreatedAt().getTime())
            .toBeLessThanOrEqual(after.getTime());
    });

});
