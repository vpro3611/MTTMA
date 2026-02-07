import {Password} from "./password.js";
import {Email} from "./email.js";
import {UserIsBannedError} from "../errors/user_domain_error.js";


export class User {
    constructor(
        public readonly id: string,
        private email: Email,
        private password: Password,
        private status: "active" | "banned" | "suspended",
        private created_at: Date,
    ) {}

    private checkUserStatus = (userStatus: string) => {
        if (userStatus === "banned") {
            throw new UserIsBannedError();
        }
    }

    static create(email: Email, password: Password) {
        return new User(
            crypto.randomUUID(),
            email,
            password,
            "active",
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