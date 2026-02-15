import {AuthService} from "../auth_service/auth_service.js";
import {Request, Response} from "express";
import {MissingRefreshTokenError} from "../../http_errors/token_errors.js";

import {z} from "zod";
import {TypedRequest} from "../declare_global_request.js";

export const RegisterSchema = z.object({
    email: z.string().email().min(5).max(255),
    password: z.string().min(10).max(255),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
    email: z.string().email().min(5).max(255),
    password: z.string().min(10).max(255),
})

export type LoginInput = z.infer<typeof LoginSchema>;

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    refresh = async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            throw new MissingRefreshTokenError();
        }


        const tokens = await this.authService.refresh(refreshToken);

        res
            .cookie("refreshToken", tokens.refreshToken,
                {
                    httpOnly: true,
                    secure: process.env.NODE_ENV! === "production",
                    sameSite: process.env.NODE_ENV! === "production" ? "strict" : "lax",
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                })
            .json({accessToken: tokens.accessToken});
    };

    register = async (req: TypedRequest<RegisterInput>, res: Response) => {
        const {email, password} = req.body;
        const tokens = await this.authService.register(email, password);

        res
            .cookie("refreshToken", tokens.refreshToken,
                {
                    httpOnly: true,
                    secure: process.env.NODE_ENV! === "production",
                    sameSite: process.env.NODE_ENV! === "production" ? "strict" : "lax",
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                })
            .status(201)
            .json(
                {
                    accessToken: tokens.accessToken,
                    user: tokens.user,
                }
            );
    }

    login = async (req: TypedRequest<LoginInput>, res: Response) => {
        const {email, password} = req.body;
        const tokens = await this.authService.login(email, password);

        res
            .cookie("refreshToken", tokens.refreshToken,
                {
                    httpOnly: true,
                    secure: process.env.NODE_ENV! === "production",
                    sameSite: process.env.NODE_ENV! === "production" ? "strict" : "lax",
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                })
            .status(200)
            .json(
                {
                    accessToken: tokens.accessToken,
                    user: tokens.user,
                }
            );
    }

    logout = async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            throw new MissingRefreshTokenError();
        }

        await this.authService.logout(refreshToken);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV! === "production",
            sameSite: process.env.NODE_ENV! === "production" ? "strict" : "lax",
        });

        res.status(204).send();
    }
}
