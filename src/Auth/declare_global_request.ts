import {AccessTokenPayload} from "./payloads/payloads.js";


declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
        }
    }
}