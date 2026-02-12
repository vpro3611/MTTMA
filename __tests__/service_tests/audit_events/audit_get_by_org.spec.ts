import {GetAllAuditWithAudit} from "../../../src/modules/audit_events/application/service/get_audit_byId_with_audit.js";

describe("GetAllAuditWithAudit", () => {

    const ACTOR_ID = "user-1";
    const ORG_ID = "org-1";

    let getAudit: any;
    let appendAudit: any;
    let service: GetAllAuditWithAudit;

    beforeEach(() => {
        getAudit = {
            execute: jest.fn()
        };

        appendAudit = {
            execute: jest.fn()
        };

        service = new GetAllAuditWithAudit(
            getAudit,
            appendAudit
        );
    });

    it("should append audit and then return audit list", async () => {

        const fakeResult = [{ id: "1" }];

        getAudit.execute.mockResolvedValue(fakeResult);
        appendAudit.execute.mockResolvedValue(undefined);

        const result = await service.executeTx(
            ACTOR_ID,
            ORG_ID
        );

        expect(appendAudit.execute).toHaveBeenCalledTimes(1);
        expect(getAudit.execute).toHaveBeenCalledWith(ACTOR_ID, ORG_ID);

        expect(result).toEqual(fakeResult);
    });

    it("should propagate error if append fails", async () => {

        appendAudit.execute.mockRejectedValue(
            new Error("write failed")
        );

        await expect(
            service.executeTx(ACTOR_ID, ORG_ID)
        ).rejects.toThrow("write failed");

        expect(getAudit.execute).not.toHaveBeenCalled();
    });

    it("should propagate error if getAudit fails", async () => {

        appendAudit.execute.mockResolvedValue(undefined);
        getAudit.execute.mockRejectedValue(
            new Error("read failed")
        );

        await expect(
            service.executeTx(ACTOR_ID, ORG_ID)
        ).rejects.toThrow("read failed");
    });
});
