import {NameContainsForbiddenSymbols, NameTooLongError, NameTooShortError} from "../errors/name_domain_errors.js";


export class Name {
    private constructor(private readonly value: string){}

    private static readonly FORBIDDEN_SYMBOLS = /[!@#$%^&*]/;
    private static readonly MAX_LENGTH = 255;
    private static readonly MIN_LENGTH = 3;

    private static checkMinLength(name: string) {
        if (name.length < this.MIN_LENGTH) throw new NameTooShortError(this.MIN_LENGTH);
    }

    private static checkMaxLength(name: string) {
        if (name.length > this.MAX_LENGTH) throw new NameTooLongError(this.MAX_LENGTH);
    }

    private static checkForbiddenSymbols(name: string) {
        if (this.FORBIDDEN_SYMBOLS.test(name)) throw new NameContainsForbiddenSymbols();
    }

    static validate = (name: string) => {
        const trimmedName = name.trim();

        this.checkMinLength(trimmedName);
        this.checkMaxLength(trimmedName);
        this.checkForbiddenSymbols(trimmedName);

        return new Name(
            trimmedName
        );
    };

    getValue = () => this.value;
}