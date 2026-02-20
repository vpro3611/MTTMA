import { ViewUserInvitationsService } from "../../../src/modules/invitations/application/services/view_user_invitations_service.js";

describe("ViewUserInvitationsService", () => {

    let useCase: any;
    let service: ViewUserInvitationsService;

    const actorId = "user-1";

    beforeEach(() => {
        useCase = {
            execute: jest.fn(),
        };

        service = new ViewUserInvitationsService(useCase);
    });

    // --------------------------------------------------
    // HAPPY PATH
    // --------------------------------------------------

    it("should delegate to use case and return result", async () => {

        const fakeResult = [
            { id: "inv-1" },
            { id: "inv-2" },
        ];

        useCase.execute.mockResolvedValue(fakeResult);

        const result = await service.executeTx(actorId);

        expect(useCase.execute).toHaveBeenCalledWith(actorId);
        expect(result).toBe(fakeResult);
    });

    // --------------------------------------------------
    // ERROR PROPAGATION
    // --------------------------------------------------

    it("should propagate errors from use case", async () => {

        useCase.execute.mockRejectedValue(new Error("Failure"));

        await expect(
            service.executeTx(actorId)
        ).rejects.toThrow("Failure");
    });

});