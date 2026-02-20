import {InvalidEmailError, TooLongEmail, TooShortEmail} from "../errors/email_domain_errors.js";


export class Email {
    private constructor(private readonly value: string){}

    private static readonly MAX_LENGTH = 255;
    private static readonly MIN_LENGTH = 5;
    private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    private static checkMaxLength(email: string) {
        if (email.length > this.MAX_LENGTH) throw new TooLongEmail(this.MAX_LENGTH);
    }

    private static checkMinLength(email: string) {
        if (email.length < this.MIN_LENGTH) throw new TooShortEmail(this.MIN_LENGTH);
    }

    private static checkEmailRegex(email: string) {
        if (!this.EMAIL_REGEX.test(email)) throw new InvalidEmailError();
    }


    static create(raw: string) {
        const normalized = raw.toLowerCase().trim();

        this.checkMaxLength(normalized);
        this.checkMinLength(normalized);
        this.checkEmailRegex(normalized);

        return new Email(normalized);
    }

    getValue(): string {
        return this.value;
    }

    equals(other: Email): boolean {
        return this.value === other.value;
    }
}