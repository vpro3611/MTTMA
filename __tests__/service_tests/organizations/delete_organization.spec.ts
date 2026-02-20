import {DeleteOrganization} from "../../../src/modules/organization/application/service/delete_organization.js";

describe("DeleteOrganization (unit)", () => {

    const ORG_ID = "org-1";
    const ACTOR_ID = "user-1";

    let deleteUseCase: any;
    let service: DeleteOrganization;

    beforeEach(() => {
        deleteUseCase = {
            execute: jest.fn()
        };

        service = new DeleteOrganization(deleteUseCase);
    });

    it("should delegate to DeleteOrganizationUseCase", async () => {

        const fakeResult = { id: ORG_ID };

        deleteUseCase.execute.mockResolvedValue(fakeResult);

        const result = await service.executeTx(ACTOR_ID, ORG_ID);

        expect(deleteUseCase.execute)
            .toHaveBeenCalledWith(ACTOR_ID, ORG_ID);

        expect(result).toEqual(fakeResult);
    });

});
