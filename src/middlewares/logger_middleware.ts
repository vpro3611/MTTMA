import {NextFunction, Request, Response} from "express";


export const loggerMiddleware = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        console.log(`Request: ${req.method} ${req.originalUrl} -> [${Date.now().toString()}]`)
        next();
    }
}
