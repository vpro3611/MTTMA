import { GetAllMembersWithAudit } from "../../../src/modules/organization_members/application/services/get_all_members_with_audit.js";
import { AuditEventActions } from "../../../src/modules/audit_events/domain/audit_event_actions.js";

describe("GetAllMembersWithAudit", () => {

    let getAllMembersUseCase: any;
    let writeAuditUseCase: any;
    let service: GetAllMembersWithAudit;

    beforeEach(() => {
        getAllMembersUseCase = {
            execute: jest.fn()
        };

        writeAuditUseCase = {
            execute: jest.fn()
        };

        service = new GetAllMembersWithAudit(
            getAllMembersUseCase,
            writeAuditUseCase
        );
    });

    it("should return DTO list and write audit", async () => {

        const dtoList = [
            {
                organizationId: "org-1",
                userId: "actor-1",
                role: "ADMIN",
                joinedAt: new Date()
            }
        ];

        getAllMembersUseCase.execute.mockResolvedValue(dtoList);

        const result = await service.executeTx("actor-1", "org-1");

        // 1. use case вызван
        expect(getAllMembersUseCase.execute)
            .toHaveBeenCalledWith("actor-1", "org-1");

        // 2. аудит записан
        expect(writeAuditUseCase.execute).toHaveBeenCalled();

        const auditEvent = writeAuditUseCase.execute.mock.calls[0][0];

        // проверяем только действие (домен не тестируем)
        expect(auditEvent.getAction())
            .toBe(AuditEventActions.LIST_ALL_MEMBERS);

        // 3. возвращён результат use case
        expect(result).toEqual(dtoList);
    });

    it("should propagate error if use case fails", async () => {

        getAllMembersUseCase.execute
            .mockRejectedValue(new Error("usecase failed"));

        await expect(
            service.executeTx("actor-1", "org-1")
        ).rejects.toThrow("usecase failed");

        // аудит не должен писаться
        expect(writeAuditUseCase.execute).not.toHaveBeenCalled();
    });

    it("should propagate error if audit writing fails", async () => {

        getAllMembersUseCase.execute.mockResolvedValue([]);

        writeAuditUseCase.execute
            .mockRejectedValue(new Error("audit failed"));

        await expect(
            service.executeTx("actor-1", "org-1")
        ).rejects.toThrow("audit failed");

        expect(getAllMembersUseCase.execute)
            .toHaveBeenCalledWith("actor-1", "org-1");
    });

});
