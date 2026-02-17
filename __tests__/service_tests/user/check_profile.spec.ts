import { CheckProfileService } from "../../../src/modules/user/application/service/check_profile.js";

describe("CheckProfileService", () => {

    let mockUseCase: any;
    let service: CheckProfileService;

    beforeEach(() => {

        mockUseCase = {
            execute: jest.fn(),
        };

        service = new CheckProfileService(mockUseCase);
    });

    /**
     * ✅ Should call use case and return result
     */
    it("should call CheckProfileUseCase.execute and return result", async () => {

        const mockResult = {
            id: "user-1",
            email: "test@test.com"
        };

        mockUseCase.execute.mockResolvedValue(mockResult);

        const result = await service.executeTx("actor-1", "target-1");

        expect(mockUseCase.execute)
            .toHaveBeenCalledWith("actor-1", "target-1");

        expect(result).toEqual(mockResult);
    });

    /**
     * ❌ Should propagate error
     */
    it("should propagate error from use case", async () => {

        mockUseCase.execute.mockRejectedValue(
            new Error("Something failed")
        );

        await expect(
            service.executeTx("actor-1", "target-1")
        ).rejects.toThrow("Something failed");
    });
});
