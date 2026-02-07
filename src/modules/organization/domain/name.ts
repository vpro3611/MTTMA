import {NameContainsForbiddenSymbols, NameTooLongError, NameTooShortError} from "../errors/name_domain_errors.js";


export class Name {
    private constructor(private readonly value: string){}

    static validate = (name: string) => {
        const trimmedName = name.trim();

        if (trimmedName.length < 3) throw new NameTooShortError(3);
        if (trimmedName.length > 255) throw new NameTooLongError(255);
        if (/[!@#$%^&*]/.test(trimmedName)) throw new NameContainsForbiddenSymbols();

        return new Name(
            trimmedName
        );
    };

    getValue = () => this.value;
}