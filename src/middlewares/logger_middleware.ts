import {NextFunction, Request, Response} from "express";


export const loggerMiddleware = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const timestamp = new Date().toISOString();
        console.log(`Request: ${req.method} ${req.originalUrl} -> [${timestamp}]`)
        next();
    }
}
