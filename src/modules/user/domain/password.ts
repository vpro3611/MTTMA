import {
    PasswordDoesNotContainDigitError, PasswordDoesNotContainSpecialSymbolError,
    PasswordDoesNotContainUppercaseLetterError,
    TooLongPasswordError,
    TooShortPasswordError
} from "../errors/password_domain_errors.js";


export class Password {
    private constructor(private readonly value: string){}

    static validatePlain(plain: string): string {
        const trimmedPass = plain.trim();
        if (trimmedPass.length < 10) throw new TooShortPasswordError(10);
        if (trimmedPass.length > 255) throw new TooLongPasswordError(255);
        if (!/[A-Z]/.test(trimmedPass)) throw new PasswordDoesNotContainUppercaseLetterError();
        if (!/[0-9]/.test(trimmedPass)) throw new PasswordDoesNotContainDigitError();
        if (!/[!@#$%^&*]/.test(trimmedPass)) throw new PasswordDoesNotContainSpecialSymbolError();

        return trimmedPass;
    }

    static fromHash(hash: string) {
        return new Password(hash);
    }

    getHash() {
        return this.value;
    }
}
