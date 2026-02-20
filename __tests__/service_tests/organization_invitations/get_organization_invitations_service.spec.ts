import { GetOrganizationInvitationsService } from "../../../src/modules/invitations/application/services/get_organization_invitations_service.js";
import {InvitationStatus} from "../../../src/modules/invitations/domain/invitation_status.js";

describe("GetOrganizationInvitationsService", () => {

    let useCase: any;
    let service: GetOrganizationInvitationsService;

    const actorId = "user-1";
    const orgId = "org-1";

    beforeEach(() => {
        useCase = {
            execute: jest.fn(),
        };

        service = new GetOrganizationInvitationsService(useCase);
    });

    it("should delegate execution to use case and return result", async () => {

        const filters = { status: "PENDING" as InvitationStatus };

        const fakeResult = [
            { id: "inv-1" },
            { id: "inv-2" },
        ];

        useCase.execute.mockResolvedValue(fakeResult);

        const result = await service.executeTx(actorId, orgId, filters);

        expect(useCase.execute)
            .toHaveBeenCalledWith(actorId, orgId, filters);

        expect(result).toBe(fakeResult);
    });

    it("should propagate errors from use case", async () => {

        useCase.execute.mockRejectedValue(new Error("Failed"));

        await expect(
            service.executeTx(actorId, orgId, {})
        ).rejects.toThrow("Failed");
    });

});