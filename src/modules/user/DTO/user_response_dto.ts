import {Email} from "../domain/email.js";

export type UserResponseDto = {
    id: string;
    email: string;
    status: string;
    created_at: Date;
    password?: string;
};