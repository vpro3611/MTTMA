import {AuthService} from "../auth_service/auth_service.js";
import {Request, Response} from "express";

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    refresh = async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({message: "No refresh token provided"});
        }

        try {
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
        } catch (e: unknown) {
            if (e instanceof Error) {
                res.status(401).json({message: e.message});
            }
            res.status(500).json({message: "Internal server error"});
        }
    }

    register = async (req: Request, res: Response) => {
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

    login = async (req: Request, res: Response) => {
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
        const message = await this.authService.logout(refreshToken);
        res.clearCookie("refreshToken").sendStatus(204);
    }
}
