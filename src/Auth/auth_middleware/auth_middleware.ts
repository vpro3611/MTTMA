import {NextFunction, Request, Response} from "express";
import {JWTTokenService} from "../jwt_token_service/token_service.js";


export const createAuthMiddleware = (jwtService: JWTTokenService) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({message: "Unauthorized"});
        }

        const [type, token] = authHeader.split(" ");

        if (type !== "Bearer" || !token) {
            return res.status(401).json({message: "Unauthorized"});
        }

        try {
            const payload = jwtService.verifyAccessToken(token);
            req.user = payload;

            next();
        } catch (e) {
            return res.status(401).json({message: "Invalid or expired token"});
        }
    }
}