import { CreateOrgServ} from "../../../src/modules/organization/controllers/services/create_organization_serv.js";

import { CreateOrganizationWithAudit } from
        "../../../src/modules/organization/application/service/create_with_audit.js";

jest.mock(
    "../../../src/modules/organization/application/service/create_with_audit.js",
    () => ({
        CreateOrganizationWithAudit: jest.fn(),
    })
);

describe("CreateOrgServ", () => {

    let txManager: any;
    let mockExecute: jest.Mock;
    let service: CreateOrgServ;

    beforeEach(() => {

        mockExecute = jest.fn().mockResolvedValue({
            id: "org-1",
            name: "Test Org"
        });

        (CreateOrganizationWithAudit as jest.Mock)
            .mockImplementation(() => ({
                executeTx: mockExecute
            }));

        txManager = {
            runInTransaction: jest.fn((callback) => callback({}))
        };

        service = new CreateOrgServ(txManager);
    });

    it("should execute create organization inside transaction", async () => {

        const result = await service.createOrgS("Test Org", "user-1");

        // проверяем что транзакция запущена
        expect(txManager.runInTransaction).toHaveBeenCalled();

        // проверяем что executeTx вызван
        expect(mockExecute).toHaveBeenCalledWith("Test Org", "user-1");

        // проверяем что результат возвращается
        expect(result).toEqual({
            id: "org-1",
            name: "Test Org"
        });
    });

});
