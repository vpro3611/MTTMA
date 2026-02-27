import { AuthService } from "../../../backend/src/Auth/auth_service/auth_service.js";
import { InvalidRefreshTokenError } from "../../../backend/src/http_errors/token_errors.js";
import { RefreshTokensRepository } from "../../../backend/src/Auth/refresh_tokens/refresh_tokens_repository.js";

jest.mock("../../../backend/src/Auth/refresh_tokens/refresh_tokens_repository.js");

describe("AuthService", () => {

    let tokenRepo: any;
    let jwtService: any;
    let txManager: any;

    let mockRefreshRepoInstance: any;

    let authService: AuthService;

    beforeEach(() => {

        jest.clearAllMocks();

        /**
         * Mock instance that will be returned
         * when new RefreshTokensRepository() is called
         */
        mockRefreshRepoInstance = {
            create: jest.fn(),
            findValidByHash: jest.fn(),
            revoke: jest.fn(),
            revokeByHash: jest.fn(),
        };

        (RefreshTokensRepository as jest.Mock)
            .mockImplementation(() => mockRefreshRepoInstance);

        tokenRepo = {
            create: jest.fn(),
            findValidByHash: jest.fn(),
            revoke: jest.fn(),
            revokeByHash: jest.fn(),
        };

        jwtService = {
            generateAccessToken: jest.fn().mockReturnValue("access-token"),
            generateRefreshToken: jest.fn().mockReturnValue("refresh-token"),
            verifyRefreshToken: jest.fn().mockReturnValue({ sub: "user-1" }),
        };

        txManager = {
            runInTransaction: jest.fn((callback) => {
                const fakeClient = {}; // безопасно, repo замокан
                return callback(fakeClient);
            }),
        };

        authService = new AuthService(
            tokenRepo,   // используется в generateTokens и refresh
            jwtService,
            txManager
        );
    });

    /**
     * generateTokens
     */
    it("should generate tokens and save hashed refresh token", async () => {

        await authService.generateTokens("user-1");

        expect(jwtService.generateAccessToken)
            .toHaveBeenCalledWith("user-1");

        expect(jwtService.generateRefreshToken)
            .toHaveBeenCalledWith("user-1");

        expect(tokenRepo.create).toHaveBeenCalled();
    });

    /**
     * refresh
     */
    it("should refresh tokens when valid", async () => {

        tokenRepo.findValidByHash.mockResolvedValue({
            id: "token-id",
            userId: "user-1",
        });

        const result = await authService.refresh("refresh-token");

        expect(jwtService.verifyRefreshToken)
            .toHaveBeenCalledWith("refresh-token");

        expect(tokenRepo.findValidByHash)
            .toHaveBeenCalled();

        expect(tokenRepo.revoke)
            .toHaveBeenCalledWith("token-id");

        expect(result.accessToken).toBe("access-token");
        expect(result.refreshToken).toBe("refresh-token");
    });

    it("should throw if refresh token invalid", async () => {

        tokenRepo.findValidByHash.mockResolvedValue(null);

        await expect(
            authService.refresh("invalid")
        ).rejects.toBeInstanceOf(
            InvalidRefreshTokenError
        );
    });

    /**
     * logout
     */
    it("should revoke refresh token on logout", async () => {

        await authService.logout("refresh-token");

        expect(txManager.runInTransaction).toHaveBeenCalled();

        expect(mockRefreshRepoInstance.revokeByHash)
            .toHaveBeenCalled();
    });

});
