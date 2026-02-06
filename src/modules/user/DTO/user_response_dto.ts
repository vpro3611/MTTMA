import {Email} from "../domain/email.js";

export type UserResponseDto = {
    id: string;
    email: Email;
    status: string;
    created_at: Date;
};