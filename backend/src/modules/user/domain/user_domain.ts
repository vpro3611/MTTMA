import {Password} from "./password.js";
import {Email} from "./email.js";
import {UserIsBannedError} from "../errors/user_domain_error.js";
import {UserStatus} from "./user_status.js";


export class User {
    constructor(
        public readonly id: string,
        private email: Email,
        private password: Password,
        private status: UserStatus,
        private created_at: Date,
    ) {}

     checkUserStatus = (userStatus: UserStatus) => {
        if (userStatus === UserStatus.BANNED) {
            throw new UserIsBannedError();
        }
    }

    ensureIsActive = () => {
        if (this.status !== UserStatus.ACTIVE) {
            throw new Error("User is not active, cannot perform action");
        }
    }


    static create(email: Email, password: Password) {
        return new User(
            crypto.randomUUID(),
            email,
            password,
            UserStatus.ACTIVE,
            new Date()
        );
    }


    changePassword = (newPassword: Password) => {
        this.checkUserStatus(this.status)
        this.password = newPassword;
    }

    changeEmail = (newEmail: Email) => {
        this.checkUserStatus(this.status)
        this.email = newEmail;
    }

    getEmail = () => this.email;

    getStatus = () => this.status;

    getCreatedAt = () => this.created_at;

    getPasswordHash = () => this.password.getHash();
}