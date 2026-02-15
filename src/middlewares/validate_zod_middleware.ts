import {NextFunction, Request, Response} from "express";
import { ZodSchema } from "zod";

export const validateZodMiddleware = <T>(
    schema: ZodSchema<T>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse(req.body);
            req.body = parsed;
            next();
        } catch (e) {
            next(e);
        }
    };
};
