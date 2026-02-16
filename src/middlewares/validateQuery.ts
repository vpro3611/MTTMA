import { Request, Response, NextFunction } from "express";
import {z, ZodTypeAny} from "zod";

export const validateQuery =
    <T extends ZodTypeAny>(schema: T) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                const parsed = schema.parse(req.query);
                Object.assign(req.query, parsed);
                next();
            } catch (err) {
                next(err);
            }
        };
