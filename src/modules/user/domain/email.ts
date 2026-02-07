import {InvalidEmailError, TooLongEmail, TooShortEmail} from "../errors/email_domain_errors.js";


export class Email {
    private constructor(private readonly value: string){}

    static create(raw: string) {
        const normalized = raw.toLowerCase().trim();

        if (normalized.length < 5) throw new TooShortEmail(5);
        if (normalized.length > 255) throw new TooLongEmail(255);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalized)) throw new InvalidEmailError();

        return new Email(normalized);
    }

    getValue(): string {
        return this.value;
    }

    equals(other: Email): boolean {
        return this.value === other.value;
    }
}