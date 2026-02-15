import {AccessTokenPayload} from "./payloads/payloads.js";
import {Request} from "express";

declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
        }
    }
}

export interface TypedRequest<T> extends Request {
    body: T,
}