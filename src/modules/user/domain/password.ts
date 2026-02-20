import {
    PasswordDoesNotContainDigitError, PasswordDoesNotContainSpecialSymbolError,
    PasswordDoesNotContainUppercaseLetterError,
    TooLongPasswordError,
    TooShortPasswordError
} from "../errors/password_domain_errors.js";


export class Password {
    private constructor(private readonly value: string){}

    private static readonly MAX_LENGTH = 255;
    private static readonly MIN_LENGTH = 10;
    private static readonly UPPERCASE_REGEX = /[A-Z]/;
    private static readonly LOWERCASE_REGEX = /[a-z]/;
    private static readonly DIGIT_REGEX = /[0-9]/;
    private static readonly SPECIAL_SYMBOL_REGEX = /[!@#$%^&*]/;

    private static checkMaxLength(pass: string) {
        if (pass.length > this.MAX_LENGTH) throw new TooLongPasswordError(this.MAX_LENGTH);
    }

    private static checkMinLength(pass: string) {
        if (pass.length < this.MIN_LENGTH) throw new TooShortPasswordError(this.MIN_LENGTH);
    }

    private static checkUppercase(pass: string) {
        if (!this.UPPERCASE_REGEX.test(pass)) throw new PasswordDoesNotContainUppercaseLetterError();
    }

    private static checkLowercase(pass: string) {
        if (!this.LOWERCASE_REGEX.test(pass)) throw new PasswordDoesNotContainUppercaseLetterError();
    }

    private static checkDigit(pass: string) {
        if (!this.DIGIT_REGEX.test(pass)) throw new PasswordDoesNotContainDigitError();
    }

    private static checkSpecialSymbol(pass: string) {
        if (!this.SPECIAL_SYMBOL_REGEX.test(pass)) throw new PasswordDoesNotContainSpecialSymbolError();
    }

    static validatePlain(plain: string): string {
        const trimmedPass = plain.trim();

        this.checkMaxLength(trimmedPass);
        this.checkMinLength(trimmedPass);
        this.checkUppercase(trimmedPass);
        this.checkLowercase(trimmedPass);
        this.checkDigit(trimmedPass);
        this.checkSpecialSymbol(trimmedPass);

        return trimmedPass;
    }

    static fromHash(hash: string) {
        return new Password(hash);
    }

    getHash() {
        return this.value;
    }
}
