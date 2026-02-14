import { JWTTokenService } from "../../../src/Auth/jwt_token_service/token_service.js";

describe("JWTTokenService", () => {

    const ORIGINAL_ENV = process.env;

    let tokenService: JWTTokenService;

    beforeEach(() => {
        jest.resetModules();

        process.env = {
            ...ORIGINAL_ENV,
            ACCESS_TOKEN_SECRET: "access-secret",
            REFRESH_TOKEN_SECRET: "refresh-secret",
        };

        tokenService = new JWTTokenService();
    });

    afterAll(() => {
        process.env = ORIGINAL_ENV;
    });

    /**
     * generateAccessToken
     */
    it("should generate valid access token", () => {

        const token = tokenService.generateAccessToken("user-1");

        const payload = tokenService.verifyAccessToken(token);

        expect(payload.sub).toBe("user-1");
    });

    /**
     * generateRefreshToken
     */
    it("should generate valid refresh token", () => {

        const token = tokenService.generateRefreshToken("user-2");

        const payload = tokenService.verifyRefreshToken(token);

        expect(payload.sub).toBe("user-2");
    });

    /**
     * verifyAccessToken
     */
    it("should throw on invalid access token", () => {

        expect(() =>
            tokenService.verifyAccessToken("invalid-token")
        ).toThrow("Invalid or expired access token");
    });

    it("should throw if access secret missing", () => {

        delete process.env.ACCESS_TOKEN_SECRET;

        expect(() =>
            tokenService.generateAccessToken("user-1")
        ).toThrow("No access token secret provided");

        expect(() =>
            tokenService.verifyAccessToken("some-token")
        ).toThrow("No access token secret provided");
    });

    /**
     * verifyRefreshToken
     */
    it("should throw on invalid refresh token", () => {

        expect(() =>
            tokenService.verifyRefreshToken("invalid-token")
        ).toThrow("Invalid or expired refresh token");
    });

    it("should throw if refresh secret missing", () => {

        delete process.env.REFRESH_TOKEN_SECRET;

        expect(() =>
            tokenService.generateRefreshToken("user-1")
        ).toThrow("No refresh token secret provided");

        expect(() =>
            tokenService.verifyRefreshToken("some-token")
        ).toThrow("No refresh token secret provided");
    });

    it("should not verify access token with refresh secret", () => {
        const token = tokenService.generateAccessToken("user-1");

        process.env.ACCESS_TOKEN_SECRET = "wrong-secret";

        expect(() =>
            tokenService.verifyAccessToken(token)
        ).toThrow();
    });

});
