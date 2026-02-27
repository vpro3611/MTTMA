import { SearchOrganization } from "../../../backend/src/modules/organization/application/service/search_organization.js";

describe("SearchOrganization (service proxy)", () => {

    let mockUseCase: any;
    let service: SearchOrganization;

    beforeEach(() => {

        mockUseCase = {
            execute: jest.fn()
        };

        service = new SearchOrganization(mockUseCase);
    });

    it("should call use case and return result", async () => {

        const mockResult = [{ id: "org-1" }];

        mockUseCase.execute.mockResolvedValue(mockResult);

        const result = await service.executeTx(
            "actor-id",
            { query: "test" }
        );

        expect(mockUseCase.execute)
            .toHaveBeenCalledWith("actor-id", { query: "test" });

        expect(result).toEqual(mockResult);
    });

    it("should propagate error from use case", async () => {

        mockUseCase.execute.mockRejectedValue(
            new Error("fail")
        );

        await expect(
            service.executeTx("actor-id", { query: "test" })
        ).rejects.toThrow("fail");
    });

});
