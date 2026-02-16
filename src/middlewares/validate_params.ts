import {ZodSchema} from "zod";
import {NextFunction, Response, Request} from "express";


export const validate_params = <T>(
    schema: ZodSchema<T>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse(req.params);
            req.params = parsed as any;
            next();
        } catch (e) {
            next(e);
        }
    }
}