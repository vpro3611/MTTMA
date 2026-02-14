
import { sha256 } from 'js-sha256';
import {RefreshToken, RefreshTokensRepository} from "../refresh_tokens/refresh_tokens_repository.js";
import {randomUUID} from "node:crypto";
import {JWTTokenService} from "../jwt_token_service/token_service.js";
import {TransactionManager} from "../../modules/transaction_manager/transaction_manager_pg.js";
import {UserRepositoryPG} from "../../modules/user/repository_realization/user_repository_pg.js";
import {HasherBcrypt} from "../../modules/user/infrastructure/hasher_bcrypt.js";
import {RegisterUseCase} from "../../modules/user/application/register_use_case.js";
import {RegisterService} from "../../modules/user/application/service/register.js";
import {LoginUseCase} from "../../modules/user/application/login_use_case.js";
import {LoginService} from "../../modules/user/application/service/login.js";

export class AuthService {
    constructor(private readonly tokenRepo: RefreshToken,
                private readonly jwtService: JWTTokenService,
                private readonly txManager: TransactionManager,
    ) {}

    generateTokens = async (userId: string) => {


        const accessToken = this.jwtService.generateAccessToken(userId);
        const refreshToken = this.jwtService.generateRefreshToken(userId);

        const hash = sha256(refreshToken);

        await this.tokenRepo.create(
            {
                id: randomUUID(),
                userId: userId,
                tokenHash: hash,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }
        );

        return {accessToken, refreshToken};
    }

    refresh = async (refreshToken: string) => {
        const payload = this.jwtService.verifyRefreshToken(refreshToken);

        const hash = sha256(refreshToken);

        const existingToken = await this.tokenRepo.findValidByHash(hash);
        if (!existingToken) {
            throw new Error('Invalid refresh token');
        }

        await this.tokenRepo.revoke(existingToken.userId);

        return this.generateTokens(payload.sub);
    }

    register = async (email: string, password: string) => {
        return this.txManager.runInTransaction(async (client) => {
            const userRepo = new UserRepositoryPG(client);
            const refreshRepo = new RefreshTokensRepository(client);
            const hasher = new HasherBcrypt();

            const registerUC = new RegisterUseCase(userRepo, hasher);
            const registerService = new RegisterService(registerUC);

            const user = await registerService.executeTx(email, password);

            const accessToken = this.jwtService.generateAccessToken(user.id);

            const refreshToken = this.jwtService.generateRefreshToken(user.id);

            const hash = sha256(refreshToken);

            await refreshRepo.create(
                {
                    id: randomUUID(),
                    userId: user.id,
                    tokenHash: hash,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                }
            );

            return {user, accessToken, refreshToken};
        })
    }

    login = async (email: string, password: string) => {
        return this.txManager.runInTransaction(async (client) => {
            const userRepo = new UserRepositoryPG(client);
            const hasher = new HasherBcrypt();
            const refreshRepo = new RefreshTokensRepository(client);
            const loginUC = new LoginUseCase(userRepo, hasher);
            const loginService = new LoginService(loginUC);

            const user = await loginService.executeTx(email, password);

            const accessToken = this.jwtService.generateAccessToken(user.id);
            const refreshToken = this.jwtService.generateRefreshToken(user.id);

            const hash = sha256(refreshToken);

            await refreshRepo.create(
                {
                    id: randomUUID(),
                    userId: user.id,
                    tokenHash: hash,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                }
            );
            return {user, accessToken, refreshToken};
        });
    }

    logout = async (refreshToken: string) => {
        return this.txManager.runInTransaction(async (client) => {
            const refreshRepo = new RefreshTokensRepository(client);

            const hash = sha256(refreshToken);

            const existingToken = await refreshRepo.findValidByHash(hash);

            if (existingToken) {
                await refreshRepo.revoke(existingToken.userId);
                return {message: 'Successfully logged out'};
            }
            return {message: 'Invalid refresh token'};
        });
    }
}